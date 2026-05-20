export const PaginationBar = ({ currentPage, setCurrentPage, totalPages, perPage, activityViewCount }) => (
  <div className="flex items-center justify-between">
    <p className="text-sm text-gray-600">
      Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, activityViewCount)} of {activityViewCount}
    </p>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
      >
        Previous
      </button>
      <span className="px-3 py-1.5 text-sm">Page {currentPage} / {totalPages}</span>
      <button
        type="button"
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
);
