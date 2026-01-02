import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import DashboardClientLayout from '@/components/dashboard/layout/DashboardClientLayout';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>
}
