import Viewdetails from "@/components/project/ViewDetails";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/projects/$id/")({
  component: Viewdetails,
});
