import React, { useState, useMemo } from 'react';
import { PagoGimnasiaRecord, AlumnoRecord, ProfesorGimnasiaRecord, AsignacionGimnasiaRecord } from '../types';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  Upload,
  Calendar,
  Users,
  Grid3X3,
  BarChart2,
  FileText,
  UserCheck,
  UserPlus,
  Trash2,
  TrendingUp,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface PaymentsViewProps {
  payments: PagoGimnasiaRecord[];
  alumnos: AlumnoRecord[];
  profesores: ProfesorGimnasiaRecord[];
  asignaciones: AsignacionGimnasiaRecord[];
  onOpenPaymentModal: (alumnoId?: string) => void;
  onOpenReceipt: (payment: any) => void;
  onQuickMarkPaid: (paymentId: string) => void;
  onImportJSON: (data: Omit<PagoGimnasiaRecord, 'id'>[]) => Promise<void>;
  onAddProfesor: (email: string, nombre: string, extra?: Partial<ProfesorGimnasiaRecord>) => Promise<void>;
  onRemoveProfesor: (email: string) => Promise<void>;
}

type PaymentTab = 'resumen' | 'alumnos' | 'grupos' | 'profesores' | 'informes' | 'matriz';

const MONTH_NAMES: { [key: number]: string } = {
  3: 'Marzo',
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
  7: 'Julio',
  8: 'Agosto',
  9: 'Septiembre',
  10: 'Octubre',
  11: 'Noviembre',
};

