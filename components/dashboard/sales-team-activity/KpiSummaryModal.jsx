import { useDelayedVisibility } from "./useDelayedVisibility";
import { KpiIcon } from "./ActivityIcons";
import { PRIMARY_KPI_LABELS, kpiColorClasses } from "./constants";

export const KpiSummaryModal = ({ isOpen, onClose, kpiModalItems, visitDateKpiRows }) => {
  const isVisible = useDelayedVisibility(isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onTransitionEnd={() => {
        if (!isVisible) onClose();
      }}
    >
      <div
        className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-7xl max-h-[85vh] overflow-hidden rounded-xl border border-slate-200/70 bg-white/20 backdrop-blur-md shadow-2xl transition-all duration-300 ease-out ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300/70 bg-white/70 text-slate-700 hover:bg-white hover:text-slate-900"
          aria-label="Close summary modal"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="px-5 pt-3 pb-1 bg-transparent">
          <h2 className="text-base font-semibold text-slate-900">KPI Summary</h2>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto bg-transparent">
          <div className="grid grid-cols-1 items-stretch sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiModalItems.map((item, index) => {
              const isPrimary = PRIMARY_KPI_LABELS.has(item.label);
              const isVisit = item.label === "Visit Date Summary";
              const colorClass = kpiColorClasses[index % kpiColorClasses.length];
              const heightClass = "h-32";
              const baseCard =
                `flex min-h-0 flex-col justify-between overflow-hidden border shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out transform-gpu ${heightClass} ` +
                (isPrimary
                  ? "rounded-lg px-4 py-3 hover:shadow-[0_18px_36px_rgba(15,23,42,0.20)] hover:-translate-y-1 hover:scale-[1.02] "
                  : "rounded-lg px-3 py-2.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 hover:scale-[1.015] ");

              return (
                <div key={item.label} className={`${baseCard}${colorClass}`}>
                  {isVisit ? (
                    <>
                      <div className="flex min-h-0 items-start justify-between gap-2">
                        <p className={`line-clamp-2 font-semibold leading-snug ${isPrimary ? "text-xs" : "text-[11px]"}`}>
                          Visit Date Summary
                        </p>
                        <span className="opacity-80 shrink-0">
                          <KpiIcon label="Visit Date Summary" className={isPrimary ? "h-12 w-12" : "h-10 w-10"} />
                        </span>
                      </div>
                      <div className="shrink-0 text-xs font-semibold leading-tight sm:text-sm">
                        {visitDateKpiRows.map((visit) => (
                          <p key={visit.label} className="truncate">
                            {visit.label}: {visit.value}
                          </p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex min-h-0 items-start justify-between gap-2">
                        <p className={`line-clamp-2 min-w-0 flex-1 font-semibold leading-snug ${isPrimary ? "text-xs" : "text-[11px]"}`}>
                          {item.label}
                        </p>
                        <span className="opacity-80 shrink-0">
                          <KpiIcon label={item.label} className={isPrimary ? "h-12 w-12" : "h-10 w-10"} />
                        </span>
                      </div>
                      <p className={`shrink-0 truncate font-bold leading-none ${isPrimary ? "text-3xl" : "text-xl"}`}>
                        {item.value}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
