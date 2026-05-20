import SelectBase from "react-select";
import { sharedSelectStyles, getMenuPortalTarget } from "./selectConfig";

const Select = ({ ...props }) => (
  <SelectBase
    {...props}
    menuPortalTarget={getMenuPortalTarget()}
    menuPosition="fixed"
    styles={sharedSelectStyles}
  />
);

export const UserRatioTab = ({ userRatioOptions, selectedRatioUser, setSelectedRatioUser, ratioCharts }) => (
  <div className="p-4 space-y-4">
    <div className="max-w-sm">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Select User</span>
        <Select
          options={userRatioOptions}
          value={userRatioOptions.find((o) => o.value === selectedRatioUser) || null}
          onChange={(s) => setSelectedRatioUser(s?.value || "")}
          placeholder="Select user"
          className="text-sm"
          classNamePrefix="react-select"
        />
      </label>
    </div>

    {!selectedRatioUser ? (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Select a user to view ratio charts.
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {ratioCharts.map((chart) => {
          const totalValue = chart.series.reduce((sum, item) => sum + item.value, 0);
          const safeTotal = totalValue || 1;
          const pieStops = (() => {
            let offset = 0;
            return chart.series.map((item) => {
              const start = (offset / safeTotal) * 100;
              offset += item.value;
              const end = (offset / safeTotal) * 100;
              return `${item.color} ${start}% ${end}%`;
            }).join(", ");
          })();

          return (
            <div key={chart.title} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-800">{chart.title}</h3>
              {chart.subtitle && <p className="mt-1 text-xs text-slate-500">{chart.subtitle}</p>}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
                <div className="mx-auto">
                  <div
                    className="h-40 w-40 rounded-full border border-slate-200"
                    style={{
                      background: totalValue > 0
                        ? `conic-gradient(${pieStops})`
                        : "conic-gradient(#e2e8f0 0% 100%)",
                    }}
                  />
                  <p className="mt-2 text-center text-xs text-slate-500">Total: {totalValue}</p>
                </div>
                <div className="space-y-2">
                  {chart.series.map((item) => {
                    const percent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                    return (
                      <div key={item.label} className="flex items-center justify-between rounded-md border border-slate-100 px-2 py-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-800 tabular-nums">
                          {item.value} ({percent.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
