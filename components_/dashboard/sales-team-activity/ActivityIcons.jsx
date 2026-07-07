export const CheckboxIcon = ({ checked }) => {
  if (checked) {
    return (
      <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" aria-label="Checked">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M7 12.5L10.2 15.7L17 8.9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" aria-label="Unchecked">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

export const FacebookIcon = () => (
  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor" aria-label="Facebook">
    <path d="M24 12a12 12 0 10-13.88 11.85v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.66 4.53-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87V12h3.33l-.53 3.46h-2.8v8.39A12 12 0 0024 12z" />
  </svg>
);

export const MessengerIcon = () => (
  <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor" aria-label="Messenger">
    <path d="M12 2C6.48 2 2 6.15 2 11.27c0 2.92 1.47 5.52 3.77 7.21V22l3.25-1.8c.87.24 1.8.37 2.78.37 5.52 0 10-4.15 10-9.27S17.52 2 12 2zm1.02 12.5l-2.55-2.72-4.98 2.72 5.47-5.8 2.6 2.72 4.92-2.72-5.46 5.8z" />
  </svg>
);

export const KpiIcon = ({ label, className = "h-4 w-4" }) => {
  const base = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (label === "Total Records") {
    return <svg {...base}><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
  }
  if (label.includes("Customer")) {
    return (
      <svg {...base}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c1.8-3.3 4.1-5 7-5s5.2 1.7 7 5" />
      </svg>
    );
  }
  if (label.includes("Facebook")) {
    return (
      <svg {...base} fill="currentColor" stroke="none">
        <path d="M24 12a12 12 0 10-13.88 11.85v-8.39H7.08V12h3.04V9.36c0-3 1.79-4.66 4.53-4.66 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87V12h3.33l-.53 3.46h-2.8v8.39A12 12 0 0024 12z" />
      </svg>
    );
  }
  if (label.includes("Messenger")) {
    return (
      <svg {...base} fill="currentColor" stroke="none">
        <path d="M12 2C6.48 2 2 6.15 2 11.27c0 2.92 1.47 5.52 3.77 7.21V22l3.25-1.8c.87.24 1.8.37 2.78.37 5.52 0 10-4.15 10-9.27S17.52 2 12 2zm1.02 12.5l-2.55-2.72-4.98 2.72 5.47-5.8 2.6 2.72 4.92-2.72-5.46 5.8z" />
      </svg>
    );
  }
  if (label.includes("Bot")) {
    return <svg {...base}><path d="M12 2a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2zm-2 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM8 15h8" /></svg>;
  }
  if (label.includes("Visit")) {
    return <svg {...base}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
  }
  if (label.includes("Sold") || label.includes("Sale")) {
    return <svg {...base}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
  }
  if (label.includes("Profile")) {
    return <svg {...base}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  }
  if (label.includes("Seriousness")) {
    return <svg {...base}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
  }
  if (label.includes("Interested")) {
    return <svg {...base}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
  }
  return <svg {...base}><path d="M4 20V8m6 12V4m6 16v-8" /></svg>;
};
