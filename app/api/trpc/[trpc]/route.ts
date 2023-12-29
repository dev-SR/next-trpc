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
