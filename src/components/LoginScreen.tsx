import React, { useState } from 'react';
import { AppUser } from '../types';
import { GymnastLogoIcon } from './GymnastIcon';
import { loginWithGoogle, logoutUser } from '../firebase';
import { AlertCircle, Shield, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await loginWithGoogle();

      if (res.user && res.user.email) {
        const email = res.user.email.toLowerCase().trim();

        // 1) Coordinator check
        if (email === 'profesunlp@gmail.com') {
          onLoginSuccess({
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName || 'Coordinador UNLP',
            photoURL: res.user.photoURL || undefined,
            role: 'coordinador',
          });
          return;
        }

        // 2) Staff / Professor check
        if (email === 'mi.xt1032@gmail.com') {
          onLoginSuccess({
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName || 'Profesor de Gimnasia',
            photoURL: res.user.photoURL || undefined,
            role: 'profesor',
          });
          return;
        }

        // Any other email is unauthorized and disconnected immediately
        await logoutUser();
        setErrorMsg('Tu cuenta no está autorizada.');
        return;
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err?.code === 'auth/popup-blocked') {
        setErrorMsg('El navegador bloqueó la ventana emergente de Google. Habilitá las ventanas emergentes para iniciar sesión.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('La ventana de Google fue cerrada antes de completar el acceso.');
      } else {
        setErrorMsg('Ocurrió un error al conectar con Google. Por favor, intentá nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b1326] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background radial glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1e40af]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#4cd7f6]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#8b5cf6]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Branding */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#131b2e] border border-[#4cd7f6]/40 flex items-center justify-center shadow-[0_0_12px_rgba(76,215,246,0.25)]">
            <GymnastLogoIcon className="w-5 h-5" />
          </div>
          <span className="text-sm font-extrabold tracking-wider text-white">
            GYMCOACH <span className="text-[#4cd7f6]">PRO ELITE</span>
          </span>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#131b2e] border border-[#222a3d] text-[#4cd7f6]">
          UNLP · FIG
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-6">
        <div className="bg-[#131b2e]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#4cd7f6] to-transparent opacity-80" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-[#171f33] border border-[#4cd7f6]/30 mb-3 shadow-[0_0_20px_rgba(76,215,246,0.15)]">
              <GymnastLogoIcon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              GymCoach Pro Elite
            </h1>
            <p className="text-xs text-[#c4c5d5] mt-1 max-w-xs mx-auto">
              Escuela de Gimnasia Artística · Proyecto <span className="font-mono text-[#4cd7f6]">gymcoachpro-c0c8e</span>
            </p>
          </div>

          {/* Primary Action: Google Login */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-[#171f33] hover:bg-[#222a3d] border border-[#4cd7f6]/40 hover:border-[#4cd7f6] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(76,215,246,0.15)] disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Verificando autorización...' : 'Iniciar Sesión con Google'}</span>
            </button>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in shadow-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed font-medium">{errorMsg}</span>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-[#0b1326]/60 border border-[#222a3d] text-center space-y-1 text-[11px] text-[#8e909f]">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#dae2fd] font-semibold">
                <Shield className="w-3.5 h-3.5 text-[#4cd7f6]" />
                <span>Control de Acceso Seguro (RBAC)</span>
              </div>
              <p>
                El acceso para entrenadores debe ser previamente habilitado por el coordinador general desde el sistema.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights footer */}
      <div className="w-full max-w-md mx-auto z-10 pt-2 pb-4">
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-[#8e909f]">
          <div className="p-2 rounded-xl bg-[#131b2e]/50 border border-[#222a3d]/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4cd7f6] mx-auto mb-1" />
            <span>Google Auth</span>
          </div>
          <div className="p-2 rounded-xl bg-[#131b2e]/50 border border-[#222a3d]/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4cd7f6] mx-auto mb-1" />
            <span>Aparatos FIG</span>
          </div>
          <div className="p-2 rounded-xl bg-[#131b2e]/50 border border-[#222a3d]/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4cd7f6] mx-auto mb-1" />
            <span>Seguridad Firestore</span>
          </div>
        </div>
      </div>
    </div>
  );
};
