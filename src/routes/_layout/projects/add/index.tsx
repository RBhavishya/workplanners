import AddProjectForm from "@/components/project/AddProject";
import { createFileRoute } from "@tanstack/react-router";

const AddProjectFormWrapper = () => {
  const nextId = 1;
  return <AddProjectForm mode="create" nextId={nextId} />;
};

export const Route = createFileRoute("/_layout/projects/add/")({
  component: AddProjectFormWrapper,
});
