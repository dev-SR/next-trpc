import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises'; // Assuming Node.js v14+
import path from 'path';
const filePath = path.join(process.cwd(), 'prisma', 'data.json');

const prisma = new PrismaClient();

async function seedData() {
	try {
		const jsonData = await fs.readFile(filePath, 'utf-8');
		const data = JSON.parse(jsonData);
		console.log(`Start seeding ...`);
		await prisma.todo.deleteMany();
		await prisma.user.deleteMany();
		console.log(`❌ Old data deleted`);

		for (const userData of data.users) {
			const { email, name, posts } = userData;
			await prisma.user.create({
				data: {
					email,
					name
				}
			});
		}
		for (const todo of data.todos) {
			const { task, completed } = todo;
			await prisma.todo.create({ data: { task, completed } });
		}

		console.log('✔ Seeding completed successfully!');
	} catch (error) {
		console.error('Error seeding data:', error);
	} finally {
		await prisma.$disconnect();
	}
}

seedData();

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
// async function main() {
// 	const alice = await prisma.user.upsert({
// 		where: { email: 'alice@prisma.io' },
// 		update: {},
// 		create: {
// 			email: 'alice@prisma.io',
// 			name: 'Alice',
// 			posts: {
// 				create: {
// 					title: 'Check out Prisma with Next.js',
// 					content: 'https://www.prisma.io/nextjs',
// 					published: true
// 				}
// 			}
// 		}
// 	});
// 	const bob = await prisma.user.upsert({
// 		where: { email: 'bob@prisma.io' },
// 		update: {},
// 		create: {
// 			email: 'bob@prisma.io',
// 			name: 'Bob',
// 			posts: {
// 				create: [
// 					{
// 						title: 'Follow Prisma on Twitter',
// 						content: 'https://twitter.com/prisma',
// 						published: true
// 					},
// 					{
// 						title: 'Follow Nexus on Twitter',
// 						content: 'https://twitter.com/nexusgql',
// 						published: true
// 					}
// 				]
// 			}
// 		}
// 	});
// 	console.log({ alice, bob });
// }
// main()
// 	.then(async () => {
// 		await prisma.$disconnect();
// 	})
// 	.catch(async (e) => {
// 		console.error(e);
// 		await prisma.$disconnect();
// 		process.exit(1);
// 	});
