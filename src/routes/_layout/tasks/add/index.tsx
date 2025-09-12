

import AddTask from '@/components/Taskfiles/AddTaskForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/tasks/add/')({
  component :() => <AddTask/>
})