import {
	addTodoHandler,
	deleteTodoHandler,
	toggleTodoHandler
} from '../controllers/todos/mutations';
import { getTodosHandler } from '../controllers/todos/queries';
import { todoIdSchema, addTodoSchema } from '../controllers/todos/todo.schema';
import { publicProcedure, router } from '../trpc';

export const todosRouter = router({
	getTodos: publicProcedure.query(async () => {
		return getTodosHandler();
	}),
	addTodos: publicProcedure.input(addTodoSchema).mutation(async ({ input, ctx }) => {
		return addTodoHandler(input);
	}),
	toggleTodo: publicProcedure.input(todoIdSchema).mutation(async ({ input }) => {
		return toggleTodoHandler(input);
	}),
	deleteTodo: publicProcedure.input(todoIdSchema).mutation(async ({ input }) => {
		return deleteTodoHandler(input);
	})
});
