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
  AsistenciaRecord,
  ProfesorGimnasiaRecord,
  AsignacionGimnasiaRecord,
  ApparatusScore,
} from '../types';

export const COLLECTIONS = {
  ALUMNOS: 'alumnos',
  PAGOS: 'pagosGimnasia',
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
