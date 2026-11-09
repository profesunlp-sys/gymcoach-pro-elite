import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  AlumnoRecord,
  PagoGimnasiaRecord,
  AlertaPagoRecord,
  AsistenciaRecord,
  ProfesorGimnasiaRecord,
  AsignacionGimnasiaRecord,
  ApparatusScore,
} from '../types';

export const COLLECTIONS = {
  ALUMNOS: 'alumnos',
  PAGOS: 'pagosGimnasia',
  ALERTAS: 'alertasPagos',
  ASISTENCIAS: 'asistencias',
  PROFESORES: 'profesoresGimnasia',
  ASIGNACIONES: 'asignacionesGimnasia',
};

// --- AUTH / STAFF VERIFICATION ---
export const checkProfesorExists = async (email: string): Promise<boolean> => {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docRef = doc(db, COLLECTIONS.PROFESORES, cleanEmail);
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTIONS.PROFESORES);
    return false;
  }
};

// --- ALUMNOS ---
export const subscribeAlumnos = (
  onSuccess: (data: AlumnoRecord[]) => void,
  onError?: (err: unknown) => void
) => {
  const colRef = collection(db, COLLECTIONS.ALUMNOS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AlumnoRecord[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as AlumnoRecord);
      });
      onSuccess(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.ALUMNOS);
      if (onError) onError(error);
    }
  );
};

export const saveAlumno = async (alumno: Omit<AlumnoRecord, 'id'>, id?: string) => {
  try {
    if (id) {
      const docRef = doc(db, COLLECTIONS.ALUMNOS, id);
      await setDoc(docRef, alumno, { merge: true });
      return id;
    } else {
      const colRef = collection(db, COLLECTIONS.ALUMNOS);
      const res = await addDoc(colRef, alumno);
      return res.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.ALUMNOS);
    throw error;
  }
};

export const updateAlumnoApparatusScore = async (
  alumnoId: string,
  apparatusScore: ApparatusScore,
  currentHistory: AlumnoRecord['score_history'] = []
) => {
  try {
    const docRef = doc(db, COLLECTIONS.ALUMNOS, alumnoId);
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      mes: 'Noviembre',
      Salto: apparatusScore.apparatus === 'Salto' ? apparatusScore.total : 12.0,
      Paralelas: apparatusScore.apparatus === 'Paralelas' ? apparatusScore.total : 12.0,
      Viga: apparatusScore.apparatus === 'Viga' ? apparatusScore.total : 12.0,
      Suelo: apparatusScore.apparatus === 'Suelo' ? apparatusScore.total : 12.0,
      total: apparatusScore.total,
    };
    await updateDoc(docRef, {
      [`scores.${apparatusScore.apparatus}`]: apparatusScore,
      score_history: [...currentHistory, newEntry],
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, COLLECTIONS.ALUMNOS);
    throw error;
  }
};

export const updateAlumnoMedicalStatus = async (alumnoId: string, status: string) => {
  try {
    const docRef = doc(db, COLLECTIONS.ALUMNOS, alumnoId);
    await updateDoc(docRef, { estado_medico: status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, COLLECTIONS.ALUMNOS);
    throw error;
  }
};

// --- PAGOS GIMNASIA ---
export const subscribePagos = (
  onSuccess: (data: PagoGimnasiaRecord[]) => void,
  onError?: (err: unknown) => void
) => {
  const colRef = collection(db, COLLECTIONS.PAGOS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: PagoGimnasiaRecord[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as PagoGimnasiaRecord);
      });
      onSuccess(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.PAGOS);
      if (onError) onError(error);
    }
  );
};

export const savePago = async (pago: Omit<PagoGimnasiaRecord, 'id'>, id?: string) => {
  try {
    if (id) {
      const docRef = doc(db, COLLECTIONS.PAGOS, id);
      await setDoc(docRef, pago, { merge: true });
      return id;
    } else {
      const colRef = collection(db, COLLECTIONS.PAGOS);
      const res = await addDoc(colRef, pago);
      return res.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.PAGOS);
    throw error;
  }
};

export const importBatchPagos = async (pagos: Omit<PagoGimnasiaRecord, 'id'>[]) => {
  try {
    const colRef = collection(db, COLLECTIONS.PAGOS);
    const promises = pagos.map((p) => addDoc(colRef, p));
    await Promise.all(promises);
    return pagos.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.PAGOS);
    throw error;
  }
};

