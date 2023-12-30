'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc/client/client';
import { serverClient } from '@/lib/trpc/client/serverClient';
import { AddTodoType } from '@/lib/trpc/server/controllers/todos/todo.schema';
import { AppRouter } from '@/lib/trpc/server/routers/_app';
import { TRPCClientError } from '@trpc/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const TodoList = ({
	initialData,
	componentType = 'Client Component'
}: {
	componentType?: string;
	initialData?: Awaited<ReturnType<(typeof serverClient)['todos']['getTodos']>>;
}) => {
	const form = useForm<AddTodoType>({
		// resolver: zodResolver(addTodoSchema),
		defaultValues: {
			task: ''
		}
	});
	const auth = trpc.auth.checkAuth.useQuery(undefined, {
		retry: false
	});

	const getTodos = trpc.todos.getTodos.useQuery(undefined, { initialData: initialData });
	const toggleTodo = trpc.todos.toggleTodo.useMutation({
		onSettled: () => getTodos.refetch()
	});
	const deleteTodo = trpc.todos.deleteTodo.useMutation({
		onSettled: () => getTodos.refetch()
	});

	const addTodos = trpc.todos.addTodos.useMutation({
		onSettled: () => getTodos.refetch()
	});

	function onSubmit(values: AddTodoType) {
		// mutate(values);
		toast.promise(addTodos.mutateAsync(values), {
			loading: 'Adding data...',
			success: (data) => data?.message,
			error: (error: TRPCClientError<AppRouter>) => {
				return error.data?.errorMessage;
			}
		});
	}

	return (
		<div className='min-h-screen flex flex-col items-center pt-8 space-y-6'>
			<div>
				<h1 className='text-2xl font-bold'>{componentType}</h1>
			</div>
			<p>Testing calling protected trpc api route:</p>
			<code>
				{' '}
				Result:
				{auth.isSuccess ? (
					<span className='text-green-600'> {JSON.stringify(auth.data)}</span>
				) : (
					<span className='text-red-600'> {auth.error?.message}</span>
				)}
			</code>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
					<FormField
						control={form.control}
						name='task'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Add todo</FormLabel>
								<FormControl>
									<Input placeholder='shadcn' {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type='submit'>Add</Button>
				</form>
			</Form>
			<ul className='flex flex-col space-y-2 justify-start'>
				{getTodos.isLoading &&
					Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className='w-[200px] h-[20px] ' />
					))}
				{getTodos.data?.todos.map((todo) => (
					<li key={todo.id} className='flex items-center space-x-2'>
						<Checkbox
							checked={todo.completed}
							onClick={() => {
								toast.promise(toggleTodo.mutateAsync(todo.id), {
									loading: 'Updating...',
									success: (data) => data.message,
									error: (error: TRPCClientError<AppRouter>) => {
										return error.data?.errorMessage;
									}
								});
							}}
						/>
						<span>{todo.task}</span>
						<Button
							variant={'outline'}
							onClick={() => {
								toast.promise(deleteTodo.mutateAsync(todo.id), {
									loading: 'Deleting...',
									success: (data) => data.message,
									error: (error: TRPCClientError<AppRouter>) => {
										return error.data?.errorMessage;
									}
								});
							}}>
							X
						</Button>
					</li>
				))}
				{/* Optimistic Update via UI */}
				{addTodos.isLoading && (
					<li className='flex items-center space-x-2'>
						<Checkbox checked={false} />
						<span className='opacity-50'>{addTodos.variables?.task}</span>
						<Button variant={'outline'}>X</Button>
					</li>
				)}
			</ul>
		</div>
	);
};

export default TodoList;
