import { prisma } from '@/lib/db';

export const getTodosHandler = async () => {
	const todos = await prisma.todo.findMany();
	return { todos };
};
