import AddUser from '@/components/users/AddUser'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/users/adduser/')({
  component: AddUser,
})
