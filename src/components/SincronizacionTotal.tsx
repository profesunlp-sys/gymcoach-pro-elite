import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { collection, getDocs, doc, writeBatch, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface SincronizacionTotalProps {
  onComplete: (count: number) => void;
  onCancel: () => void;
}

export const SincronizacionTotal: React.FC<SincronizacionTotalProps> = ({ onComplete, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    created: number;
    updated: number;
    duplicates: number;
    totalRows: number;
  } | null>(null);

  const normalizeText = (text: unknown): string => {
    if (text === null || text === undefined) return '';
    return text.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const cleanName = (rawName: string): string => {
    let name = rawName.replace(/^dni\s*/i, '').replace(/^\d+\s*/, '').trim();
    return name.replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const extractDNI = (rawCell: unknown): string | null => {
    const str = String(rawCell ?? '');
    const match = str.match(/\b(\d{7,9})\b/);
    return match ? match[1] : null;
  };

  const isPaid = (cell: unknown): boolean => {
    const val = normalizeText(cell);
    return val.includes('pago') && !val.includes('no pago') && !val.includes('nopago');
  };

  const extractGroupFromTramite = (tramite: string): string => {
    const match = tramite.match(/(lunes|martes|miércoles|jueves|viernes|sábados).*?de\s*(\d{1,2}(?::\d{2})?)\s*(?:a|hs|h)[:\-s]*(\d{1,2}(?::\d{2})?)?/i);
    if (match) {
      const dias = match[1];
      const start = match[2];
      const end = match[3] || '';
      return `${dias.toUpperCase()} ${start}-${end}`.trim();
    }
    return 'SIN GRUPO';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setStats(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (rows.length < 2) throw new Error('El archivo está vacío.');

        // Detectar columnas
        let headerRowIndex = -1;
        let colDNI = -1;
        let colNombre = -1;
        let colTramite = -1;
        const monthCols: { monthName: string, index: number }[] = [];

        const monthsList = ["Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre"];

        // Buscar en las primeras 20 filas la fila de cabecera que contiene nombres/apellidos o alumnos/gimnastas
        for (let i = 0; i < Math.min(rows.length, 20); i++) {
          const row = rows[i];
          if (!row) continue;
          
          const normalizedRow = row.map((c: any) => normalizeText(c));
          const tempNombre = normalizedRow.findIndex((h: string) => h && (h.includes('nombre') || h.includes('apellido') || h.includes('alumno') || h.includes('gimnasta')));
          
          if (tempNombre !== -1) {
            headerRowIndex = i;
            colNombre = tempNombre;
            colDNI = normalizedRow.findIndex((h: string) => h && (h.includes('dni') || h.includes('documento') || h.includes('nro')));
            colTramite = normalizedRow.findIndex((h: string) => h && (h.includes('tramite') || h.includes('actividad') || h.includes('detalle') || h.includes('concepto') || h.includes('horario') || h.includes('grupo')));
            
            // Detectar dinámicamente todas las columnas de meses presentes en esta cabecera
            normalizedRow.forEach((cellHeader, colIdx) => {
              if (!cellHeader) return;
              const foundMonth = monthsList.find(m => cellHeader.includes(normalizeText(m)));
              if (foundMonth) {
                if (!monthCols.some(mc => mc.index === colIdx)) {
                  monthCols.push({ monthName: foundMonth, index: colIdx });
                }
              }
            });
            break;
          }
        }

        if (headerRowIndex === -1 || colNombre === -1) {
          throw new Error('No se encontró la columna de Nombres.');
        }

        const batch = writeBatch(db);
        let createdCount = 0;
        let updatedCount = 0;
        let duplicatesCount = 0;
        let totalProcessed = 0;

        // Obtener alumnos existentes para evitar duplicados por DNI
        const alumnosSnap = await getDocs(collection(db, 'alumnos'));
        const existingAlumnosByDNI = new Map<string, string>(); // DNI -> ID
        const existingAlumnosByName = new Map<string, string>(); // NombreNorm -> ID
        
        alumnosSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.dni) existingAlumnosByDNI.set(String(data.dni), doc.id);
          existingAlumnosByName.set(normalizeText(data.nombre), doc.id);
        });

        for (let i = headerRowIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[colNombre]) continue;

          const rawName = String(row[colNombre]);
          const dni = extractDNI(row[colDNI !== -1 ? colDNI : colNombre]);
          const nombreLimpio = cleanName(rawName);
          const tramite = colTramite !== -1 ? String(row[colTramite]) : '';
          
          // Verificar si es Gimnasia Artística (Filtro Flexible)
          const tramiteNorm = normalizeText(tramite);
          const nombreNorm = normalizeText(rawName);
          const esGimnasia = 
            tramiteNorm.includes('gimnasia') || 
            tramiteNorm.includes('artistica') || 
            tramiteNorm.includes('gaf') || 
            tramiteNorm.includes('gai') ||
            nombreNorm.includes('gimnasia'); // Por seguridad

          if (!esGimnasia) continue;

          totalProcessed++;

          // Determinar ID existente o crear nuevo
          let alumnoId = '';
          let isNew = false;

          if (dni && existingAlumnosByDNI.has(dni)) {
            alumnoId = existingAlumnosByDNI.get(dni)!;
          } else if (existingAlumnosByName.has(normalizeText(nombreLimpio))) {
            alumnoId = existingAlumnosByName.get(normalizeText(nombreLimpio))!;
            // Si encontramos por nombre y hay DNI, actualizamos el mapa
            if (dni) existingAlumnosByDNI.set(dni, alumnoId);
          } else {
            // Nuevo alumno
            alumnoId = doc(collection(db, 'alumnos')).id;
            isNew = true;
          }

          if (isNew) duplicatesCount++; // Contamos como "creado" en la estadística final
          else updatedCount++;

          // Preparar pagos dinámicamente para todos los meses detectados
          const nuevosPagos: any[] = [];
          const currentYear = 2026; // Año según la temporada

          monthCols.forEach(col => {
            if (isPaid(row[col.index])) {
              nuevosPagos.push({
                mes: col.monthName,
                anio: currentYear,
                fechaPago: new Date().toISOString(),
                importado: true,
                categoria: 'Gimnasia Artística Infantil'
              });
            }
          });

          // Extraer grupo
          const grupoExtraido = extractGroupFromTramite(tramite);

          // Construir documento
          const alumnoData: any = {
            nombre: nombreLimpio,
            actividad: 'Gimnasia Artística Infantil',
            updatedAt: new Date().toISOString()
          };

          if (isNew) {
            alumnoData.grupo = grupoExtraido;
          }

          if (dni) {
            alumnoData.dni = dni;
          }

          if (nuevosPagos.length > 0) {
            // Si es nuevo, inicializamos array. Si existe, hacemos merge simple (reemplazamos año 2026)
            if (isNew) {
              alumnoData.pagosMensuales = nuevosPagos;
            } else {
              // Para existentes, usamos lógica de actualización compleja o simplemente agregamos si no existe
              // Para simplificar esta versión "Total", vamos a sobreescribir los pagos de 2026
              // Nota: En producción real se haría un merge más cuidadoso
              alumnoData.pagosMensuales = arrayUnion(...nuevosPagos);
            }
          }

          if (isNew) {
            batch.set(doc(db, 'alumnos', alumnoId), alumnoData);
          } else {
            batch.update(doc(db, 'alumnos', alumnoId), alumnoData);
          }
        }

        await batch.commit();

        setStats({
          created: duplicatesCount, // Reutilizamos variable para "Nuevos creados"
          updated: updatedCount,
          duplicates: 0,
          totalRows: totalProcessed
        });

      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="bg-ios-blue text-white p-3 rounded-xl"><span className="material-icons-outlined">sync_alt</span></div>
          <button onClick={onCancel} className="text-secondary"><span className="material-icons-outlined">close</span></button>
        </div>

        <div>
          <h2 className="text-xl font-bold">Sincronización Total</h2>
          <p className="text-xs text-secondary">Reemplaza y actualiza la base de datos con el Excel de la oficina.</p>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-bold">{error}</div>}

        {stats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-ios-green/5 p-4 rounded-2xl text-center border border-ios-green/10">
                <div className="text-3xl font-black text-ios-green">{stats.created}</div>
                <div className="text-[9px] font-bold text-secondary uppercase">Nuevos Alumnos</div>
              </div>
              <div className="bg-ios-blue/5 p-4 rounded-2xl text-center border border-ios-blue/10">
                <div className="text-3xl font-black text-ios-blue">{stats.updated}</div>
                <div className="text-[9px] font-bold text-secondary uppercase">Actualizados</div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <p className="text-xs text-gray-600">Total filas procesadas: <b>{stats.totalRows}</b></p>
            </div>

            <div className="pt-4 flex gap-3">
              <button onClick={onCancel} className="flex-1 py-4 bg-ios-gray text-black rounded-2xl font-bold text-sm">Cerrar</button>
              <button onClick={() => onComplete(stats.created + stats.updated)} className="flex-1 py-4 bg-ios-blue text-white rounded-2xl font-bold text-sm">Aceptar</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors">
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={isProcessing} className="hidden" id="fileInput" />
              <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                <span className="material-icons-outlined text-4xl text-gray-400 mb-2">upload_file</span>
                <span className="text-sm font-bold text-gray-600">Toca para seleccionar el Excel</span>
                <span className="text-[10px] text-gray-400 mt-1">Solo archivos de Gimnasia Artística</span>
              </label>
            </div>
            {isProcessing && <p className="text-center text-ios-blue font-bold text-sm animate-pulse">Procesando...</p>}
            <button onClick={onCancel} className="w-full py-4 bg-ios-gray text-black rounded-2xl font-bold text-sm">Cancelar</button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
