

import AddTaskForm from '@/components/Taskfiles/AddTaskForm';
import AddTask from '@/components/Taskfiles/AddTaskForm'
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/tasks/add/')({
 component: () => {
     const id = 1;
    return <AddTaskForm mode="create" taskData={Number(id)} />;
  },
});
