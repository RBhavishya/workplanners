import Projects from "@/components/projectfiles/projects";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/projects/")({
  component: Projects,
});
