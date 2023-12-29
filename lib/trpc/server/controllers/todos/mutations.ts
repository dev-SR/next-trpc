import { prisma } from '@/lib/db';
import { AddTodoType } from './todo.schema';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
const delay = () => new Promise((resolve) => setTimeout(resolve, 2000));
export const addTodoHandler = async (todo: AddTodoType) => {
	await delay();
	try {
		const res = await prisma.todo.create({ data: todo });
		return { message: 'Todo Added', data: res };
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError)
			if (e.code === 'P2002')
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Todo Already Exists'
				});
			else throw new TRPCError({ code: 'BAD_REQUEST', message: e.message });
	}
};

export const toggleTodoHandler = async (id: string) => {
	await delay();
	const todo = await prisma.todo.findFirst({ where: { id } });
	if (!todo)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Todo Not Found'
		});
	await prisma.todo.update({
		where: { id },
		data: {
			completed: !todo.completed
		}
	});

	return { message: 'Todo Updated' };
};

export const deleteTodoHandler = async (id: string) => {
	await delay();
	const todo = await prisma.todo.findFirst({ where: { id } });
	if (!todo)
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Todo Not Found'
		});
	await prisma.todo.delete({ where: { id } });
	return { message: 'Todo Deleted' };
};
