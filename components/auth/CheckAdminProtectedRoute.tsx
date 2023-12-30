'use client';

import { trpc } from '@/lib/trpc/client/client';

const CheckAdminProtectedRoute = () => {
	const auth = trpc.auth.checkAdminAuth.useQuery(undefined, {
		retry: false
	});
	return (
		<>
			<p>Testing calling admin protected trpc api route:</p>
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

export default CheckAdminProtectedRoute;
