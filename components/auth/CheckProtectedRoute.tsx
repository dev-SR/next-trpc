'use client';

import { trpc } from '@/lib/trpc/client/client';

const CheckProtectedRoute = () => {
	const auth = trpc.auth.checkAuth.useQuery(undefined, {
		retry: false
	});
	return (
		<>
			<p>Testing calling protected trpc api route:</p>
			<code>
				Result:
				{auth.isSuccess ? (
					<span className='text-green-600'> {JSON.stringify(auth.data)}</span>
				) : (
					<span className='text-red-600'> {auth.error?.message}</span>
				)}
			</code>
		</>
	);
};

export default CheckProtectedRoute;
