import { getServerAuthSession } from '@/lib/auth/next-auth';
import { redirect } from 'next/navigation';

// checks authorized users
export default async function Layout({
	children // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const session = await getServerAuthSession();
	if (!session) {
		return redirect('/api/auth/signin');
	}

	return session.user.role === 'admin' ? (
		<>{children}</>
	) : (
		<div className='flex items-center justify-center w-full h-full mt-16'>
			<h1 className='text-4xl'>Only admin can view this page.</h1>
		</div>
	);
}
