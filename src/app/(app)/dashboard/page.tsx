"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h1>
        <p className="mb-6">
          Hello <span className="font-semibold">{session.user?.email}</span>, you are logged in 🎉
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-gray-900 p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-gray-400 text-sm">Quick glance at your account activity.</p>
          </div>

          <div className="rounded-2xl bg-gray-900 p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Analytics</h2>
            <p className="text-gray-400 text-sm">Track your performance and growth.</p>
          </div>

          <div className="rounded-2xl bg-gray-900 p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p className="text-gray-400 text-sm">Manage preferences and account details.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
