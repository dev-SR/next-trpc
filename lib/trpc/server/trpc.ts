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
	const cookieString = ctx.req.headers.get('cookie');

	if (!cookieString) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authorized' });
	}
	const cookies = cookieString.split(';');
	const accessToken = cookies.find((cookie) => cookie.includes('access_token'));
	console.log(`Trpc Middleware: ${accessToken}`);
	if (!accessToken) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authorized' });
	}
	if (accessToken.trim() != 'access_token=your_access_token') {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authorized' });
	}

	return next();
});

export const protectedProcedure = t.procedure.use(isAuth);
