import { getServerAuthSession } from '@/lib/auth/next-auth';
import Link from 'next/link';
const Navbar = async () => {
	const session = await getServerAuthSession();

	return (
		<div className='flex justify-center bg-gray-700 h-16 items-center space-x-4'>
			<Link href={'/'} className='underline  cursor-pointer text-white'>
				Home
			</Link>
			<Link href={'/client-component'} className='underline  cursor-pointer text-white'>
				Public Client Comp.
			</Link>
			<Link href={'/server-component'} prefetch className='underline  cursor-pointer text-white'>
				Public Server Comp.
			</Link>
			<Link
				href={'/protected/client-component'}
				prefetch={false}
				className='underline  cursor-pointer text-white'>
				Protected Client Comp.
			</Link>
			<Link
				href={'/protected/server-component'}
				prefetch={false}
				className='underline  cursor-pointer text-white'>
				Protected Server Comp.
			</Link>
			<Link
				href={'/protected/admin/client-component'}
				prefetch={false}
				className='underline  cursor-pointer text-white'>
				Protected Admin Client Comp.
			</Link>
			<Link
				href={'/protected/admin/server-component'}
				prefetch={false}
				className='underline  cursor-pointer text-white'>
				Protected Admin Server Comp.
			</Link>
			<Link
				href={session ? '/api/auth/signout' : '/api/auth/signin'}
				className='underline  cursor-pointer text-white'>
				{session ? 'Sign out' : 'Sign in'}
			</Link>
		</div>
	);
};

export default Navbar;