// --- ASISTENCIAS ---
export const subscribeAsistencias = (
  onSuccess: (data: AsistenciaRecord[]) => void,
  onError?: (err: unknown) => void
) => {
  const colRef = collection(db, COLLECTIONS.ASISTENCIAS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AsistenciaRecord[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as AsistenciaRecord);
      });
      onSuccess(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.ASISTENCIAS);
      if (onError) onError(error);
    }
  );
};

export const saveAsistencia = async (asistencia: Omit<AsistenciaRecord, 'id'>) => {
  try {
    const colRef = collection(db, COLLECTIONS.ASISTENCIAS);
    const res = await addDoc(colRef, asistencia);
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.ASISTENCIAS);
    throw error;
  }
};

// --- PROFESORES GIMNASIA (DOC ID = EMAIL) ---
export const subscribeProfesores = (
  onSuccess: (data: ProfesorGimnasiaRecord[]) => void,
  onError?: (err: unknown) => void
) => {
  const colRef = collection(db, COLLECTIONS.PROFESORES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ProfesorGimnasiaRecord[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          email: data.email || d.id,
          nombre: data.nombre || 'Profesor',
          telefono: data.telefono || '',
          rol: data.rol || 'Profesor Gimnasia',
          especialidad: data.especialidad || 'Gimnasia Artística',
          gruposAsignados: data.gruposAsignados || [],
        });
      });
      onSuccess(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.PROFESORES);
      if (onError) onError(error);
    }
  );
};

export const addProfesor = async (
  email: string,
  nombre: string,
  extra: Partial<ProfesorGimnasiaRecord> = {}
) => {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docRef = doc(db, COLLECTIONS.PROFESORES, cleanEmail);
    const payload = {
      email: cleanEmail,
      nombre: nombre.trim(),
      telefono: extra.telefono?.trim() || '',
      rol: extra.rol || 'Profesor / Entrenador',
      especialidad: extra.especialidad || 'Gimnasia Artística',
      creadoPor: 'profesunlp@gmail.com',
      fechaAlta: new Date().toISOString().split('T')[0],
    };
    await setDoc(docRef, payload, { merge: true });
    return cleanEmail;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.PROFESORES);
    throw error;
  }
};

export const removeProfesor = async (email: string) => {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const docRef = doc(db, COLLECTIONS.PROFESORES, cleanEmail);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, COLLECTIONS.PROFESORES);
    throw error;
  }
};

// --- ASIGNACIONES ---
export const subscribeAsignaciones = (
  onSuccess: (data: AsignacionGimnasiaRecord[]) => void,
  onError?: (err: unknown) => void
) => {
  const colRef = collection(db, COLLECTIONS.ASIGNACIONES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AsignacionGimnasiaRecord[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as AsignacionGimnasiaRecord);
      });
      onSuccess(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.ASIGNACIONES);
      if (onError) onError(error);
    }
  );
};

// --- ALERTAS DE PAGOS ---
export const subscribeAlertasPagos = (
  onSuccess: (data: AlertaPagoRecord[]) => void,
  onError?: (err: unknown) => void
) => {
  const colRef = collection(db, COLLECTIONS.ALERTAS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: AlertaPagoRecord[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          apellido_nombre: data.apellido_nombre || '',
          mes: data.mes || '',
          documento: data.documento || '',
          createdAt: data.createdAt || '',
        });
      });
      // Sort newest first
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onSuccess(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.ALERTAS);
      if (onError) onError(error);
    }
  );
};

// Helper to format dates from Excel
export function formatExcelDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const jsDate = new Date(excelEpoch.getTime() + val * 86400000);
    return jsDate.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return str;
}

export interface ExcelImportResult {
  totalRows: number;
  filteredCount: number;
  newImportedCount: number;
  duplicateCount: number;
  newPayments: PagoGimnasiaRecord[];
  newAlerts: AlertaPagoRecord[];
}

