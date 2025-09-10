
import Tasks from "@/components/Taskfiles/Tasks";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/tasks/")({
  component: Tasks,
});
