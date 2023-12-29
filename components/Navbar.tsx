import Link from 'next/link';
import React from 'react';

const Navbar = () => {
	return (
		<div className='flex justify-center bg-gray-700 h-16 items-center space-x-4'>
			<Link href={'/'} className='underline text-lg cursor-pointer text-white'>
				Home
			</Link>
			<Link href={'/client-component'} className='underline text-lg cursor-pointer text-white'>
				Client Comp.
			</Link>
			<Link href={'/server-component'} className='underline text-lg cursor-pointer text-white'>
				Server Comp.
			</Link>
			<Link
				href={'/protected/client-component'}
				prefetch={false}
				className='underline text-lg cursor-pointer text-white'>
				Protected Client Comp.
			</Link>
			<Link
				href={'/protected/server-component'}
				prefetch={false}
				className='underline text-lg cursor-pointer text-white'>
				Protected Server Comp.
			</Link>
			<Link
				href={'/login'}
				prefetch={false}
				className='underline text-lg cursor-pointer text-white'>
				Login
			</Link>
		</div>
	);
};

export default Navbar;
