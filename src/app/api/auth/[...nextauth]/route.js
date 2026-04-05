import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import * as employeeRepo from '@/lib/repositories/employeeRepo'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const employee = await employeeRepo.findByEmail(credentials.email)
        if (!employee) return null

        const valid = await bcrypt.compare(credentials.password, employee.passwordHash)
        if (!valid) return null

        return {
          id: employee.id,
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
          roles: employee.roles,
          tenantId: employee.tenantId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.employeeId = user.employeeId
        token.roles = user.roles
        token.tenantId = user.tenantId
      }
      return token
    },
    async session({ session, token }) {
      session.user.employeeId = token.employeeId
      session.user.roles = token.roles
      session.user.tenantId = token.tenantId
      return session
    },
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
