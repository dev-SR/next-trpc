import TodoList from '@/components/TodoList';
import { serverClient } from '@/lib/trpc/client/serverClient';

export default async function Home() {
	const todos = await serverClient.todos.getTodos();

	return <TodoList initialData={todos} componentType='Protected Server Component' />;
}
