import React from 'react';
import { LayoutDashboard, CreditCard, Users, Target, CalendarCheck } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unpaidCount: number;
  isCoordinador: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unpaidCount,
  isCoordinador,
}) => {
  const tabs = isCoordinador
    ? [
        { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
        { id: 'pagos', label: 'Pagos', icon: CreditCard, badge: unpaidCount > 0 ? unpaidCount : null },
        { id: 'gimnastas', label: 'Atletas', icon: Users },
        { id: 'rutinas', label: 'Aparatos', icon: Target },
        { id: 'asistencia', label: 'Pase Lista', icon: CalendarCheck },
      ]
    : [
        { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
        { id: 'gimnastas', label: 'Atletas', icon: Users },
        { id: 'rutinas', label: 'Aparatos', icon: Target },
        { id: 'asistencia', label: 'Pase Lista', icon: CalendarCheck },
      ];

  const colsClass = isCoordinador ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1326]/95 backdrop-blur-lg border-t border-[#222a3d] pb-[safe-area-inset-bottom] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className={`grid ${colsClass} h-16 max-w-md mx-auto`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 transition-all select-none active:scale-95"
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-[#4cd7f6] rounded-full shadow-[0_0_10px_#4cd7f6]" />
              )}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive
                      ? 'text-[#4cd7f6] scale-110 drop-shadow-[0_0_8px_rgba(76,215,246,0.6)]'
                      : 'text-[#8e909f]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] font-black bg-rose-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-semibold transition-colors ${
                  isActive ? 'text-[#4cd7f6]' : 'text-[#8e909f]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
