'use client';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';

const LogInOutButton = () => {
	return (
		<div className=''>
			<Button onClick={() => signIn()}>Login</Button>
		</div>
	);
};

export default LogInOutButton;
