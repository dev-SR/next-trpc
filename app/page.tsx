import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { prisma } from '@/lib/db';

export default async function Home() {
	const users = await prisma.user.findMany();

	return (
		<div className='min-h-screen flex flex-col items-center pt-8'>
			<ul className='flex flex-col space-y-4'>
				{users.map((user) => (
					<div key={user.id}>
						{user.name}-{user.email}
					</div>
				))}
			</ul>
		</div>
	);
}
