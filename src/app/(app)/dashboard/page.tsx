'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar/Sidebar";
import Topbar from "@/components/dashboard/topbar/Topbar"
import WhatsAppSignup from "@/components/ui/wa/WhatsAppSignup"
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    return null; // Wait for redirect
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <Topbar />

        {/* Content */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹1200</p>
                <p className="text-sm text-gray-500">Remaining credits</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messages Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">4,320</p>
                <p className="text-sm text-gray-500">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-500">Linked accounts</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="phone">
            <TabsList>
              <TabsTrigger value="phone">Phone Setup</TabsTrigger>
              <TabsTrigger value="api">API Keys</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="phone">
              <Card>
                <CardHeader>
                  <CardTitle>Connect WhatsApp Number</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="mb-4">Connect your WhatsApp business number to start sending messages.</p>
                  <Button>Connect Number</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>Manage API Key</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Your API Key" value="sk_test_xxxxxx" readOnly />
                  <Button>Generate New Key</Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Business Name" />
                  <Input placeholder="Support Email" />
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <WhatsAppSignup />
        </main>
      </div>
    </div>
  )
}
