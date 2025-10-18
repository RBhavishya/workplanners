import { TaskViewDetails } from '@/components/Taskfiles/TaskViewDetails'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/tasks/view/$id/')({
    component: TaskViewDetails,
})

