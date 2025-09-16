import AddTaskForm from '@/components/Taskfiles/AddTaskForm';
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/tasks/edit/$id/')({
 component: () => {
    const { id } = useParams({ from: '/_layout/tasks/edit/$id/' });
    return <AddTaskForm mode="edit" taskData={Number(id)} />;
  },
});

