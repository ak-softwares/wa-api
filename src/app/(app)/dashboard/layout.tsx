import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import DashboardClientLayout from '@/components/dashboard/layout/DashboardClientLayout';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { headers } from 'next/headers';
import { findUserIdByTempAccessToken } from '@/services/auth/tempAccessToken';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const reqHeaders = await headers();
  const setupAuthEnabled = reqHeaders.get("x-setup-auth") === "1";
  const setupToken = reqHeaders.get("x-setup-token");
  let setupUser: string | null = null;

  // ✅ Validate temp token only if setup auth enabled
  if (setupAuthEnabled && setupToken) {
    setupUser = await findUserIdByTempAccessToken(setupToken);
  }
  
  if (!session && !setupUser) {
    redirect('/auth/login')
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>
}
