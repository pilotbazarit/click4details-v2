import { EMPLOYEE_ACTIVITY_COLUMN_COUNT } from "./constants";

const COLS = [
  { key: "records", label: "Records" },
  { key: "customerNames", label: "Customer name", title: "Distinct customer names on rows this employee touched" },
  { key: "customerMobiles", label: "Customer mobile", title: "Distinct customer mobile numbers on rows this employee touched" },
  { key: "dataCollect", label: "Data collect" },
  { key: "totalSale", label: "Total Sale", title: "Activity rows where this employee is Sold by and Sale done is checked" },
  { key: "firstVisit", label: "Visit 1" },
  { key: "secondVisit", label: "Visit 2" },
  { key: "thirdVisit", label: "Visit 3" },
  { key: "botMessage", label: "Bot msg", title: "Rows where Bot message is checked" },
  { key: "interested", label: "Interested", title: "Rows where Interested is checked (same field as All Activity table)" },
  { key: "withFacebook", label: "FB link", title: "Rows with a Facebook link" },
  { key: "withMessenger", label: "Msg link", title: "Rows with a Messenger link" },
];

export const EmployeeSummaryTable = ({
  loading,
  pagedEmployeeRows,
  sortedEmployeeRows,
  employeeSummaryTotals,
  filteredRows,
  toggleEmployeeSort,
  getEmployeeSortIndicator,
}) => (
  <table className="min-w-full text-sm">
    <thead className="bg-gray-50">
      <tr className="text-xs uppercase tracking-wider text-gray-600">
        <th className="px-3 py-2 text-left sticky left-0 z-10 bg-gray-50 min-w-[9rem]">
          <button type="button" onClick={() => toggleEmployeeSort("name")} className="inline-flex items-center gap-1">
            Employee <span className="text-[10px]">{getEmployeeSortIndicator("name")}</span>
          </button>
        </th>
        {COLS.map(({ key, label, title }) => (
          <th key={key} className="px-3 py-2 text-center whitespace-nowrap" title={title}>
            <button type="button" onClick={() => toggleEmployeeSort(key)} className="inline-flex items-center gap-1">
              {label} <span className="text-[10px]">{getEmployeeSortIndicator(key)}</span>
            </button>
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {!loading && pagedEmployeeRows.map((row) => (
        <tr key={row.name} className="group hover:bg-gray-50">
          <td className="px-3 py-2 text-left font-medium text-gray-900 whitespace-nowrap sticky left-0 z-[1] bg-white shadow-[1px_0_0_0_rgb(243_244_246)] group-hover:bg-gray-50">
            {row.name}
          </td>
          {COLS.map(({ key }) => (
            <td key={key} className="px-3 py-2 text-center tabular-nums">{row[key]}</td>
          ))}
        </tr>
      ))}
      {!loading && pagedEmployeeRows.length === 0 && (
        <tr>
          <td className="px-3 py-8 text-center text-gray-500" colSpan={EMPLOYEE_ACTIVITY_COLUMN_COUNT}>
            {filteredRows.length === 0
              ? "No report rows match the current search or filters."
              : "No employee names were found on the filtered records."}
          </td>
        </tr>
      )}
      {loading && (
        <tr>
          <td className="px-3 py-8 text-center text-gray-500" colSpan={EMPLOYEE_ACTIVITY_COLUMN_COUNT}>
            Loading report data...
          </td>
        </tr>
      )}
    </tbody>
    {!loading && sortedEmployeeRows.length > 0 && (
      <tfoot className="bg-indigo-50/70 border-t border-indigo-100">
        <tr className="text-xs font-semibold uppercase tracking-wide text-indigo-900">
          <td className="px-3 py-2 text-left whitespace-nowrap sticky left-0 z-[1] bg-indigo-50/70 shadow-[1px_0_0_0_rgb(224_231_255)]">
            Total
          </td>
          {COLS.map(({ key }) => (
            <td key={key} className="px-3 py-2 text-center tabular-nums">{employeeSummaryTotals[key]}</td>
          ))}
        </tr>
      </tfoot>
    )}
  </table>
);
