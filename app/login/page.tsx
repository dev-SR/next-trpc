'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Login = () => {
	const router = useRouter();
	const checkAuth = trpc.auth.checkAuth.useMutation();

	useEffect(() => {
		checkAuth.mutate();
	}, []);

	const login = trpc.auth.login.useMutation({
		onSuccess: (data) => {
			checkAuth.mutate();
			// https://nextjs.org/docs/app/building-your-application/caching#data-cache-and-client-side-router-cache
			router.refresh();
			/*
				Calling router.refresh will invalidate the Router Cache
				This is important for pages that are protected by authentication, as the user may have logged out and you want to ensure the page is updated to reflect the user's new state by invalidating the Router Cache.
			*/
		}
	});
	const logout = trpc.auth.logout.useMutation({
		onSuccess: (data) => {
			checkAuth.mutate();
			router.refresh();
		}
	});

	return (
		<div className='flex flex-col space-y-4 items-center justify-center h-96'>
			{checkAuth.isSuccess && <div className='text-xl font-bold'>{checkAuth.data.user}</div>}
			{checkAuth.isError && <div className='text-xl font-bold'>{checkAuth.error.message}</div>}
			<Button onClick={() => login.mutate()}>Login</Button>
			{checkAuth.isSuccess && <Button onClick={() => logout.mutate()}>Logout</Button>}
		</div>
	);
};

export default Login;
