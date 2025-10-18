import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { FC, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import TasksPagination from "./TasksPagination";
import { pageProps } from "@/interfaces";
import { NoTasksIcon } from "../icons/NoIcons/NoTasksIcon";
import { NoUsersIcon } from "../icons/NoIcons/NoUsersIcon";
import { NoProjectIcon } from "../icons/NoIcons/NoProjectIcon";
import { NoDataIcon } from "../icons/NoIcons/NoDataIcon";

const TanStackTable: FC<pageProps> = ({
  columns,
  data,
  loading = false,
  getData,
  paginationDetails,
  removeSortingForColumnIds,
  height,
  height1,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location?.search);
  const table = useReactTable({
    columns,
    data: data?.length ? data : [],
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const capturePageNum = (value: number) => {
    getData({
      ...searchParams,
      pageSize: searchParams.get("page_size")
        ? searchParams.get("page_size")
        : 25,
      pageIndex: value,
      order_by: searchParams.get("order_by"),
    });
  };
  const captureRowPerItems = (value: number) => {
    getData({
      ...searchParams,
      pageSize: value,
      pageIndex: 1,
      order_by: searchParams.get("order_by"),
    });
  };

  const getWidth = (id: string | undefined) => {
    const widthObj = columns.find((col) => col.id === id);
    return widthObj ? widthObj?.width || widthObj?.size || "100px" : "100px";
  };

  const sortAndGetData = (header: any) => {
    if (
      removeSortingForColumnIds &&
      removeSortingForColumnIds.length &&
      removeSortingForColumnIds.includes(header.id)
    ) {
      return;
    }

    let sortBy = header.id;
    let sortDirection = "asc";
    let orderBy = `${sortBy}:asc`;

    if (searchParams.get("order_by")?.startsWith(header.id)) {
      if (searchParams.get("order_by") === `${header.id}:asc`) {
        sortDirection = "desc";
        orderBy = `${header.id}:desc`;
      } else {
        sortBy = "";
        sortDirection = "";
        orderBy = "";
      }
    }

    getData({
      ...searchParams,
      pageIndex: searchParams.get("page"),
      pageSize: searchParams.get("page_size"),
      order_by: orderBy,
    });
  };

  const NODATA_STYLES = {
    div: "flex flex-col items-center justify-center gap-2 mt-20",
    p: "text-base 3xl:!text-lg text-[#828282] font-normal"

  }

  return (
    <div className="flex flex-col w-full bg-white">
      <div className="overflow-auto" style={{ height: height }}>
      {!data?.length && loading && (
        <div
        className="flex items-center justify-center overflow-hidden"
        style={{ height: height }}
      >
        <img src="/6-dots-scale.svg" alt="loader" width={60} height={60} />
      </div>
      )}
        <table className="w-full text-sm table-fixed">
          <thead className="!sticky top-0 bg-white text-neutral-400 font-normal z-10">
            {table?.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-none h-10">
                {headerGroup.headers.map((header: any, index: number) => (
                  <th
                    key={index}
                    colSpan={header.colSpan}
                    style={{
                      minWidth: getWidth(header.id),
                      width: getWidth(header.id),
                    }}
                    className="cursor-pointer text-sm 3xl:!text-base text-neutral-500 px-1"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className="flex items-center gap-1 select-none"
                        onClick={() => sortAndGetData(header)}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <SortItems
                          header={header}
                          removeSortingForColumnIds={removeSortingForColumnIds}
                        />
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {data?.length > 0 ? (
              table?.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`${
                    rowIndex % 2 === 0 ? "bg-slate-100" : "bg-white"
                  } hover:bg-gray-50 border-none`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="text-[13px] 3xl:!text-base p-0.5 px-2 !h-9"
                      style={{
                        minWidth: getWidth(cell.column.columnDef.id),
                        width: getWidth(cell.column.columnDef.id),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-gray-500 text-center"
                >
                  {location.pathname.includes("tasks") ? (
                    <div className={NODATA_STYLES.div}>
                      <NoTasksIcon className="w-60 h-60" />
                      <p className={NODATA_STYLES.p}>
                        No Tasks Found
                      </p>
                    </div>
                  ) : location.pathname.includes("projects") ? (
                    <div className={NODATA_STYLES.div}>
                      <NoProjectIcon />
                      <p className={NODATA_STYLES.p}>
                        No Projects Found
                      </p>
                    </div>
                  ) : location.pathname.includes("dashboard") ? (
                    <div className={NODATA_STYLES.div}>
                      <NoDataIcon className="w-50 h-50"/>
                      <p className={NODATA_STYLES.p}>
                        No Data Found
                      </p>
                    </div>
                  ) : (
                    <div className={NODATA_STYLES.div}>
                      <NoUsersIcon />
                      <p className={NODATA_STYLES.p}>
                        No Users Found
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="sticky bottom-0">
        <TasksPagination
          paginationDetails={paginationDetails}
          capturePageNum={capturePageNum}
          captureRowPerItems={captureRowPerItems}
        />
      </div>
    </div>
  );
};

export default TanStackTable;

const SortItems = ({
  header,
  removeSortingForColumnIds,
}: {
  header: any;
  removeSortingForColumnIds?: string[];
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location?.search);

  const sortBy = searchParams.get("order_by")?.split(":")[0];
  const sortDirection = searchParams.get("order_by")?.split(":")[1];
  if (removeSortingForColumnIds?.includes(header.id)) {
    return null;
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {sortBy === header.id ? (
        sortDirection === "asc" ? (
          <img src="/table/sort-asc.svg" height={15} width={15} alt="Asc" />
        ) : (
          <img src="/table/sort-desc.svg" height={15} width={15} alt="Desc" />
        )
      ) : (
        <img src="/table/sort-norm.svg" height={15} width={15} alt="No Sort" />
      )}
    </div>
  );
};
