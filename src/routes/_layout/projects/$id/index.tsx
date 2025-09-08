import Viewdetails from "@/components/projectfiles/ViewDetails";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/projects/$id/")({
  component: Viewdetails,
});
