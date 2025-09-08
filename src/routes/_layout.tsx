import Sidebar from "@/components/SideBar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

export const Route = createFileRoute("/_layout")({
  component: Layout,
});

function Layout() {
  return (
    <div className="flex">
      <div>
        <Sidebar />
      </div>
      <div className="ml-[250px] flex-1 h-screen overflow-y-auto">
        <Outlet />
      </div>

      <Toaster
        position="top-center"
        richColors
        duration={2000} // ⏱️ 2 seconds
      />
    </div>
  );
}
