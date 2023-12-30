import { getServerAuthSession } from '@/lib/auth/next-auth';
import { inferAsyncReturnType } from '@trpc/server';
import { NextRequest } from 'next/server';

export const createContext = async (req: NextRequest) => {
	const session = await getServerAuthSession();
	return {
		req,
		session
	};
};

export type Context = inferAsyncReturnType<typeof createContext>;
