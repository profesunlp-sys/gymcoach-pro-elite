import React, { useState } from 'react';
import { AppUser } from '../types';
import { GymnastLogoIcon } from './GymnastIcon';
import {
  Bell,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CreditCard,
  Users,
  Target,
  CalendarCheck,
  Shield,
} from 'lucide-react';

interface NavbarProps {
  currentUser: AppUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  unpaidCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  unpaidCount,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isCoordinador = currentUser.role === 'coordinador';

  // Available tabs strictly according to role
  const navLinks = isCoordinador
    ? [
        { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
        { id: 'pagos', label: 'Control de Pagos', icon: CreditCard, badge: unpaidCount > 0 ? unpaidCount : null },
        { id: 'gimnastas', label: 'Atletas', icon: Users },
        { id: 'rutinas', label: 'Aparatos FIG', icon: Target },
        { id: 'asistencia', label: 'Pase de Lista', icon: CalendarCheck },
      ]
    : [
        { id: 'gimnastas', label: 'Atletas', icon: Users },
        { id: 'rutinas', label: 'Aparatos FIG', icon: Target },
        { id: 'asistencia', label: 'Pase de Lista', icon: CalendarCheck },
      ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b1326]/95 backdrop-blur-md border-b border-[#222a3d] font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab(isCoordinador ? 'dashboard' : 'gimnastas')}
          >
            <div className="w-10 h-10 rounded-xl bg-[#131b2e] border border-[#4cd7f6]/40 flex items-center justify-center shadow-[0_0_15px_rgba(76,215,246,0.25)]">
              <GymnastLogoIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">GymCoach</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#003640] text-[#4cd7f6] border border-[#4cd7f6]/40">
                  PRO ELITE
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-[#8e909f] font-medium tracking-wide">
                ESCUELA DE GIMNASIA ARTÍSTICA
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Role based) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#131b2e]/60 p-1.5 rounded-xl border border-[#222a3d]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#1e40af] text-white shadow-[0_0_12px_rgba(30,64,175,0.5)] border-t border-white/20'
                      : 'text-[#c4c5d5] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4cd7f6]' : 'text-[#8e909f]'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User profile & Actions */}
          <div className="flex items-center gap-3">
            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#131b2e] border border-[#222a3d] hover:border-[#4cd7f6]/40 transition-all text-left"
              >
                <img
                  src={
                    currentUser.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  }
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-lg object-cover border border-[#4cd7f6]/30"
                />
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-white leading-tight">{currentUser.displayName}</p>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isCoordinador ? 'text-[#4cd7f6]' : 'text-emerald-400'
                    }`}
                  >
                    {isCoordinador ? 'Coordinador' : 'Profesor'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#8e909f]" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-[#131b2e] border border-[#222a3d] rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-[#222a3d] mb-1">
                    <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                    <p className="text-[11px] text-[#8e909f] font-mono truncate">{currentUser.email}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCoordinador
                          ? 'bg-[#1e40af] text-white'
                          : 'bg-[#003640] text-[#4cd7f6] border border-[#4cd7f6]/40'
                      }`}
                    >
                      {isCoordinador ? 'ROL COORDINADOR' : 'ROL PROFESOR'}
                    </span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
