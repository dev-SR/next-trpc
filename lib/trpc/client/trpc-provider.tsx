'use client';
// https://codevoweb.com/setup-trpc-server-and-client-in-nextjs-13-app-directory/
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { useState } from 'react';
import { getUrl } from '../utils';
import { trpc } from './client';

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
