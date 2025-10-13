import { Link } from "@tanstack/react-router";
import { LayoutGrid, LogOutIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ProjectsIcon } from "../icons/ProjectsIcon";
import { TasksIcon } from "../icons/TasksIcon";
import { UsersIcon } from "../icons/UsersIcon";
import { Button } from "../ui/button";

const Sidebar = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const user_type = user?.user_type;

  const activeProps = {
    className: "bg-violet-100 text-violet-600 font-normal",
  };

  return (
    <aside className="w-54 bg-white border-r fixed left-0 top-0 h-full p-0 flex flex-col shadow-none z-10">
      {/* <div className='border-b p-3'> <UserDetails/></div> */}
      <nav className="flex flex-col space-y-4 mt-15 p-3 flex-grow">
        {user_type !== "EMPLOYEE" && (
          <Link
            to="/dashboard"
            className="flex items-center px-3 py-1 group text-gray-700 group hover:bg-violet-100 hover:text-violet-600 transition-colors rounded-none"
            activeProps={{ className: activeProps.className }}
          >
            <LayoutGrid
              className="mr-3 w-5 h-5 text-neutral-500 group-hover:text-violet-600"
              strokeWidth={1}
            />
            Dashboard
          </Link>
        )}
        <Link
          to="/tasks"
          className="flex items-center px-3 py-1 text-gray-700 hover:bg-violet-100 hover:text-violet-600 transition-colors rounded-none"
          activeProps={{ className: activeProps.className }}
        >
          <TasksIcon className="mr-3 w-4 h-4" />
          Tasks
        </Link>
        <Link
          to="/projects"
          className="flex items-center px-3 py-1 rounded-none text-gray-700 hover:bg-violet-100 hover:text-violet-600 transition-colors"
          activeProps={{ className: activeProps.className }}
        >
          <ProjectsIcon className="mr-3 w-4 h-4" />
          Projects
        </Link>
        {user_type !== "EMPLOYEE" && (
          <Link
            to="/users"
            className="flex items-center px-3 py-1 group rounded-none text-gray-700 hover:bg-violet-100 hover:text-violet-600 transition-colors"
            activeProps={{ className: activeProps.className }}
          >
            <UsersIcon className="mr-3 w-4 h-4" />
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
        className="text-gray-700 ml-3 flex justify-start hover:bg-red-100 bg-transparent hover:text-red-600 transition-colors cursor-pointer rounded-none"
      >
        <LogOutIcon className="w-4 h-4" />
        Logout
      </Button>
    </aside>
  );
};

export default Sidebar;