export const importExcelPagosFromSheet = async (
  rawRows: any[][],
  existingPaymentsMap?: Map<string, PagoGimnasiaRecord>
): Promise<ExcelImportResult> => {
  // Use data from row 3 (0-indexed index 2)
  const rows = rawRows.slice(2);
  const totalRows = rows.length;

  const normalizeStr = (s: any) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const newPayments: PagoGimnasiaRecord[] = [];
  const newAlerts: AlertaPagoRecord[] = [];
  let filteredCount = 0;
  let duplicateCount = 0;

  for (const row of rows) {
    if (!row || row.length === 0) continue;

    // Column A (idx 0): Apellido y Nombre
    const apellidoNombre = String(row[0] || '').trim();
    // Column B (idx 1): Trámite (texto con código entre corchetes, ej [003-011-005])
    const tramite = String(row[1] || '').trim();
    // Column C (idx 2): Último pago (fecha)
    const fechaPagoRaw = row[2];
    // Column D (idx 3): DNI (texto)
    const dni = String(row[3] || '').trim();
    // Column E (idx 4): Monto
    const montoRaw = row[4];
    // Column F (idx 5): Cuotas
    const cuotas = row[5] !== undefined ? String(row[5]).trim() : '1';
    // Column G (idx 6): Observaciones
    const observacion = row[6] !== undefined ? String(row[6]).trim() : '';
    // Column H (idx 7): Mes (ej. '03 - marzo')
    const mes = String(row[7] || '').trim();

    // Filtrar SOLO trámites que empiecen con 'Gimnasia Artística Infantil'
    const cleanTramite = normalizeStr(tramite);
    if (!cleanTramite.startsWith('gimnasia artistica infantil')) {
      continue;
    }
    filteredCount++;

    // Extraer código entre corchetes ej. [003-011-005]
    const codeMatch = tramite.match(/\[(.*?)\]/);
    const codigo = codeMatch ? codeMatch[1].trim() : 'GIM-ART';

    // id = codigo_dni_mes (sanitizamos barras '/' que invalidarían paths de Firestore)
    const sanitizeId = (str: string) => str.replace(/[\/\\]/g, '-').replace(/\s+/g, '_').trim();
    const docId = `${sanitizeId(codigo)}_${sanitizeId(dni)}_${sanitizeId(mes)}`;

    // Verificar si ya existe en pagosGimnasia
    let alreadyExists = false;
    if (existingPaymentsMap && existingPaymentsMap.has(docId)) {
      alreadyExists = true;
    } else {
      try {
        const docRef = doc(db, COLLECTIONS.PAGOS, docId);
        const snap = await getDoc(docRef);
        alreadyExists = snap.exists();
      } catch (err) {
        console.warn('Error verificando documento existente:', err);
      }
    }

    if (alreadyExists) {
      duplicateCount++;
      continue;
    }

    // Parsear fecha y monto
    const fecha_pago = formatExcelDate(fechaPagoRaw);
    const importe = typeof montoRaw === 'number'
      ? montoRaw
      : parseFloat(String(montoRaw || '0').replace(/[^0-9.-]+/g, '')) || 0;

    const mesNumMatch = mes.match(/\d+/);
    const mes_numero = mesNumMatch ? parseInt(mesNumMatch[0], 10) : 3;

    // Guardar en pagosGimnasia (documento, apellido_nombre, importe, cuotas, observacion, mes, fecha_pago, codigo, tramite)
    const pagoRecord: PagoGimnasiaRecord = {
      id: docId,
      documento: dni,
      apellido_nombre: apellidoNombre,
      importe,
      cuotas,
      observacion,
      mes,
      mes_numero,
      fecha_pago,
      codigo,
      tramite,
      estado: 'pagado',
    };

    try {
      // 1) Guardar en pagosGimnasia
      const pagoDocRef = doc(db, COLLECTIONS.PAGOS, docId);
      await setDoc(pagoDocRef, pagoRecord, { merge: true });
      newPayments.push(pagoRecord);

      // 2) Crear alerta en alertasPagos con apellido_nombre, mes y documento (DNI), sin montos ni observaciones
      const alertaPayload = {
        apellido_nombre: apellidoNombre,
        mes,
        documento: dni,
        createdAt: new Date().toISOString(),
      };
      const alertaDoc = await addDoc(collection(db, COLLECTIONS.ALERTAS), alertaPayload);
      newAlerts.push({ id: alertaDoc.id, ...alertaPayload });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, COLLECTIONS.PAGOS);
      throw err;
    }
  }

  return {
    totalRows,
    filteredCount,
    newImportedCount: newPayments.length,
    duplicateCount,
    newPayments,
    newAlerts,
  };
};
