// routes/projects/edit/$id.tsx
import AddProjectForm from "@/components/projectfiles/AddProjectForm";
import { useParams, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/projects/edit/$id/")({
  component: () => {
    const { id } = useParams({ from: "/_layout/projects/edit/$id/" });
    return <AddProjectForm mode="edit" projectId={Number(id)} nextId={null} />;
  },
});
