'use client';

import { trpc } from '@/lib/trpc/client/client';

const ClientComponent = () => {
	const auth = trpc.auth.checkAuth.useQuery(undefined, {
		retry: false
	});
	return (
		<div className='flex flex-col items-center justify-center w-full h-full mt-16'>
			<h1>Welcome to Protected Client Component</h1>
			<code className='text-green-600'>{JSON.stringify(auth.data, null, 4)}</code>
		</div>
	);
};
export default ClientComponent;
