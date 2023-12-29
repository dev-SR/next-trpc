import * as z from 'zod';
export const UserCredSchema = z.object({
	email: z.string().min(5, {
		message: 'Username must be at least 5 characters.'
	})
});

export type UserCredType = z.infer<typeof UserCredSchema>;
