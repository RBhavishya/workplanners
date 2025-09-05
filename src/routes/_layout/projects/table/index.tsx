import ProjectTable from "@/components/core/Tanstacktable";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/projects/table/")({
  component: ProjectTable,
});
