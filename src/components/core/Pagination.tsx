import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DynamicPaginationProps {
  paginationDetails: {
    total_records: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    next_page: number | null;
    prev_page: number | null;
  };
  pageSize?: number;
  setPage?: (page: number) => void;
  setPageSize?: (size: number) => void;
}

export const Pagination = ({
  paginationDetails,
  pageSize,
  setPage,
  setPageSize,
}: DynamicPaginationProps) => {
  const getPageNumbers = () => {
    const currentPage = paginationDetails.current_page ?? 1;
    const totalPages = paginationDetails.total_pages ?? 1;
    const maxPagesToShow = 5;
    const pages: (number | string)[] = [];

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfWindow = Math.floor(maxPagesToShow / 2);
      let startPage = Math.max(1, currentPage - halfWindow);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const displayPageSize = pageSize ?? paginationDetails.page_size ?? 15;
  const displayTotalRecords = paginationDetails.total_records;
  const currentPage = paginationDetails.current_page ?? 1;

  // Calculate range
  const startRecord = (currentPage - 1) * displayPageSize + 1;
  const endRecord = Math.min(
    currentPage * displayPageSize,
    displayTotalRecords
  );

  return (
    <div className="flex items-center justify-between w-full bottom:0 left:0 overflow-none">
      {/* Left Section: Page size & showing text */}
      <div className="bg-white rounded flex flex-cols ">
        <div className="flex items-center gap-3">
          <Select
            value={displayPageSize.toString()}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              setPageSize?.(newPageSize);
              setPage?.(1); // reset to page 1
            }}
          >
            <SelectTrigger className="w-40 h-8 text-sm border border-gray-300 rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10,25, 50, 75, 100].map((size) => (
                <SelectItem
                  key={size}
                  value={size.toString()}
                  className="text-sm"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-sm text-gray-600">
            Showing {startRecord} to {endRecord} from {displayTotalRecords} data
          </span>
        </div>
      </div>

      {/* Right Section: Pagination Controls */}
      <div className="ml-190 bg-white rounded flex justify-end ">
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            className="flex items-center justify-center w-8 h-8 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => setPage?.(paginationDetails.current_page - 1)}
            disabled={paginationDetails.current_page === 1}
            aria-label="Previous page"
          >
            Prev
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {typeof page === "number" ? (
                <button
                  className={`flex items-center justify-center w-7 h-7 text-sm font-medium rounded ${
                    paginationDetails.current_page === page
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => setPage?.(page)}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </button>
              ) : (
                <span className="flex items-center justify-center w-8 h-8 text-sm text-gray-500">
                  {page}
                </span>
              )}
            </React.Fragment>
          ))}

          {/* Next */}
          <button
            className="flex items-center justify-center w-8 h-8 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => setPage?.(paginationDetails.current_page + 1)}
            disabled={
              paginationDetails.current_page === paginationDetails.total_pages
            }
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
