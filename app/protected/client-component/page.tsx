'use client';

import CheckAdminProtectedRoute from '@/components/auth/CheckAdminProtectedRoute';
import CheckProtectedRoute from '@/components/auth/CheckProtectedRoute';

const ClientComponent = () => {
	return (
		<div className='flex flex-col items-center justify-center w-full h-full mt-16'>
			<h1>Welcome to Protected Client Component</h1>
			<CheckProtectedRoute />
			<CheckAdminProtectedRoute />
		</div>
	);
};
export default ClientComponent;
