import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { PagoGimnasiaRecord, AlumnoRecord } from '../types';
import { importExcelPagosFromSheet, formatExcelDate, ExcelImportResult } from '../services/firestoreService';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface ExcelImportPaymentsTabProps {
  existingPayments: PagoGimnasiaRecord[];
  onImportCompleted?: (result: ExcelImportResult) => void;
}

interface ParsedPreviewRow {
  rowNumber: number;
  apellido_nombre: string;
  tramite: string;
  codigo: string;
  fecha_pago: string;
  dni: string;
  importe: number;
  cuotas: string;
  observacion: string;
  mes: string;
  id: string;
  isDuplicate: boolean;
  isValidGimnasia: boolean;
}

export const ExcelImportPaymentsTab: React.FC<ExcelImportPaymentsTabProps> = ({
  existingPayments,
  onImportCompleted,
}) => {
  const [fileName, setFileName] = useState<string>('');
  const [rawRows, setRawRows] = useState<any[][] | null>(null);
  const [sheetNameUsed, setSheetNameUsed] = useState<string>('');
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<ParsedPreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [filterPreview, setFilterPreview] = useState<'todos' | 'nuevos' | 'duplicados'>('todos');

  // Existing payment IDs map for fast lookup
  const existingPaymentsMap = React.useMemo(() => {
    const map = new Map<string, PagoGimnasiaRecord>();
    existingPayments.forEach((p) => {
      map.set(p.id, p);
    });
    return map;
  }, [existingPayments]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setImportResult(null);
    setFileName(file.name);
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

      setAvailableSheets(workbook.SheetNames);

      // Usar la hoja CONTROL GENERAL
      const targetSheetName = workbook.SheetNames.find(
        (name) => name.trim().toUpperCase() === 'CONTROL GENERAL'
      );

      if (!targetSheetName) {
        throw new Error(
          `No se encontró la hoja "CONTROL GENERAL". Las hojas disponibles en el archivo son: ${workbook.SheetNames.join(
            ', '
          )}`
        );
      }

      setSheetNameUsed(targetSheetName);
      const worksheet = workbook.Sheets[targetSheetName];
      const sheetData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      setRawRows(sheetData);
      processPreview(sheetData);
    } catch (err: any) {
      console.error('Error al leer Excel:', err);
      setErrorMsg(err.message || 'Error al procesar el archivo Excel.');
      setRawRows(null);
      setPreviewRows([]);
    } finally {
      setLoading(false);
    }
  };

  const processPreview = (data: any[][]) => {
    // Usar datos desde la fila 3 (índice 2)
    const rows = data.slice(2);

    const normalizeStr = (s: any) =>
      String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

    const parsed: ParsedPreviewRow[] = [];

    rows.forEach((row, idx) => {
      if (!row || row.length === 0) return;

      const apellido_nombre = String(row[0] || '').trim();
      const tramite = String(row[1] || '').trim();
      const fechaPagoRaw = row[2];
      const dni = String(row[3] || '').trim();
      const montoRaw = row[4];
      const cuotas = row[5] !== undefined ? String(row[5]).trim() : '1';
      const observacion = row[6] !== undefined ? String(row[6]).trim() : '';
      const mes = String(row[7] || '').trim();

      const isValidGimnasia = normalizeStr(tramite).startsWith('gimnasia artistica infantil');

      if (!isValidGimnasia) return;

      const codeMatch = tramite.match(/\[(.*?)\]/);
      const codigo = codeMatch ? codeMatch[1].trim() : 'GIM-ART';

      const sanitizeId = (str: string) => str.replace(/[\/\\]/g, '-').replace(/\s+/g, '_').trim();
      const id = `${sanitizeId(codigo)}_${sanitizeId(dni)}_${sanitizeId(mes)}`;

      const isDuplicate = existingPaymentsMap.has(id);
      const fecha_pago = formatExcelDate(fechaPagoRaw);
      const importe =
        typeof montoRaw === 'number'
          ? montoRaw
          : parseFloat(String(montoRaw || '0').replace(/[^0-9.-]+/g, '')) || 0;

      parsed.push({
        rowNumber: idx + 3,
        apellido_nombre,
        tramite,
        codigo,
        fecha_pago,
        dni,
        importe,
        cuotas,
        observacion,
        mes,
        id,
        isDuplicate,
        isValidGimnasia,
      });
    });

    setPreviewRows(parsed);
  };

  const handleExecuteImport = async () => {
    if (!rawRows) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await importExcelPagosFromSheet(rawRows, existingPaymentsMap);
      setImportResult(res);
      if (onImportCompleted) {
        onImportCompleted(res);
      }
    } catch (err: any) {
      console.error('Error importando pagos:', err);
      setErrorMsg(err.message || 'Error al guardar los registros en Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const newCount = previewRows.filter((r) => !r.isDuplicate).length;
  const duplicateCount = previewRows.filter((r) => r.isDuplicate).length;

  const filteredPreviewList = previewRows.filter((r) => {
    if (filterPreview === 'nuevos') return !r.isDuplicate;
    if (filterPreview === 'duplicados') return r.isDuplicate;
    return true;
  });

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Introduction Card */}
      <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#003640] border border-[#4cd7f6]/40 flex items-center justify-center text-[#4cd7f6]">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Importación Oficial de Pagos (.xlsx Oficina de Cobros)
            </h3>
            <p className="text-xs text-[#c4c5d5]">
              Lectura directa en el navegador con SheetJS · Hoja <span className="font-mono text-[#4cd7f6]">CONTROL GENERAL</span> (desde fila 3)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-[#8e909f]">
          <div className="p-3 rounded-xl bg-[#0b1326] border border-[#222a3d] space-y-1">
            <span className="font-bold text-[#dae2fd] block">Reglas de Extracción & Filtro:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Filtra SOLO trámites que comiencen con <strong className="text-white">"Gimnasia Artística Infantil"</strong>.</li>
              <li>Extrae el código entre corchetes <code className="text-[#4cd7f6]">[003-011-005]</code>.</li>
              <li>ID único: <code className="text-[#4cd7f6]">codigo_dni_mes</code> para evitar pagos duplicados.</li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-[#0b1326] border border-[#222a3d] space-y-1">
            <span className="font-bold text-[#dae2fd] block">Vinculación por DNI & Alertas:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Por cada pago nuevo genera una alerta en <span className="font-mono text-[#4cd7f6]">alertasPagos</span>.</li>
              <li>Alerta visible para profesores con: <strong className="text-white">Nombre Apellido - Mes - DNI</strong>.</li>
              <li>Montos y observaciones quedan reservados estrictamente para la Coordinación.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* File Upload Dropzone */}
      <div className="p-6 rounded-2xl bg-[#131b2e] border-2 border-dashed border-[#4cd7f6]/40 hover:border-[#4cd7f6] transition-colors text-center relative">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-[#003640] border border-[#4cd7f6]/40 flex items-center justify-center text-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.25)]">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-white">
            {fileName ? fileName : 'Seleccioná o arrastrá el archivo .xlsx de la Oficina de Cobros'}
          </p>
          <p className="text-xs text-[#8e909f]">
            Soporta planillas Excel del sistema administrativo UNLP
          </p>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-bold">Error durante la importación:</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Import Result Summary Card */}
      {importResult && (
        <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-black text-white">
              ¡Importación completada con éxito en Firestore!
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#0b1326]/60 border border-emerald-500/20">
              <span className="text-[#8e909f] block text-[10px] uppercase">Nuevos Pagos</span>
              <span className="text-lg font-black text-emerald-400">
                +{importResult.newImportedCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b1326]/60 border border-emerald-500/20">
              <span className="text-[#8e909f] block text-[10px] uppercase">Alertas Creadas</span>
              <span className="text-lg font-black text-[#4cd7f6]">
                +{importResult.newAlerts.length}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b1326]/60 border border-emerald-500/20">
              <span className="text-[#8e909f] block text-[10px] uppercase">Duplicados Omitidos</span>
              <span className="text-lg font-black text-amber-300">
                {importResult.duplicateCount}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0b1326]/60 border border-emerald-500/20">
              <span className="text-[#8e909f] block text-[10px] uppercase">Filas Filtradas</span>
              <span className="text-lg font-black text-white">
                {importResult.filteredCount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Preview Table & Confirmation Action */}
      {previewRows.length > 0 && !importResult && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d]">
            <div>
              <span className="text-xs text-[#8e909f]">
                Hoja procesada: <strong className="text-white">{sheetNameUsed}</strong>
              </span>
              <div className="flex items-center gap-3 mt-1 text-xs">
                <span className="text-emerald-400 font-bold">
                  {newCount} nuevos a guardar
                </span>
                <span className="text-[#8e909f]">·</span>
                <span className="text-amber-300 font-bold">
                  {duplicateCount} ya existentes (sin duplicados)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#0b1326] p-1 rounded-xl border border-[#222a3d] text-xs">
                <button
                  onClick={() => setFilterPreview('todos')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    filterPreview === 'todos' ? 'bg-[#4cd7f6] text-[#001f26]' : 'text-[#8e909f]'
                  }`}
                >
                  Todos ({previewRows.length})
                </button>
                <button
                  onClick={() => setFilterPreview('nuevos')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    filterPreview === 'nuevos' ? 'bg-[#4cd7f6] text-[#001f26]' : 'text-[#8e909f]'
                  }`}
                >
                  Nuevos ({newCount})
                </button>
                <button
                  onClick={() => setFilterPreview('duplicados')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    filterPreview === 'duplicados' ? 'bg-[#4cd7f6] text-[#001f26]' : 'text-[#8e909f]'
                  }`}
                >
                  Existentes ({duplicateCount})
                </button>
              </div>

              <button
                onClick={handleExecuteImport}
                disabled={loading || newCount === 0}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-[0_0_15px_rgba(76,215,246,0.3)] shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Importando a Firestore...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Confirmar e Importar ({newCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl bg-[#131b2e] border border-[#222a3d] max-h-96">
            <table className="w-full text-left text-xs text-[#dae2fd] border-collapse min-w-[750px]">
              <thead className="bg-[#171f33] text-[10px] font-bold uppercase tracking-wider text-[#8e909f] border-b border-[#222a3d] sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">Fila</th>
                  <th className="py-2.5 px-3">Gimnasta / DNI</th>
                  <th className="py-2.5 px-3">Trámite & Código</th>
                  <th className="py-2.5 px-3">Mes</th>
                  <th className="py-2.5 px-3 text-right">Monto</th>
                  <th className="py-2.5 px-3">Fecha Pago</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222a3d]">
                {filteredPreviewList.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-[#171f33]/40 transition-colors ${
                      row.isDuplicate ? 'opacity-60 bg-[#0b1326]/40' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-mono text-[11px] text-[#8e909f]">
                      #{row.rowNumber}
                    </td>
                    <td className="py-2 px-3">
                      <p className="font-bold text-white">{row.apellido_nombre}</p>
                      <span className="text-[10px] text-amber-300 font-mono">DNI: {row.dni}</span>
                    </td>
                    <td className="py-2 px-3 max-w-[220px]">
                      <p className="truncate text-white text-[11px]">{row.tramite}</p>
                      <span className="text-[10px] font-mono text-[#4cd7f6]">Cod: {row.codigo}</span>
                    </td>
                    <td className="py-2 px-3 text-[#4cd7f6] font-semibold whitespace-nowrap">
                      {row.mes}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                      ${row.importe.toLocaleString('es-AR')}
                    </td>
                    <td className="py-2 px-3 text-[11px] text-[#c4c5d5] whitespace-nowrap">
                      {row.fecha_pago}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {row.isDuplicate ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                          Duplicado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          Nuevo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
