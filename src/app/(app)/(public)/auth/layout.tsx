import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const REDIRECT_IF_AUTHENTICATED = [
  '/auth/login',
  '/auth/signin',
  '/auth/signup',
  '/auth/forgot-password',
]

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (session) {
    // Allow some routes even if authenticated
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') ?? ''
    if (REDIRECT_IF_AUTHENTICATED.includes(pathname)) {
      redirect('/dashboard')
    }
  }

  return children
}
