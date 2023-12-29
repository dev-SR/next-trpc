import { publicProcedure, router } from '../trpc';
import { authRouter } from './auth';
import { todosRouter } from './todos';

export const appRouter = router({
	greeting: publicProcedure.query(() => 'hello tRPC v10!'),
	todos: todosRouter,
	auth: authRouter
});

export type AppRouter = typeof appRouter;
