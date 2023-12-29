import * as z from 'zod';
export const addTodoSchema = z.object({
	task: z.string().min(5, {
		message: 'Username must be at least 5 characters.'
	})
});

export type AddTodoType = z.infer<typeof addTodoSchema>;

export const todoIdSchema = z.string().min(5, {
	message: 'Username must be at least 5 characters.'
});

export type AddTodoIdType = z.infer<typeof todoIdSchema>;
