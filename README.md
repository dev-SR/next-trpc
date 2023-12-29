# (Next.js + Tailwind + shadcn/ui + Prisma) Template

- [(Next.js + Tailwind + shadcn/ui + Prisma) Template](#nextjs--tailwind--shadcnui--prisma-template)
  - [Getting Started](#getting-started)
    - [Prisma Setup](#prisma-setup)
  - [trpc](#trpc)
    - [Define Routers](#define-routers)
      - [Initialize tRPC](#initialize-trpc)
      - [Defining a router (basic)](#defining-a-router-basic)
      - [Defining a router (organized)](#defining-a-router-organized)
    - [Route Handlers](#route-handlers)
    - [Client Setup](#client-setup)
      - [For nextjs client component](#for-nextjs-client-component)
      - [For nextjs server component](#for-nextjs-server-component)
    - [JWT Authentication \& Middleware (basic)](#jwt-authentication--middleware-basic)
      - [Setting Cookie](#setting-cookie)
      - [Configuring trpc provider for sending cookies in header](#configuring-trpc-provider-for-sending-cookies-in-header)
      - [Creating Context and Passing request object grabbed in next.js route handler](#creating-context-and-passing-request-object-grabbed-in-nextjs-route-handler)
      - [TRPC authentication middleware](#trpc-authentication-middleware)
    - [Using Protected Procedure for protected routes](#using-protected-procedure-for-protected-routes)
    - [Login page](#login-page)
      - [Solving ServerClient](#solving-serverclient)
    - [Protecting pages using nextjs middleware](#protecting-pages-using-nextjs-middleware)

## Getting Started

Install dependencies with "pnpm"

```bash
pnpm install
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Prisma Setup

pnpm add -D prisma
pnpm add @prisma/client
<!-- npx prisma init -->
npx prisma db push
<!-- npx prisma generate -->
npx prisma studio
<!-- https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding -->
npx prisma db seed

## trpc

pnpm add @trpc/client @trpc/server @trpc/react-query @tanstack/react-query@^4.18.0

### Define Routers

#### Initialize tRPC

`lib\trpc\server\trpc.ts`

```typescript
import { initTRPC } from '@trpc/server';
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
```

With custom options:

```typescript
const t = initTRPC.create({
  // https://trpc.io/docs/server/error-formatting#all-properties-sent-to-errorformatter
 errorFormatter({ shape, error }) {
  let customMessage = 'Server Error';
  if (error.cause instanceof ZodError) {
   customMessage = 'Invalid Input';// error.cause.flatten()
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
```

#### Defining a router (basic)

`lib\trpc\server\routers\_app.ts`

Next, let's define a router with a procedure to use in our application.

```typescript
import { publicProcedure, router } from './trpc';
 
const appRouter = router({
  greeting: publicProcedure.query(() => 'hello tRPC v10!'),
});
 
// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
```

We have now created an API "endpoint".

In order for these endpoints to be exposed to the frontend, your Adapter should be configured with your appRouter instance.

#### Defining a router (organized)

- Define app router - `lib\trpc\server\routers\_app.ts`

```typescript
import { publicProcedure, router } from '../trpc';
import { todosRouter } from './todos';

export const appRouter = router({
 greeting: publicProcedure.query(() => 'hello tRPC v10!'),
 todos: todosRouter
});

export type AppRouter = typeof appRouter;
```

- Define todos router and procedure - `lib\trpc\server\routers\todos.ts`

```typescript
import { addTodoHandler, deleteTodoHandler, toggleTodoHandler } from '../services/todos/mutations';
import { getTodosHandler } from '../services/todos/queries';
import { todoIdSchema, addTodoSchema } from '../services/todos/todo.schema';
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
```

- Business Logics in a service

`lib\trpc\server\services\todos\queries.ts`

```typescript
import { prisma } from '@/lib/db';

export const getTodosHandler = async () => {
 const todos = await prisma.todo.findMany();
 return { todos };
};
```

`lib\trpc\server\services\todos\mutations.ts`

```typescript
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

```

### Route Handlers

- [https://trpc.io/docs/server/adapters/nextjs#route-handlers](https://trpc.io/docs/server/adapters/nextjs#route-handlers)

`app/api/trpc/[trpc]/route.ts`

```typescript
import { appRouter } from '@/lib/trpc/server/routers/_app';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (req: Request) =>
 fetchRequestHandler({
  endpoint: '/api/trpc',
  req,
  router: appRouter,
  createContext: () => ({})
 });

export { handler as GET, handler as POST };
```

### Client Setup

#### For nextjs client component

1. Create a set of strongly-typed React hooks from the `AppRouter` type signature with `createTRPCReact`.

`lib\trpc\client\client.ts`

```typescript
import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from '../server/routers/_app';

export const trpc = createTRPCReact<AppRouter>({});
```

2. Add tRPC providers

`lib\trpc\client\trpc-provider.tsx`

```tsx
'use client';
// https://codevoweb.com/setup-trpc-server-and-client-in-nextjs-13-app-directory/
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { trpc } from './client';
import { getUrl } from '../utils';

export const TrpcProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const [queryClient] = useState(
  () =>
   new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } }
   })
 );

 const [trpcClient] = useState(() =>
  trpc.createClient({
   links: [
    loggerLink({
     enabled: () => true
    }),
    httpBatchLink({
     url: getUrl()
    })
   ]
  })
 );
 return (
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
   <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools />
   </QueryClientProvider>
  </trpc.Provider>
 );
};
```

3. Wrap with the Provider:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
  <html lang='en'>
   <body className={inter.className}>
    <TrpcProvider>
     <Navbar />
     {children}
    </TrpcProvider>
   </body>
  </html>
 );
}

```

4. useQuery

`app\client-component\page.tsx`

```tsx
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc/client/client';

const ClientComponent = () => {
 const { data, isFetching } = trpc.todos.getTodos.useQuery();

 return (
  <div className='min-h-screen flex flex-col items-center pt-8'>
   <div>
    <h1 className='text-2xl font-bold'>Client Component</h1>
   </div>
   <ul className='flex flex-col space-y-2'>
    {isFetching ?? <div>Loading.........</div>}
    {data?.todos.map((todo) => (
     <li key={todo.id} className='flex items-center space-x-2'>
      <Checkbox checked={todo.completed} />
      <span>{todo.task}</span>
     </li>
    ))}
   </ul>
  </div>
 );
};

export default ClientComponent;
```

#### For nextjs server component

`lib\trpc\client\serverClient.ts`

```typescript
// import 'server-only';
import { appRouter } from '../server/routers/_app';
import { httpBatchLink } from '@trpc/client';
import { getUrl } from '../utils';
// You may need to call your procedure(s) directly from the same server they're hosted in, router.createCaller() can be used to achieve this.
// https://trpc.io/docs/server/server-side-calls#create-caller

export const serverClient = appRouter.createCaller({
 links: [httpBatchLink({ url: getUrl() })]
});
```

Server data fetching in server component:

```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { serverClient } from '@/lib/trpc/client/serverClient';
export default async function Home() {
 const { todos } = await serverClient.todos.getTodos();

 return (
  <div className='min-h-screen flex flex-col items-center pt-8'>
   <div>
    <h1 className='text-2xl font-bold'>Server Component</h1>
   </div>
   <ul className='flex flex-col space-y-2'>
    {todos.map((todo) => (
     <li key={todo.id} className='flex items-center space-x-2'>
      <Checkbox checked={todo.completed} />
      <span>{todo.task}</span>
     </li>
    ))}
   </ul>
  </div>
 );
}
```

Hydration Example:

```tsx
import TodoList from '@/components/TodoList';
import { serverClient } from '@/lib/trpc/client/serverClient';

export default async function Home() {
 const todos = await serverClient.todos.getTodos();
 return <TodoList initialData={todos} componentType='Server Component' />;
}
```

`@/components/TodoList`

```tsx
'use client';
//.........

const TodoList = ({
 initialData,
}: {
 initialData?: Awaited<ReturnType<(typeof serverClient)['todos']['getTodos']>>;
}) => {
 const getTodos = trpc.todos.getTodos.useQuery(undefined, { initialData: initialData });
 const addTodos = trpc.todos.addTodos.useMutation({
  onSettled: () => getTodos.refetch()
 });

 function onSubmit(values: AddTodoType) {
  // mutate(values);
  toast.promise(addTodos.mutateAsync(values), {
   loading: 'Adding data...',
   success: (data) => data.message,
   error: (error: TRPCClientError<AppRouter>) => {
    return error.data?.errorMessage;
   }
  });
 }

 return <></>;
};

export default TodoList;

```

### JWT Authentication & Middleware (basic)

#### Setting Cookie

`lib\trpc\server\routers\auth.ts`

```typescript
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
 //...
});
```

#### Configuring trpc provider for sending cookies in header

`lib\trpc\client\trpc-provider.tsx`

```tsx
'use client';
export const TrpcProvider: React.FC<{ children: React.ReactNode; cookies: string }> = ({
 children,
 cookies
}) => {
 const [queryClient] = useState(
  () =>
   new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } }
   })
 );

 const [trpcClient] = useState(() =>
  trpc.createClient({
   links: [
    loggerLink({
     enabled: () => true
    }),
    httpBatchLink({
     url: getUrl(),
     // header will be called on every request
     headers() {
      return {
       cookies: cookies
      };
     }
    })
   ]
  })
 );
 return (
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
   <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools />
   </QueryClientProvider>
  </trpc.Provider>
 );
};
```

this cookie is passed as prop from the parent server component:

`app\layout.tsx`

```tsx
import { cookies } from 'next/headers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
 const serverCookies = cookies().toString();
 return (
  <html lang='en'>
   <body className={inter.className}>
    <TrpcProvider cookies={serverCookies}>
     <Toaster richColors closeButton position='top-center' />
     <Navbar />
     {children}
    </TrpcProvider>
   </body>
  </html>
 );
}
```

#### Creating Context and Passing request object grabbed in next.js route handler

Context holds data that all of your tRPC procedures will have access to, and is a great place to put things like database connections or authentication information.

Setting up the context is done in 2 steps, defining the type during initialization and then creating the runtime context for each request.

1. Defining the context type `lib\trpc\server\createContext.ts`

```typescript
import { inferAsyncReturnType } from '@trpc/server';
import { NextRequest } from 'next/server';

export const createContext = async (req: NextRequest) => {
 return {
  req
 };
};

export type Context = inferAsyncReturnType<typeof createContext>;

```

`app\api\trpc\[trpc]\route.ts`

2. Creating the runtime context for each request

```typescript
import { createContext } from '@/lib/trpc/server/createContext';
import { appRouter } from '@/lib/trpc/server/routers/_app';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { NextRequest } from 'next/server';

const handler = (req: NextRequest) =>
 fetchRequestHandler({
  endpoint: '/api/trpc',
  req,
  router: appRouter,
  createContext: () => createContext(req)
 });

export { handler as GET, handler as POST };
```

This will allow you to access the request object the procedures, and middleware as `ctx.req`.

3. Initialize tRPC with context - `lib\trpc\server\trpc.ts`

```typescript
import { Context } from './createContext';
const t = initTRPC.context<Context>().create({...})
```

#### TRPC authentication middleware

`lib\trpc\server\trpc.ts`

```typescript
//....

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

```

### Using Protected Procedure for protected routes

`lib\trpc\server\routers\auth.ts`

```typescript
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

```

### Login page

Clicking Login button will call `login` procedure which will set the cookie, calls `checkAuth` protected procedure to check if user is logged in and then refresh the page.

Calling `checkAuth` sends the cookie in header as configured in `TrpcProvider`. This cookie is received by the next trpc api route handler, the passed as context to the middleware which checks if the cookie is valid.

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Login = () => {
 const router = useRouter();
 const checkAuth = trpc.auth.checkAuth.useMutation();

 useEffect(() => {
  checkAuth.mutate();
 }, []);

 const login = trpc.auth.login.useMutation({
  onSuccess: (data) => {
   checkAuth.mutate();
   // https://nextjs.org/docs/app/building-your-application/caching#data-cache-and-client-side-router-cache
   router.refresh();
   /*
    Calling router.refresh will invalidate the Router Cache
    This is important for pages that are protected by authentication, as the user may have logged out and you want to ensure the page is updated to reflect the user's new state by invalidating the Router Cache.
   */
  }
 });
 const logout = trpc.auth.logout.useMutation({
  onSuccess: (data) => {
   checkAuth.mutate();
   router.refresh();
  }
 });

 return (
  <div className='flex flex-col space-y-4 items-center justify-center h-96'>
   {checkAuth.isSuccess && <div className='text-xl font-bold'>{checkAuth.data.user}</div>}
   {checkAuth.isError && <div className='text-xl font-bold'>{checkAuth.error.message}</div>}
   <Button onClick={() => login.mutate()}>Login</Button>
   {checkAuth.isSuccess && <Button onClick={() => logout.mutate()}>Logout</Button>}
  </div>
 );
};

export default Login;
```

#### Solving ServerClient

Since the client passed the `cookies` to the server using `TrpcProvider`, the `serverClient` should also have the same `cookie`. We can mock the same cookie from `'next/server'` by creating new `NextRequest` object and passing it to the `createContext` function.

```typescript
import 'server-only';

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { cache } from 'react';
import { createContext } from '../server/createContext';
import { appRouter } from '../server/routers/_app';
import { getUrl } from '../utils';

const createContextCached = cache(() => {
 return createContext(
  new NextRequest(getUrl(), {
   method: 'POST',
   headers: new Headers({
    cookie: cookies().toString(),
    'x-trpc-source': 'rsc'
   })
  })
 );
});

export const serverClient = appRouter.createCaller(await createContextCached());
```

### Protecting pages using nextjs middleware

`middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
 const access_token = request.cookies.get('access_token')?.value;

 if (access_token !== 'your_access_token') {
  return NextResponse.redirect(new URL('/login', request.url));
 }

 return NextResponse.next();
}

export const config = {
 // matcher: ['/protected/:path*']
 matcher: ['/protected/server-component', '/protected/client-component']
};

```

Protecting with nextjs middleware solve below problem:

`app\protected\server-component\page.tsx`


```typescript
import TodoList from '@/components/TodoList';
import { serverClient } from '@/lib/trpc/client/serverClient';

export default async function Home() {
	const todos = await serverClient.todos.getTodos();
  ////calling protected procedure `checkAuth` using `serverClient`
	const data = await serverClient.auth.checkAuth();
	if (!data) return null;

	return <TodoList initialData={todos} componentType='Protected Server Component' />;
}
```

calling protected procedure `checkAuth` using `serverClient` in a server component throws error:

```text
Unhandled Runtime Error
Error: Not authorized`
```

Hence, protecting server component using nextjs middleware solves this problem.

