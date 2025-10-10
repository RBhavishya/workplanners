import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React, { useEffect, useState } from "react";
import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
 Pagination as ShadCNPagination,
} from "../ui/pagination";
import { DynamicPaginationProps } from "@/interfaces";


const TasksPagination = ({
  capturePageNum,
  captureRowPerItems,
  initialPage = 1,
  limitOptionsFromProps,
  paginationDetails,
}: DynamicPaginationProps) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageValue, setPageValue] = useState<number>(initialPage);
  const [limitOptions, setLimitOptions] = useState<
    { title: string; value: number }[]
  >([]);

  const totalPages = paginationDetails ? paginationDetails.total_pages : 1;
  const selectedValue = paginationDetails?.page_size;

  useEffect(() => {
    setLimitOptions(
      limitOptionsFromProps?.length
        ? limitOptionsFromProps
        : [
            { title: "25/page", value: 25 },
            { title: "50/page", value: 50 },
            { title: "100/page", value: 100 },
          ]
    );
  }, [limitOptionsFromProps]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageValue(page);
      capturePageNum(page);
    }
  };

  const handleRowChange = (newLimit: string) => {
    captureRowPerItems(Number(newLimit));
  };

  const onKeyDownInPageChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = Math.max(1, Math.min(Number(pageValue) || 1, totalPages));
      handlePageChange(page);
    }
  };

  useEffect(() => {
    if (paginationDetails?.current_page) {
      setPageValue(paginationDetails.current_page);
      setCurrentPage(paginationDetails.current_page);
    }
  }, [paginationDetails]);

const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pageNumbers: (number | null)[] = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    // Show all pages if totalPages is small
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push(null); // Ellipsis
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pageNumbers.push(1);
      pageNumbers.push(null); // Ellipsis
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Somewhere in the middle
      pageNumbers.push(1);
      pageNumbers.push(null); // Ellipsis
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push(null); // Ellipsis
      pageNumbers.push(totalPages);
    }
  }

  return pageNumbers;
};

  return (
    <ShadCNPagination className="flex justify-between px-2 py-0 m-0">
      <PaginationContent className="px-1 py-0 flex gap-2">
        <p className="text-sm 3xl:!text-base">Total {paginationDetails?.total_records || "0"}</p>
        <Select
          value={selectedValue?.toString()}
          onValueChange={handleRowChange}
        >
          <SelectTrigger className="w-[120px] rounded-sm !h-7">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent className="max-w-[100px] bg-white cursor-pointer border-none shadow-[0px_0px_0px_1px_rgba(0,0,0,0.1)]">
            {limitOptions.map((item, index) => (
              <SelectItem
                value={item.value?.toString()}
                key={index}
                className="cursor-pointer"
              >
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PaginationContent>

      <div className="flex justify-end items-center">
        <PaginationContent className="px-1 py-0">
          <div className="flex items-center text-sm 3xl:!text-base">
            GoTo
            <Input
              // type="number"
              value={pageValue}
              onChange={(e) => setPageValue(Number(e.target.value))}
              onKeyDown={onKeyDownInPageChange}
              className="w-10 h-8 flex items-center border rounded-sm shadow-none font-normal focus:outline-none focus:ring-0 focus-visible:ring-0 text-sm 3xl:!text-base ml-2"
              placeholder="Page"
            />
          </div>
        </PaginationContent>

        <PaginationContent className="px-1 py-0">
          <PaginationItem>
            <PaginationPrevious
              href={currentPage === 1 ? undefined : "#"}
              onClick={(e) => {
                if (currentPage === 1) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
              aria-disabled={currentPage === 1}
              className={`${
                currentPage === 1
                  ? "pointer-events-none cursor-not-allowed opacity-50 font-normal"
                  : "cursor-pointer opacity-100 font-normal"
              }`}
            />
          </PaginationItem>

           {getPageNumbers(currentPage, totalPages).map((pageNumber, index) =>
            pageNumber === null ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={pageNumber === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNumber);
                  }} 
                  className={`font-normal rounded-full w-6 h-6 shadow-none text-xs 3xl:!text-sm ${
                    pageNumber === currentPage
                      ? "pointer-events-none cursor-not-allowed bg-violet-500 text-white"
                      : "cursor-pointer opacity-100"
                  }`}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href={currentPage === totalPages ? undefined : "#"}
              onClick={(e) => {
                if (currentPage === totalPages) {
                  e.preventDefault();
                  return;
                }
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
              aria-disabled={currentPage === totalPages}
              className={`${
                currentPage === totalPages
                  ? "pointer-events-none cursor-not-allowed opacity-50 font-normal"
                  : "cursor-pointer opacity-100 font-normal"
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </div>
    </ShadCNPagination>
  );
};

export default TasksPagination;
