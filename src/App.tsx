import React, { useState, useEffect } from 'react';
import {
  AppUser,
  AlumnoRecord,
  PagoGimnasiaRecord,
  AsistenciaRecord,
  ProfesorGimnasiaRecord,
  AsignacionGimnasiaRecord,
  MedicalStatus,
  ApparatusScore,
  ApparatusType,
} from './types';
import { auth, logoutUser } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  subscribeAlumnos,
  subscribePagos,
  subscribeAsistencias,
  subscribeProfesores,
  subscribeAsignaciones,
  saveAlumno,
  savePago,
  importBatchPagos,
  saveAsistencia,
  updateAlumnoApparatusScore,
  updateAlumnoMedicalStatus,
  addProfesor,
  removeProfesor,
} from './services/firestoreService';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { PaymentsView } from './components/PaymentsView';
import { GymnastsView } from './components/GymnastsView';
import { RoutineScorerView } from './components/RoutineScorerView';
import { AttendanceView } from './components/AttendanceView';
import { ReceiptModal } from './components/ReceiptModal';
import { NewPaymentModal } from './components/NewPaymentModal';
import { NewGymnastModal } from './components/NewGymnastModal';
import { GymnastDetailModal } from './components/GymnastDetailModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Firestore live collections (strictly starts empty, no mock fallbacks)
  const [alumnos, setAlumnos] = useState<AlumnoRecord[]>([]);
  const [pagos, setPagos] = useState<PagoGimnasiaRecord[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaRecord[]>([]);
  const [profesores, setProfesores] = useState<ProfesorGimnasiaRecord[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionGimnasiaRecord[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [selectedGymnastForDetail, setSelectedGymnastForDetail] = useState<AlumnoRecord | null>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalDoc, setPaymentModalDoc] = useState<string | undefined>();
  const [isNewGymnastModalOpen, setIsNewGymnastModalOpen] = useState(false);

  // Scorer state
  const [scorerGymnastId, setScorerGymnastId] = useState<string | undefined>();
  const [scorerApparatus, setScorerApparatus] = useState<ApparatusType | undefined>();

  const isCoordinador = currentUser?.role === 'coordinador';

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const email = user.email.toLowerCase().trim();

        if (email === 'profesunlp@gmail.com') {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Coordinador UNLP',
            photoURL: user.photoURL || undefined,
            role: 'coordinador',
          });
        } else if (email === 'mi.xt1032@gmail.com') {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Profesor de Gimnasia',
            photoURL: user.photoURL || undefined,
            role: 'profesor',
          });
          setActiveTab('gimnastas');
        } else {
          // Unauthorized email
          await logoutUser();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore real-time collections
  useEffect(() => {
    if (!currentUser) return;

    const unsubAlumnos = subscribeAlumnos(
      (data) => setAlumnos(data),
      (err) => console.log('Firestore Alumnos Notice:', err)
    );

    // Only coordinator subscribes to pagos
    let unsubPagos = () => {};
    if (currentUser.role === 'coordinador') {
      unsubPagos = subscribePagos(
        (data) => setPagos(data),
        (err) => console.log('Firestore Pagos Notice:', err)
      );
    }

    const unsubAsistencias = subscribeAsistencias((data) => setAsistencias(data));
    const unsubProfesores = subscribeProfesores((data) => setProfesores(data));
    const unsubAsignaciones = subscribeAsignaciones((data) => setAsignaciones(data));

    return () => {
      unsubAlumnos();
      unsubPagos();
      unsubAsistencias();
      unsubProfesores();
      unsubAsignaciones();
    };
  }, [currentUser]);

  // Handlers
  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'coordinador') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('gimnastas');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  const handleSavePayment = async (paymentData: Omit<PagoGimnasiaRecord, 'id'>) => {
    try {
      const id = await savePago(paymentData);
      setPagos((prev) => [{ id: id || `pay-${Date.now()}`, ...paymentData }, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportBatchJSON = async (records: Omit<PagoGimnasiaRecord, 'id'>[]) => {
    await importBatchPagos(records);
    const withIds = records.map((r, i) => ({ id: `p-imp-${Date.now()}-${i}`, ...r }));
    setPagos((prev) => [...withIds, ...prev]);
  };

  const handleQuickMarkPaid = async (paymentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const rec = pagos.find((p) => p.id === paymentId);
    if (rec) {
      const updated = {
        ...rec,
        fecha_pago: today,
        estado: 'pagado' as const,
        medio_pago: 'Transferencia Bancaria',
        nro_recibo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      await savePago(updated, paymentId);
      setPagos((prev) => prev.map((p) => (p.id === paymentId ? updated : p)));
    }
  };

  const handleSaveGymnast = async (newGymnast: Omit<AlumnoRecord, 'id'>) => {
    const id = await saveAlumno(newGymnast);
    setAlumnos((prev) => [{ id: id || `alm-${Date.now()}`, ...newGymnast }, ...prev]);
  };

  const handleUpdateGymnastStatus = async (gymnastId: string, status: MedicalStatus) => {
    await updateAlumnoMedicalStatus(gymnastId, status);
    setAlumnos((prev) =>
      prev.map((g) => (g.id === gymnastId ? { ...g, estado_medico: status } : g))
    );
    if (selectedGymnastForDetail?.id === gymnastId) {
      setSelectedGymnastForDetail((prev) => (prev ? { ...prev, estado_medico: status } : null));
    }
  };

  const handleSaveApparatusScore = async (gymnastId: string, score: ApparatusScore) => {
    const gymnast = alumnos.find((g) => g.id === gymnastId);
    await updateAlumnoApparatusScore(gymnastId, score, gymnast?.score_history || []);
    setAlumnos((prev) =>
      prev.map((g) => {
        if (g.id === gymnastId) {
          const newEntry = {
            date: new Date().toISOString().split('T')[0],
            mes: 'Noviembre',
            Salto: score.apparatus === 'Salto' ? score.total : g.scores?.Salto?.total || 12.0,
            Paralelas: score.apparatus === 'Paralelas' ? score.total : g.scores?.Paralelas?.total || 12.0,
            Viga: score.apparatus === 'Viga' ? score.total : g.scores?.Viga?.total || 12.0,
            Suelo: score.apparatus === 'Suelo' ? score.total : g.scores?.Suelo?.total || 12.0,
            total: score.total,
          };
          return {
            ...g,
            scores: {
              ...g.scores,
              [score.apparatus]: score,
            },
            score_history: [...(g.score_history || []), newEntry],
          };
        }
        return g;
      })
    );
    if (selectedGymnastForDetail?.id === gymnastId) {
      setSelectedGymnastForDetail((prev) =>
        prev
          ? {
              ...prev,
              scores: {
                ...prev.scores,
                [score.apparatus]: score,
              },
            }
          : null
      );
    }
  };

  const handleSaveAsistencia = async (asistencia: Omit<AsistenciaRecord, 'id'>) => {
    await saveAsistencia(asistencia);
    setAsistencias((prev) => [{ id: `ast-${Date.now()}`, ...asistencia }, ...prev]);
  };

  const handleAddProfesor = async (
    email: string,
    nombre: string,
    extra: Partial<ProfesorGimnasiaRecord> = {}
  ) => {
    await addProfesor(email, nombre, extra);
    setProfesores((prev) => [
      ...prev.filter((p) => p.email !== email),
      {
        id: email,
        email,
        nombre,
        telefono: extra.telefono || '',
        rol: extra.rol || 'Profesor / Entrenador',
        especialidad: extra.especialidad || 'Gimnasia Artística',
      },
    ]);
  };

  const handleRemoveProfesor = async (email: string) => {
    await removeProfesor(email);
    setProfesores((prev) => prev.filter((p) => p.email !== email && p.id !== email));
  };

  const handleOpenScorer = (gymnastId?: string, apparatus?: ApparatusType) => {
    setScorerGymnastId(gymnastId);
    setScorerApparatus(apparatus || 'Viga');
    setActiveTab('rutinas');
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Safety: If professor tries to access dashboard or pagos, redirect to gimnastas
  if (!isCoordinador && (activeTab === 'dashboard' || activeTab === 'pagos')) {
    setActiveTab('gimnastas');
  }

  const unpaidCount = pagos.filter((p) => !p.fecha_pago && p.estado !== 'pagado').length;

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex flex-col selection:bg-[#4cd7f6] selection:text-[#001f26] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        unpaidCount={unpaidCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Coordinador only: Dashboard with revenue */}
        {activeTab === 'dashboard' && isCoordinador && (
          <DashboardView
            currentUser={currentUser}
            gymnasts={alumnos}
            payments={pagos}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenPaymentModal={() => {
              setPaymentModalDoc(undefined);
              setIsPaymentModalOpen(true);
            }}
            onOpenGymnastModal={() => setIsNewGymnastModalOpen(true)}
            onOpenScorer={handleOpenScorer}
            onSelectGymnast={(g) => setSelectedGymnastForDetail(g)}
          />
        )}

        {/* Coordinador only: Control de Pagos with 6 tabs & JSON loader */}
        {activeTab === 'pagos' && isCoordinador && (
          <PaymentsView
            payments={pagos}
            alumnos={alumnos}
            profesores={profesores}
            asignaciones={asignaciones}
            onOpenPaymentModal={(docId) => {
              setPaymentModalDoc(docId);
              setIsPaymentModalOpen(true);
            }}
            onOpenReceipt={(payment) => setSelectedPaymentForReceipt(payment)}
            onQuickMarkPaid={handleQuickMarkPaid}
            onImportJSON={handleImportBatchJSON}
            onAddProfesor={handleAddProfesor}
            onRemoveProfesor={handleRemoveProfesor}
          />
        )}

        {/* Both roles: Atletas */}
        {activeTab === 'gimnastas' && (
          <GymnastsView
            gymnasts={alumnos}
            onSelectGymnast={(g) => setSelectedGymnastForDetail(g)}
            onOpenNewGymnastModal={() => setIsNewGymnastModalOpen(true)}
            onOpenScorer={handleOpenScorer}
          />
        )}

        {/* Both roles: Aparatos FIG Scorer */}
        {activeTab === 'rutinas' && (
          <RoutineScorerView
            gymnasts={alumnos}
            initialGymnastId={scorerGymnastId}
            initialApparatus={scorerApparatus}
            onSaveScore={handleSaveApparatusScore}
          />
        )}

        {/* Both roles: Pase de lista */}
        {activeTab === 'asistencia' && (
          <AttendanceView
            gymnasts={alumnos}
            onSaveAsistencia={handleSaveAsistencia}
            profesorEmail={currentUser.email}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unpaidCount={unpaidCount}
        isCoordinador={isCoordinador}
      />

      {/* Modals */}
      <ReceiptModal
        payment={selectedPaymentForReceipt}
        onClose={() => setSelectedPaymentForReceipt(null)}
      />

      <NewPaymentModal
        gymnasts={alumnos}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSavePayment={handleSavePayment}
        initialDocumento={paymentModalDoc}
      />

      <NewGymnastModal
        isOpen={isNewGymnastModalOpen}
        onClose={() => setIsNewGymnastModalOpen(false)}
        onSaveGymnast={handleSaveGymnast}
      />

      <GymnastDetailModal
        gymnast={selectedGymnastForDetail}
        onClose={() => setSelectedGymnastForDetail(null)}
        onUpdateStatus={handleUpdateGymnastStatus}
        onOpenScorer={handleOpenScorer}
      />
    </div>
  );
}
