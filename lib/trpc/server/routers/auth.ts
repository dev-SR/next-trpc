import { cookies } from 'next/headers';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const authRouter = router({
	login: publicProcedure.mutation(async ({ input, ctx }) => {
		cookies().set({
			name: 'access_token',
			value: 'your_access_token',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			expires: new Date(Date.now() + 15 * 60 * 1000)
		});
		return {
			success: true
		};
	}),
	checkAuth: protectedProcedure.mutation(() => {
		return {
			user: 'Jhon'
		};
	}),
	logout: protectedProcedure.mutation(async ({ ctx }) => {
		cookies().delete('access_token');
		return {
			success: true
		};
	})
});
