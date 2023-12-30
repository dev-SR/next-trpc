import { TRPCClientError } from '@trpc/client';
import { TRPCError, initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import { Context } from './createContext';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
	// https://trpc.io/docs/server/error-formatting#all-properties-sent-to-errorformatter
	errorFormatter({ shape, error }) {
		let customMessage = 'Server Error';
		if (error.cause instanceof ZodError) {
			customMessage = 'Invalid Input'; // error.cause.flatten()
		} else {
			customMessage = shape.message;
		}

		return {
			...shape,
			data: {
				...shape.data,
				errorMessage: customMessage
				// Usage:
				//      const addTodos = trpc.todos.addTodos.useMutation();
				//      toast.error(error.data.errorMessage)
			}
		};
	}
});
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

const isAuth = t.middleware(({ next, ctx }) => {
	if (!ctx.session || !ctx.session.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			...ctx,
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user }
		}
	});
});

export const protectedProcedure = t.procedure.use(isAuth);

const isAdminAuth = t.middleware(({ next, ctx }) => {
	if (!ctx.session || !ctx.session.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	if (ctx.session.user.role != 'admin') {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			...ctx,
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user }
		}
	});
});

export const protectedAdminProcedure = t.procedure.use(isAdminAuth);
