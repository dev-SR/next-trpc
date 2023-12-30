'use client';

import { trpc } from '@/lib/trpc/client/client';

const ClientComponent = () => {
	return (
		<div className='flex items-center justify-center w-full h-full mt-16'>
			<h1>Welcome to Protected Admin Client Component</h1>
		</div>
	);
};
export default ClientComponent;
