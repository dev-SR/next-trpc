import Link from 'next/link';

const DeniedPage = () => {
	return (
		<section className='flex flex-col items-center justify-center w-full h-96'>
			<h1 className='text-4xl font-bold text-center text-gray-800'>
				You are not allowed to access this page.
			</h1>
			<Link href={'/'} className='text-3xl underline'>
				Return to Home Page
			</Link>
		</section>
	);
};

export default DeniedPage;
