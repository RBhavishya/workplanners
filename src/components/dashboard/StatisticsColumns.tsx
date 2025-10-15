import { ColumnDef } from "@tanstack/react-table";

export type TaskStats = {
  id: number;
  name: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  serial?: number;
};

export const getStatisticsColumns = (): ColumnDef<TaskStats>[] => [
  {
    id: "sno",
    header: () => <span>S.No</span>,
    cell: ({ row }) => <span>{row.original.serial}</span>,
    size: 80,
  },
  {
    accessorFn: (row: any) => row.display_name,
    id: "name",
    cell: (info: any) => (
      <span className="capitalize">{info.getValue() || "-"}</span>
    ),
    header: () => <span>Name</span>,
  },
  {
    accessorFn: (row: any) => row.total_tasks,
    id: "total",
    cell: (info: any) => <span>{info.getValue() || "-"}</span>,
    header: () => <span>Total Tasks</span>,
  },
  {
    accessorFn: (row: any) => row.completed_tasks,
    id: "completed",
    cell: (info: any) => <span>{info.getValue() || "-"}</span>,
    header: () => <span>Completed</span>,
  },
  {
    accessorFn: (row: any) => row.in_progress_tasks,
    id: "inProgress",
    cell: (info: any) => <span>{info.getValue() || "-"}</span>,
    header: () => <span>In Progress</span>,
  },
  {
    accessorFn: (row: any) => row.pending_tasks,
    id: "pending",
    cell: (info: any) => <span>{info.getValue() || "-"}</span>,
    header: () => <span>Overdue</span>,
  },
];
