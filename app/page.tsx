import { getServerAuthSession } from '@/lib/auth/next-auth';

export default async function Home() {
	const session = await getServerAuthSession();

	return (
		<div className='min-h-screen flex flex-col items-center pt-8'>
			<p className='text-center text-2xl'>
				{session && (
					<span>
						Logged in as {session.user?.name} - {session.user?.role}
					</span>
				)}
				{!session && <span>Not logged in</span>}
			</p>
		</div>
	);
}
