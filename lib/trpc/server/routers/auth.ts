import { protectedAdminProcedure, protectedProcedure, router } from '../trpc';

export const authRouter = router({
	checkAuth: protectedProcedure.query(({ ctx }) => {
		return ctx.session.user;
	}),
	checkAdminAuth: protectedAdminProcedure.query(({ ctx }) => {
		return ctx.session.user;
	})
});
