import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';

import { prisma } from '@/lib/db';
import { AuthOptions, DefaultSession, DefaultUser, getServerSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

enum UserRole {
	user = 'user',
	admin = 'admin'
}
declare module 'next-auth' {
	interface Session extends DefaultSession {
		user: {
			role: UserRole;
		} & DefaultSession['user'];
	}
	interface User extends DefaultUser {
		// ...other properties
		role: UserRole;
	}
}
declare module 'next-auth/jwt' {
	interface JWT extends DefaultJWT {
		// ...other properties
		role: UserRole;
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: AuthOptions = {
	providers: [
		GitHubProvider({
			// http://localhost:3000/api/auth/callback/github
			clientId: process.env.GITHUB_ID!,
			clientSecret: process.env.GITHUB_SECRET!
		})
	],
	adapter: PrismaAdapter(prisma) as any,
	// session: {
	// 	// Choose how you want to save the user session.
	// 	// The default is `"jwt"`, an encrypted JWT (JWE) stored in the session cookie.
	// 	// !If you use an `adapter` however, we default it to `"database"` instead.
	// 	// !You can still force a JWT session by explicitly defining `"jwt"`.
	// 	// When using `"database"`, the session cookie will only contain a `sessionToken` value,
	// 	// which is used to look up the session in the database.
	// 	strategy: 'database'
	// },
	callbacks: {
		/*
		https://next-auth.js.org/configuration/callbacks#jwt-callback
		This callback is called whenever a JSON Web Token is created (i.e. at sign in) or updated (i.e whenever a session is accessed in the client).
		This method is not invoked when you persist sessions in a database.
		The arguments user, account, profile and isNewUser are only passed the first time this callback is called on a new session, after the user signs in. In subsequent calls, only token will be available.
		*/
		// async jwt({ user, token }) {
		// 	console.log({ user, token });
		// 	if (user) token.role = user.role;
		// 	return token;
		// },
		// https://next-auth.js.org/configuration/callbacks#session-callback
		// 1. The session callback is called whenever a session is checked via `getServerSession` or `useSession` hook.
		// 2. Here, We have to explicitly add the `role` to the session object so that we can access it in the client components.
		// 3. When using `database` session `user` object is passed as argument. When using `jwt` session `token` is passed as argument.

		async session({ session, user, token }) {
			// console.log({ session, user, token }); //token is `null` for `database` session
			session.user.role = user.role; // we can access the user object from the database here
			// session.user.role = token.role;
			return session;
		}
	}
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
