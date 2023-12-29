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
