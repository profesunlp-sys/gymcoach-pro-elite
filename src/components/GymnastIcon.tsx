import React from 'react';

export const GymnastLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Dynamic gymnastics ribbon & athletic arch */}
    <path
      d="M8 38C14 26 22 18 32 14C38 11.5 42 14 40 18C38 22 30 24 22 28C14 32 12 39 18 42C24 45 36 41 42 30"
      stroke="#4cd7f6"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="drop-shadow-[0_0_8px_rgba(76,215,246,0.6)]"
    />
    {/* Gymnast silhouette leap */}
    <circle cx="28" cy="11" r="3.5" fill="#dae2fd" />
    <path
      d="M27 15L23 23L16 26"
      stroke="#dae2fd"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M23 23L29 27L36 32"
      stroke="#dae2fd"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M25 19L33 16L39 12"
      stroke="#b8c4ff"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M25 19L19 16L13 18"
      stroke="#b8c4ff"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

export const ApparatusIcon: React.FC<{ apparatus: string; className?: string }> = ({
  apparatus,
  className = 'w-5 h-5',
}) => {
  switch (apparatus) {
    case 'Salto':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          {/* Vault table and spring board */}
          <rect x="4" y="6" width="16" height="4" rx="2" fill="currentColor" fillOpacity="0.2" />
          <path d="M12 10v6" />
          <path d="M8 16h8" />
          <path d="M6 20h12" />
          <path d="M3 18l3-2" />
        </svg>
      );
    case 'Paralelas':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          {/* Uneven bars */}
          <path d="M3 8h18" strokeWidth="2.5" />
          <path d="M3 16h18" strokeWidth="2.5" />
          <path d="M6 8v12" />
          <path d="M18 16v4" />
          <circle cx="12" cy="5" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'Viga':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          {/* Balance beam */}
          <path d="M2 9h20" strokeWidth="3" />
          <path d="M6 9v9" />
          <path d="M18 9v9" />
          <path d="M4 18h4" />
          <path d="M16 18h4" />
          <circle cx="12" cy="6" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'Suelo':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          {/* Floor exercise floor mat with music wave */}
          <rect x="3" y="16" width="18" height="4" rx="1" fill="currentColor" fillOpacity="0.2" />
          <path d="M4 11c3-4 6 4 9 0s5 3 7 0" />
          <circle cx="8" cy="6" r="1.5" fill="currentColor" />
          <path d="M8 8l2 4" />
        </svg>
      );
  }
};