const MONTH_NUMBERS = [3, 4, 5, 6, 7, 8, 9, 10, 11];

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  alumnos,
  profesores,
  asignaciones,
  onOpenPaymentModal,
  onOpenReceipt,
  onQuickMarkPaid,
  onImportJSON,
  onAddProfesor,
  onRemoveProfesor,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('resumen');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('Todos');
  const [showOnlyDebtors, setShowOnlyDebtors] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');

  // Add Professor Form state
  const [showAddProfesorModal, setShowAddProfesorModal] = useState(false);
  const [profEmail, setProfEmail] = useState('');
  const [profNombre, setProfNombre] = useState('');
  const [profTelefono, setProfTelefono] = useState('');
  const [profEspecialidad, setProfEspecialidad] = useState('Gimnasia Artística');
  const [profActionLoading, setProfActionLoading] = useState(false);
  const [profActionMsg, setProfActionMsg] = useState('');

  // Groups
  const allGroups = useMemo(() => {
    const set = new Set<string>();
    payments.forEach((p) => {
      if (p.horario_completo) set.add(p.horario_completo);
    });
    alumnos.forEach((a) => {
      if (a.horario_completo) set.add(a.horario_completo);
    });
    return Array.from(set);
  }, [payments, alumnos]);

  // Overall calculations
  const totalRecaudado = useMemo(() => {
    return payments
      .filter((p) => p.fecha_pago || p.estado === 'pagado')
      .reduce((sum, p) => sum + (Number(p.importe) || 0), 0);
  }, [payments]);

  const totalPendiente = useMemo(() => {
    return payments
      .filter((p) => !p.fecha_pago && p.estado !== 'pagado' && p.estado !== 'beca')
      .reduce((sum, p) => sum + (Number(p.importe) || 0), 0);
  }, [payments]);

  const totalMatriculas = useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number(p.matricula) || 0), 0);
  }, [payments]);

  // Monthly breakdown for recharts bar chart
  const monthlyChartData = useMemo(() => {
    return MONTH_NUMBERS.map((num) => {
      const monthPayments = payments.filter((p) => p.mes_numero === num);
      const cobrado = monthPayments
        .filter((p) => p.fecha_pago || p.estado === 'pagado')
        .reduce((sum, p) => sum + (Number(p.importe) || 0), 0);
      const pendiente = monthPayments
        .filter((p) => !p.fecha_pago && p.estado !== 'pagado')
        .reduce((sum, p) => sum + (Number(p.importe) || 0), 0);
      return {
        mes: MONTH_NAMES[num],
        num,
        Cobrado: cobrado,
        Pendiente: pendiente,
      };
    });
  }, [payments]);

  // Students matrix
  const studentsMatrix = useMemo(() => {
    const studentMap = new Map<
      string,
      {
        documento: string;
        apellido_nombre: string;
        rango_etario: string;
        horario_completo: string;
        dias_semana: string;
        months: { [mes_num: number]: PagoGimnasiaRecord | undefined };
        totalAdeudado: number;
        totalAbonado: number;
      }
    >();

    alumnos.forEach((a) => {
      studentMap.set(a.documento || a.id, {
        documento: a.documento,
        apellido_nombre: a.apellido_nombre,
        rango_etario: a.rango_etario || '9 a 12 años',
        horario_completo: a.horario_completo || '17:00 a 18:30',
        dias_semana: a.dias_semana || 'Lun y Mié',
        months: {},
        totalAdeudado: 0,
        totalAbonado: 0,
      });
    });

    payments.forEach((p) => {
      const key = p.documento || p.apellido_nombre;
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          documento: p.documento,
          apellido_nombre: p.apellido_nombre,
          rango_etario: p.rango_etario,
          horario_completo: p.horario_completo,
          dias_semana: p.dias_semana,
          months: {},
          totalAdeudado: 0,
          totalAbonado: 0,
        });
      }
      const item = studentMap.get(key)!;
      item.months[p.mes_numero] = p;
      if (p.fecha_pago || p.estado === 'pagado') {
        item.totalAbonado += Number(p.importe) || 0;
      } else {
        item.totalAdeudado += Number(p.importe) || 0;
      }
    });

    let list = Array.from(studentMap.values());

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.apellido_nombre.toLowerCase().includes(q) ||
          s.documento.toLowerCase().includes(q)
      );
    }

    if (filterGroup !== 'Todos') {
      list = list.filter((s) => s.horario_completo === filterGroup);
    }

    if (showOnlyDebtors) {
      list = list.filter((s) => s.totalAdeudado > 0);
    }

    return list;
  }, [payments, alumnos, searchTerm, filterGroup, showOnlyDebtors]);

  // Handle JSON Import
  const handleProcessImport = async () => {
    try {
      setImportStatus('Procesando JSON...');
      const parsed = JSON.parse(jsonText);
      const arrayToImport = Array.isArray(parsed) ? parsed : [parsed];
      if (arrayToImport.length === 0) {
        setImportStatus('El JSON no contiene registros válidos.');
        return;
      }

      await onImportJSON(arrayToImport);
      setImportStatus(`¡Éxito! Se guardaron ${arrayToImport.length} registros en Firestore.`);
      setTimeout(() => {
        setShowImportModal(false);
        setJsonText('');
        setImportStatus('');
      }, 1500);
    } catch (err: any) {
      setImportStatus(`Error al parsear JSON: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCreateProfesor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profEmail.trim() || !profNombre.trim()) return;

    try {
      setProfActionLoading(true);
      setProfActionMsg('');
      await onAddProfesor(profEmail.trim().toLowerCase(), profNombre.trim(), {
        telefono: profTelefono.trim(),
        especialidad: profEspecialidad.trim(),
      });
      setShowAddProfesorModal(false);
      setProfEmail('');
      setProfNombre('');
      setProfTelefono('');
    } catch (err: any) {
      setProfActionMsg(`Error al agregar profesor: ${err.message}`);
    } finally {
      setProfActionLoading(false);
    }
  };

  const handleDeleteProfesor = async (email: string) => {
    if (window.confirm(`¿Seguro que deseas revocar la autorización de acceso para ${email}?`)) {
      try {
        await onRemoveProfesor(email);
      } catch (err: any) {
        alert(`Error al eliminar profesor: ${err.message}`);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = 'Documento,Apellido_Nombre,Mes,Mes_Numero,Importe,Fecha_Pago,Matricula,Codigo,Rango_Etario,Horario,Dias\n';
    const rows = payments
      .map(
        (p) =>
          `"${p.documento}","${p.apellido_nombre}","${p.mes}",${p.mes_numero},${p.importe},"${p.fecha_pago || ''}",${p.matricula || 0},"${p.codigo}","${p.rango_etario}","${p.horario_completo}","${p.dias_semana}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GymCoach_PagosGimnasia_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      {/* View Header with 6 requested Tabs */}
      <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#003640] border border-[#4cd7f6]/40 flex items-center justify-center text-[#4cd7f6]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Control de Pagos & Aranceles (Coordinación)
              </h2>
            </div>
            <p className="text-xs text-[#c4c5d5] mt-0.5">
              Gestión financiera exclusiva para profesunlp@gmail.com · Colección <span className="font-mono text-[#4cd7f6]">pagosGimnasia</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#dae2fd] bg-[#171f33] hover:bg-[#222a3d] border border-[#222a3d] rounded-xl transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-[#4cd7f6]" />
              <span>Cargar JSON</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#dae2fd] bg-[#171f33] hover:bg-[#222a3d] border border-[#222a3d] rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#4cd7f6]" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => onOpenPaymentModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-xl transition-all shadow-[0_0_15px_rgba(76,215,246,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Cobro</span>
            </button>
          </div>
        </div>

        {/* 6 Tabs requested: Resumen, Alumnos, Grupos, Profesores, Informes, Estado de pagos */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 border-t border-[#222a3d]">
          {[
            { id: 'resumen', label: 'Resumen', icon: BarChart2 },
            { id: 'matriz', label: 'Estado de Pagos (Mar-Nov)', icon: Grid3X3 },
            { id: 'alumnos', label: 'Alumnos', icon: Users },
            { id: 'grupos', label: 'Grupos', icon: Clock },
            { id: 'profesores', label: 'Profesores', icon: UserCheck },
            { id: 'informes', label: 'Informes', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PaymentTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#4cd7f6] text-[#001f26] shadow-[0_0_12px_rgba(76,215,246,0.3)]'
                    : 'bg-[#171f33] text-[#c4c5d5] hover:text-white hover:bg-[#222a3d]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: RESUMEN */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d]">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8e909f] block">
                Total Recaudado Anual
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                ${totalRecaudado.toLocaleString('es-AR')}
              </div>
              <p className="text-[11px] text-[#c4c5d5] mt-1">Cuotas abonadas ciclo 2026</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d]">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8e909f] block">
                Monto Pendiente
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">
                ${totalPendiente.toLocaleString('es-AR')}
              </div>
              <p className="text-[11px] text-[#c4c5d5] mt-1">Cuotas pendientes de cobro</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d]">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8e909f] block">
                Matrículas Percibidas
              </span>
              <div className="text-xl sm:text-2xl font-black text-[#4cd7f6] mt-1">
                ${totalMatriculas.toLocaleString('es-AR')}
              </div>
              <p className="text-[11px] text-[#8e909f] mt-1">Inscripciones y fichas federativas</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d]">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8e909f] block">
                Registros en Firestore
              </span>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {payments.length}
              </div>
              <p className="text-[11px] text-[#8e909f] mt-1">Colección pagosGimnasia</p>
            </div>
          </div>

          {/* Monthly Recaudación Chart */}
          <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4cd7f6]" />
              Evolución Mensual de Aranceles (Marzo a Noviembre)
            </h3>
            {payments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8e909f]">
                No hay pagos cargados aún en la base de datos para mostrar en el gráfico.
              </div>
            ) : (
              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222a3d" vertical={false} />
                    <XAxis dataKey="mes" stroke="#8e909f" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8e909f" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b1326', borderColor: '#222a3d', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString('es-AR')}`, '']}
                    />
                    <Bar dataKey="Cobrado" fill="#4cd7f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pendiente" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ESTADO DE PAGOS (MATRIZ MARZO A NOVIEMBRE) */}
      {activeTab === 'matriz' && (
        <div className="space-y-4">
          {/* Matriz Toolbar */}
          <div className="p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d] flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8e909f]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar gimnasta o DNI..."
                  className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#8e909f] outline-none"
                />
              </div>

              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="bg-[#0b1326] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-[#dae2fd] outline-none"
              >
                <option value="Todos">Todos los Horarios</option>
                {allGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#c4c5d5] select-none shrink-0">
              <input
                type="checkbox"
                checked={showOnlyDebtors}
                onChange={(e) => setShowOnlyDebtors(e.target.checked)}
                className="rounded border-[#222a3d] bg-[#0b1326] text-[#4cd7f6] focus:ring-[#4cd7f6]"
              />
              <span>Ver solo con deuda pendiente</span>
            </label>
          </div>

          {/* Matrix Table */}
          {studentsMatrix.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#131b2e] border border-[#222a3d]">
              <Grid3X3 className="w-12 h-12 text-[#8e909f] mx-auto mb-3 opacity-40" />
              <h3 className="text-sm font-bold text-white">No hay alumnos ni registros de pago en Firestore</h3>
              <p className="text-xs text-[#8e909f] mt-1">
                Usá el botón "Cargar JSON" o inscribí alumnas en la sección de Atletas para comenzar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl bg-[#131b2e] border border-[#222a3d]">
              <table className="w-full text-left text-xs text-[#dae2fd] border-collapse min-w-[850px]">
                <thead className="bg-[#171f33] text-[10px] font-bold uppercase tracking-wider text-[#8e909f] border-b border-[#222a3d]">
                  <tr>
                    <th className="py-3 px-3.5 sticky left-0 bg-[#171f33] z-10">Gimnasta / DNI</th>
                    <th className="py-3 px-2">Horario / Días</th>
                    {MONTH_NUMBERS.map((num) => (
                      <th key={num} className="py-3 px-1.5 text-center">
                        {MONTH_NAMES[num].slice(0, 3)}
                      </th>
                    ))}
                    <th className="py-3 px-3 text-right">Deuda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222a3d]">
                  {studentsMatrix.map((item) => (
                    <tr key={item.documento + item.apellido_nombre} className="hover:bg-[#171f33]/40 transition-colors">
                      <td className="py-2.5 px-3.5 sticky left-0 bg-[#131b2e] z-10 border-r border-[#222a3d]">
                        <p className="font-bold text-white whitespace-nowrap">{item.apellido_nombre}</p>
                        <span className="text-[10px] text-[#8e909f] font-mono">{item.documento}</span>
                      </td>
                      <td className="py-2.5 px-2 text-[11px] text-[#c4c5d5] whitespace-nowrap">
                        <span>{item.horario_completo || '17:00 a 18:30'}</span>
                        <span className="text-[10px] text-[#8e909f] block">{item.dias_semana || 'Lun y Mié'}</span>
                      </td>

                      {/* Matrix Cells: Marzo a Noviembre */}
                      {MONTH_NUMBERS.map((num) => {
                        const record = item.months[num];
                        const isPaid = record && (record.fecha_pago || record.estado === 'pagado');
                        return (
                          <td key={num} className="py-2.5 px-1.5 text-center">
                            {isPaid ? (
                              <span
                                title={`Abonado: $${record?.importe} el ${record?.fecha_pago || ''}`}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-bold text-xs"
                              >
                                ✓
                              </span>
                            ) : (
                              <button
                                onClick={() => onOpenPaymentModal(item.documento)}
                                title={`Pendiente mes ${MONTH_NAMES[num]}. Clic para registrar.`}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 font-bold text-xs transition-colors"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                        {item.totalAdeudado > 0 ? (
                          <span className="text-rose-400">${item.totalAdeudado.toLocaleString('es-AR')}</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold text-[11px]">Al día</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALUMNOS */}
      {activeTab === 'alumnos' && (
        <div className="space-y-4">
          {studentsMatrix.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#131b2e] border border-[#222a3d]">
              <Users className="w-12 h-12 text-[#8e909f] mx-auto mb-3 opacity-40" />
              <h3 className="text-sm font-bold text-white">No hay alumnos registrados</h3>
              <p className="text-xs text-[#8e909f] mt-1">Registrá atletas para visualizar su estado de cuenta.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {studentsMatrix.map((item) => (
                <div key={item.documento + item.apellido_nombre} className="p-4 rounded-xl bg-[#131b2e] border border-[#222a3d] space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.apellido_nombre}</h4>
                      <p className="text-[11px] text-[#8e909f] font-mono">DNI: {item.documento}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.totalAdeudado === 0
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950/70 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.totalAdeudado === 0 ? 'Al día' : 'Con deuda'}
                    </span>
                  </div>
                  <div className="text-xs text-[#c4c5d5] pt-1 border-t border-[#222a3d]">
                    <p>Horario: <strong className="text-white">{item.horario_completo}</strong></p>
                    <p>Días: {item.dias_semana}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#222a3d]">
                    <span className="text-xs text-[#8e909f]">Abonado: <strong className="text-emerald-400">${item.totalAbonado.toLocaleString('es-AR')}</strong></span>
                    <button
                      onClick={() => onOpenPaymentModal(item.documento)}
                      className="px-2.5 py-1 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-lg"
                    >
                      + Registrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GRUPOS */}
      {activeTab === 'grupos' && (
        <div className="space-y-4">
          {allGroups.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#131b2e] border border-[#222a3d]">
              <Clock className="w-12 h-12 text-[#8e909f] mx-auto mb-3 opacity-40" />
              <h3 className="text-sm font-bold text-white">No hay grupos con datos cargados</h3>
              <p className="text-xs text-[#8e909f] mt-1">Los grupos se forman a partir de los horarios de las gimnastas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allGroups.map((group) => {
                const groupStudents = studentsMatrix.filter((s) => s.horario_completo === group);
                const totalGroupPaid = groupStudents.reduce((sum, s) => sum + s.totalAbonado, 0);
                const totalGroupDebt = groupStudents.reduce((sum, s) => sum + s.totalAdeudado, 0);
                return (
                  <div key={group} className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#4cd7f6]" />
                        {group}
                      </h4>
                      <span className="text-xs font-mono text-[#4cd7f6]">{groupStudents.length} alumnos</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#0b1326] p-2.5 rounded-xl border border-[#222a3d]">
                        <span className="text-[#8e909f] block text-[10px] uppercase">Recaudado</span>
                        <span className="font-bold text-emerald-400">${totalGroupPaid.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="bg-[#0b1326] p-2.5 rounded-xl border border-[#222a3d]">
                        <span className="text-[#8e909f] block text-[10px] uppercase">Pendiente</span>
                        <span className="font-bold text-amber-300">${totalGroupDebt.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFESORES (COORDINATOR CAN ADD / REMOVE BY EMAIL) */}
      {activeTab === 'profesores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#131b2e] border border-[#222a3d]">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4cd7f6]" />
                Gestión de Docentes Autorizados (profesoresGimnasia)
              </h3>
              <p className="text-xs text-[#8e909f] mt-0.5">
                Solo el coordinador puede dar de alta o revocar profesores por email. Cada alta crea el documento <span className="font-mono text-[#4cd7f6]">profesoresGimnasia/{'{email}'}</span>.
              </p>
            </div>
            <button
              onClick={() => setShowAddProfesorModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-xl shadow-[0_0_12px_rgba(76,215,246,0.3)] shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Agregar Profesor</span>
            </button>
          </div>

          {profesores.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#131b2e] border border-[#222a3d]">
              <UserCheck className="w-12 h-12 text-[#8e909f] mx-auto mb-3 opacity-40" />
              <h3 className="text-sm font-bold text-white">No hay profesores registrados en Firestore</h3>
              <p className="text-xs text-[#8e909f] mt-1 max-w-sm mx-auto">
                Hacé clic en "+ Agregar Profesor" para ingresar el email de cada docente (ej: <span className="font-mono text-[#4cd7f6]">mi.xt1032@gmail.com</span>) y autorizar su acceso.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profesores.map((prof) => (
                <div key={prof.id || prof.email} className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-white">{prof.nombre}</h4>
                        <p className="text-xs font-mono text-[#4cd7f6] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{prof.email}</span>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                        Autorizado Staff
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-[#c4c5d5]">
                      <p>Especialidad: <strong className="text-white">{prof.especialidad || 'Gimnasia Artística'}</strong></p>
                      {prof.telefono && (
                        <p className="flex items-center gap-1 text-[#8e909f]">
                          <Phone className="w-3 h-3 text-[#4cd7f6]" /> {prof.telefono}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#222a3d] flex items-center justify-between">
                    <span className="text-[10px] text-[#8e909f] font-mono">ID: {prof.email}</span>
                    <button
                      onClick={() => handleDeleteProfesor(prof.email)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-500/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: INFORMES */}
      {activeTab === 'informes' && (
        <div className="p-5 rounded-2xl bg-[#131b2e] border border-[#222a3d] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Informe Oficial de Recaudación Gimnasia Artística UNLP
          </h3>
          <p className="text-xs text-[#c4c5d5]">
            Consolidado de ingresos mensuales y aranceles registrados en el sistema.
          </p>

          <div className="divide-y divide-[#222a3d] text-xs">
            {monthlyChartData.map((m) => (
              <div key={m.num} className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-white">{m.mes} 2026</span>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-400">Cobrado: ${m.Cobrado.toLocaleString('es-AR')}</span>
                  <span className="text-amber-300">Pendiente: ${m.Pendiente.toLocaleString('es-AR')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#222a3d] flex justify-end">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-xl transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Planilla Oficial CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR PROFESOR (SOLO COORDINADOR) */}
      {showAddProfesorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="relative w-full max-w-md bg-[#0b1326] border border-[#222a3d] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#4cd7f6]" />
                Autorizar Nuevo Profesor
              </h3>
              <button onClick={() => setShowAddProfesorModal(false)} className="text-[#8e909f] hover:text-white">✕</button>
            </div>
            <p className="text-xs text-[#c4c5d5]">
              El profesor podrá iniciar sesión con este correo Google y acceder a Atletas, Aparatos y Pase de lista.
            </p>

            <form onSubmit={handleCreateProfesor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#8e909f] mb-1">
                  Correo Electrónico (Gmail / Google Account)
                </label>
                <input
                  type="email"
                  required
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  placeholder="ej: mi.xt1032@gmail.com"
                  className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8e909f] mb-1">
                  Nombre y Apellido del Docente
                </label>
                <input
                  type="text"
                  required
                  value={profNombre}
                  onChange={(e) => setProfNombre(e.target.value)}
                  placeholder="ej: Lucas Peralta"
                  className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#8e909f] mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={profTelefono}
                    onChange={(e) => setProfTelefono(e.target.value)}
                    placeholder="+54 221 ..."
                    className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8e909f] mb-1">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    value={profEspecialidad}
                    onChange={(e) => setProfEspecialidad(e.target.value)}
                    placeholder="Gimnasia Artística"
                    className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {profActionMsg && (
                <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30">
                  {profActionMsg}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222a3d]">
                <button
                  type="button"
                  onClick={() => setShowAddProfesorModal(false)}
                  className="px-3 py-1.5 text-xs text-[#c4c5d5] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={profActionLoading}
                  className="px-4 py-2 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-xl"
                >
                  {profActionLoading ? 'Guardando en Firestore...' : 'Crear Documento en profesoresGimnasia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR / IMPORTAR JSON */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="relative w-full max-w-lg bg-[#0b1326] border border-[#222a3d] rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#4cd7f6]" />
              Importar Registros desde JSON
            </h3>
            <p className="text-xs text-[#c4c5d5]">
              El JSON debe contener los campos: <code className="text-[#4cd7f6]">documento, apellido_nombre, importe, mes, mes_numero, fecha_pago, matricula, codigo, rango_etario, horario_completo, dias_semana</code>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#8e909f] mb-1">
                Seleccionar archivo .json
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-[#c4c5d5] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1e40af] file:text-white hover:file:bg-[#2563eb]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8e909f] mb-1">
                O pegar contenido JSON directamente
              </label>
              <textarea
                rows={5}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='[{"documento": "48.912.441", "apellido_nombre": "Mía Suárez", "importe": 38000, "mes": "Noviembre", "mes_numero": 11, ...}]'
                className="w-full bg-[#131b2e] border border-[#222a3d] focus:border-[#4cd7f6] rounded-xl p-3 text-xs text-white font-mono outline-none resize-none"
              />
            </div>

            {importStatus && (
              <p className="text-xs font-semibold text-[#4cd7f6] bg-[#003640]/50 p-2.5 rounded-xl border border-[#4cd7f6]/40">
                {importStatus}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222a3d]">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs text-[#c4c5d5] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                className="px-4 py-2 text-xs font-bold text-[#001f26] bg-[#4cd7f6] hover:bg-[#3ac0de] rounded-xl"
              >
                Guardar en Firestore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
