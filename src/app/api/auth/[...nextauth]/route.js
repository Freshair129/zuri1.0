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

        const { isMockMode } = await import('@/lib/mockMode')
        const isMockAdmin = isMockMode && credentials.email === 'admin@vschool.io' && credentials.password === 'admin'

        const valid = isMockAdmin || await bcrypt.compare(credentials.password, employee.passwordHash)
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
    async redirect({ url, baseUrl }) {
      // After login, always go to /dashboard unless a valid callback is set
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return baseUrl + url
      return baseUrl + '/dashboard'
    },
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
