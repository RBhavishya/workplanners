import ViewProfile from '@/components/viewprofile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/view-profile/')({
  component: () =><ViewProfile/>,
})


