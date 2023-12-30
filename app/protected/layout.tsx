import { getServerAuthSession } from '@/lib/auth/next-auth';
import { signIn } from 'next-auth/react';
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

	return <>{children}</>;
}
