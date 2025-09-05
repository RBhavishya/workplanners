import Sidebar from "@/components/SideBar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
  component: Layout,
});

function Layout() {
  return (
    <div className=" flex">
      <div className="">
        <Sidebar />
      </div>
      <div className="ml-[250px] flex-1 h-screen overflow-y-auto ">
        <Outlet />
      </div>
    </div>
  );
}
