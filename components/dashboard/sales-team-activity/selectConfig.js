export const sharedSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderColor: state.isFocused ? "#818cf8" : base.borderColor,
    boxShadow: state.isFocused ? "0 0 0 2px rgba(129,140,248,0.22)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#818cf8" : "#94a3b8",
    },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 80 }),
  menu: (base) => ({ ...base, zIndex: 80, borderRadius: 10, overflow: "hidden" }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#4f46e5" : state.isFocused ? "#eef2ff" : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1f2937",
  }),
};

export const getMenuPortalTarget = () =>
  typeof window !== "undefined" ? document.body : null;
