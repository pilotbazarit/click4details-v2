'use client'

import React from 'react'
import { Button } from "@/components/ui/button"

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange = () => {}
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (totalPages === 0) return null

  // Limit page buttons shown
  const visiblePages = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  const start = (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(start + itemsPerPage - 1, totalItems)

  return (
    <div className="flex justify-between items-center w-full px-4 py-3 border-t border-gray-200 bg-white">
      <span className="text-sm text-gray-600">
        Showing <span className="font-medium">{start}</span> to <span className="font-medium">{end}</span> of <span className="font-medium">{totalItems}</span> results
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-sm px-3"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {visiblePages().map((page, idx) => (
            typeof page === 'number' ? (
              <Button
                key={idx}
                size="sm"
                className={`px-3 text-sm ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                variant={currentPage === page ? 'default' : 'outline'}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={idx} className="px-2 text-sm text-blue-500">...</span>
            )
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-sm px-3"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Pagination
