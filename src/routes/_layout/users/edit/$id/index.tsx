import AddUser from '@/components/users/AddUser';
import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/users/edit/$id/')({
  component: () => {
    const { id } = useParams({ from: '/_layout/users/edit/$id/' });
    return <AddUser mode="edit" userId={Number(id)} />
  },
})
