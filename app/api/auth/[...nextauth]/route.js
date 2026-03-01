export const dynamic = 'force-dynamic'

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // TODO: Add real user lookup from MongoDB here
                // Example placeholder check
                if (credentials.email === 'admin@uni.edu' && credentials.password === 'admin123') {
                    return { id: '1', name: 'Admin', email: 'admin@uni.edu' }
                }
                return null
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
    },
})

export { handler as GET, handler as POST }
