import { Link } from "@tanstack/react-router";
import { LayoutGrid, LogOutIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ProjectsIcon } from "../icons/ProjectsIcon";
import { TasksIcon } from "../icons/TasksIcon";
import { UsersIcon } from "../icons/UsersIcon";
import { Button } from "../ui/button";
import { DashboardIcon } from "../icons/Dashboard/DashboardIcon";

const Sidebar = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const user_type = user?.user_type;

  const activeProps = {
    className: "bg-violet-100 text-violet-600 font-normal",
    link: "flex items-center px-3 py-1 group text-base 3xl:!text-lg text-gray-700 group hover:bg-violet-100 hover:text-violet-600 transition-colors rounded-none",
    icon: "mr-3 w-4 h-4 3xl:!w-5 3xl:!h-5 group:text-violet-600",
  };

  

  return (
    <aside className="w-54 bg-white border-r fixed left-0 top-0 h-full p-0 flex flex-col shadow-none z-10">
      {/* <div className='border-b p-3'> <UserDetails/></div> */}
      <nav className="flex flex-col space-y-4 mt-15 p-3 flex-grow">
        {user_type !== "EMPLOYEE" && user_type !== "TEAM_LEAD" && (
          <Link
            to="/dashboard"
            className={activeProps.link}
            activeProps={{ className: activeProps.className }}
          >
            <DashboardIcon className={activeProps.icon} />
            Dashboard
          </Link>
        )}
        <Link
          to="/tasks"
          className={activeProps.link}
          activeProps={{ className: activeProps.className }}
        >
          <TasksIcon className={activeProps.icon} />
          Tasks
        </Link>
        <Link
          to="/projects"
          className={activeProps.link}
          activeProps={{ className: activeProps.className }}
        >
          <ProjectsIcon className={activeProps.icon} />
          Projects
        </Link>
        {user_type !== "EMPLOYEE" && user_type !== "TEAM_LEAD" && (
          <Link
            to="/users"
            className={activeProps.link}
            activeProps={{ className: activeProps.className }}
          >
            <UsersIcon className={activeProps.icon} />
            Users
          </Link>
        )}
      </nav>
      <Button
        onClick={() => {
          // Optional: clear auth/session if needed
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");

          // Navigate to dashboard
          navigate({ to: "/" });
        }}
        className="text-gray-700 ml-3 flex justify-start text-base 3xl:!text-lg hover:bg-red-100 bg-transparent hover:text-red-600 transition-colors cursor-pointer rounded-none"
      >
        <LogOutIcon className="w-4 h-4" />
        Logout
      </Button>
    </aside>
  );
};

export default Sidebar;
