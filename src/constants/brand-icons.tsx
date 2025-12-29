import { type SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  className?: string;
};



export function GeminiIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill="url(#gemini-gradient)"
      />
    </svg>
  );
}

export function AmpIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M13 2L4 14h7v8l9-12h-7V2z"
        fill="#FF5543"
        stroke="#FF5543"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CopilotIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
        fill="#000"
        className="dark:fill-white"
      />
      <path
        d="M7 10.5C7 9.67 7.67 9 8.5 9s1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5S7 14.33 7 13.5v-3zM14 10.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v3c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-3z"
        fill="#fff"
        className="dark:fill-black"
      />
      <path
        d="M8.5 17c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2"
        stroke="#fff"
        className="dark:stroke-black"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function CursorIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect width="24" height="24" rx="6" fill="#000" className="dark:fill-white" />
      <path
        d="M7 7l10 5-4 1.5L11.5 18 7 7z"
        fill="#fff"
        className="dark:fill-black"
      />
    </svg>
  );
}

export function DroidIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect width="100" height="100" rx="12" fill="#000" />
      <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M50 20 Q55 35 50 50 Q45 35 50 20" />
        <path d="M50 80 Q45 65 50 50 Q55 65 50 80" />
        <path d="M20 50 Q35 45 50 50 Q35 55 20 50" />
        <path d="M80 50 Q65 55 50 50 Q65 45 80 50" />
        <path d="M29 29 Q42 38 50 50 Q38 42 29 29" />
        <path d="M71 71 Q58 62 50 50 Q62 58 71 71" />
        <path d="M71 29 Q62 42 50 50 Q58 38 71 29" />
        <path d="M29 71 Q38 58 50 50 Q42 62 29 71" />
      </g>
    </svg>
  );
}

export function AuggieIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="#6366F1" />
      <path
        d="M8 10a1 1 0 102 0 1 1 0 00-2 0zM14 10a1 1 0 102 0 1 1 0 00-2 0z"
        fill="#fff"
      />
      <path
        d="M8 14c0 2.21 1.79 4 4 4s4-1.79 4-4H8z"
        fill="#fff"
      />
      <path
        d="M6 6l2 2M18 6l-2 2"
        stroke="#6366F1"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RovoDevIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        fill="#0052CC"
      />
      <path
        d="M2 17l10 5 10-5"
        stroke="#0052CC"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M2 12l10 5 10-5"
        stroke="#4C9AFF"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

export function KiloCodeIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" fill="#1E293B" className="dark:fill-slate-700" />
      <path
        d="M7 8l3 4-3 4M12 16h5"
        stroke="#10B981"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OpenCodeIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 2L2 7v10l10 5 10-5V7L12 2z"
        fill="#8B5CF6"
      />
      <path
        d="M9 9l-3 3 3 3M15 9l3 3-3 3"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LettaCodeIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" fill="#EC4899" />
      <path
        d="M8 8v8M8 16h6"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QoderIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="12" cy="11" r="8" fill="#F97316" />
      <path
        d="M15 14l4 4"
        stroke="#F97316"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M9 9l2 2-2 2M13 9l2 2-2 2"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VSCodeIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M17 2l5 2.5v15L17 22l-10-8 10-12z"
        fill="#007ACC"
      />
      <path
        d="M17 2L7 14l-5-4V10l5 4L17 2z"
        fill="#1F9CF0"
      />
      <path
        d="M7 14l-5 4v4l5-4 10 4V2L7 14z"
        fill="#0065A9"
      />
    </svg>
  );
}

export function WindsurfIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="windsurf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4AA" />
          <stop offset="100%" stopColor="#0096FF" />
        </linearGradient>
      </defs>
      <path
        d="M4 16c2-2 4-3 8-3s6 1 8 3c-2-6-5-10-8-12-3 2-6 6-8 12z"
        fill="url(#windsurf-gradient)"
      />
      <path
        d="M12 4v9M6 18h12"
        stroke="url(#windsurf-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AntigravityIcon({ className = 'w-4 h-4', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="antigravity-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#antigravity-gradient)" />
      <path
        d="M12 6v8M8 10l4-4 4 4"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17" r="1.5" fill="#fff" />
    </svg>
  );
}
