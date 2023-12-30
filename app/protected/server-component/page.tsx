import { serverClient } from '@/lib/trpc/client/serverClient';

const ServerComponent = async () => {
	const res = await serverClient.auth.checkAuth();

	return (
		<div className='flex flex-col items-center justify-center w-full h-full mt-16'>
			<h1>Welcome to Protected Server Component</h1>
			<code className='text-green-600'>{JSON.stringify(res, null, 4)}</code>
		</div>
	);
};
export default ServerComponent;
