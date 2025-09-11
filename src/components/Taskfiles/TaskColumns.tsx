import dayjs from "dayjs";

export const taskColumns = [
  {
    accessorFn: (row: any) => row.serial,
    id: "serial",
    header: () => <span>S.No</span>,
    footer: (props: any) => props.column.id,
    width: "50px",
    maxWidth: "50px",
    minWidth: "50px",
    cell: (props: any) => (
      <div style={{ textAlign: "left" }}>{props.getValue()}</div>
    ),
  },
  {
    accessorFn: (row: any) => row.fname,
    id: "task_name",
    cell: (info: any) => {
      const title = info.getValue();
      const profilePicUrl = info.row.original.profile_pic_url;
      return (
        <div
          style={{ display: "flex", alignItems: "center", textAlign: "left" }}
        >
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt="Profile"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                marginRight: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                backgroundColor: "#ccc",
                marginRight: 8,
              }}
            />
          )}
          <span className="capitalize">{title ? title : "-"}</span>
        </div>
      );
    },
    width: "150px",
    maxWidth: "150px",
    minWidth: "150px",
    header: () => <span>Task Name</span>,
    footer: (props: any) => props.column.id,
  },
  {
    accessorFn: (row: any) => row.email,
    id: "task_brief",
    cell: (info: any) => {
      let title = info.getValue();
      return <span>{title ? title : "-"}</span>;
    },
    width: "200px",
    maxWidth: "200px",
    minWidth: "200px",
    header: () => <span>Task Brief</span>,
    footer: (props: any) => props.column.id,
  },
  {
    accessorFn: (row: any) => row.designation,
    id: "project_name",
    cell: (info: any) => {
      let title = info.getValue();
      return (
        <div style={{ textAlign: "left" }}>
          <span className="capitalize">{title ? title : "-"}</span>
        </div>
      );
    },
    width: "120px",
    maxWidth: "120px",
    minWidth: "120px",
    header: () => <span>Project Name</span>,
    footer: (props: any) => props.column.id,
  },
{
    accessorFn: (row: any) => row.designation,
    id: "status",
    cell: (info: any) => {
      let title = info.getValue();
      return (
        <div style={{ textAlign: "left" }}>
          <span className="capitalize">{title ? title : "-"}</span>
        </div>
      );
    },
    width: "120px",
    maxWidth: "120px",
    minWidth: "120px",
    header: () => <span>Status</span>,
    footer: (props: any) => props.column.id,
  },
 {
        accessorFn: (row: any) => row.due_date,
        id: "end_date",
        cell: (info: any) => {
          const date: string = info.getValue();
          return <span>{date ? dayjs(date).format("MM-DD-YYYY") : "-"}</span>;
        },
        width: "90px",
        maxWidth: "90px",
        minWidth: "90px",
        header: () => <span>Due Date</span>,
        footer: (props: any) => props.column.id,
      },
];
