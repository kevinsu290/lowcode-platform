// src/components/icons.jsx

const base = (props) => ({
  width: props.size || 18,
  height: props.size || 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: props.strokeWidth || 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: props.className || "",
  style: props.style || {},
});

export function IconUsers(props = {}) {
  const p = base(props);
  return (
    <svg {...p} aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconShield(props = {}) {
  const p = base(props);
  return (
    <svg {...p} aria-hidden="true">
      <path d="M12 22s8-4 8-10V7l-8-4-8 4v5c0 6 8 10 8 10Z" />
    </svg>
  );
}

export function IconGraduationCap(props = {}) {
  const p = base(props);
  return (
    <svg {...p} aria-hidden="true">
      <path d="m22 10-10-5L2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 .9 2.7 2 6 2s6-1.1 6-2v-5" />
    </svg>
  );
}

export function IconChartBar(props = {}) {
  const p = base(props);
  return (
    <svg {...p} aria-hidden="true">
      <path d="M3 21h18" />
      <rect x="7" y="10" width="3" height="7" rx="1" />
      <rect x="12" y="6" width="3" height="11" rx="1" />
      <rect x="17" y="13" width="3" height="4" rx="1" />
    </svg>
  );
}

export function IconCalendar(props = {}) {
  const p = base(props);
  return (
    <svg {...p} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function IconCheckCircle(props = {}) {
  const p = base(props);
  return (
    <svg {...p} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconClipboardList(props = {}) {
  const p = base(props);
  return (
    <svg {...p} aria-hidden="true">
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <path d="M9 7H8a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

export function IconClock(props = {}) {
  const p = base(props);
  return (
    <svg {...p} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
