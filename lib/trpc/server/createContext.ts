import { inferAsyncReturnType } from '@trpc/server';
import { NextRequest } from 'next/server';

export const createContext = async (req: NextRequest) => {
	return {
		req
	};
};

export type Context = inferAsyncReturnType<typeof createContext>;
