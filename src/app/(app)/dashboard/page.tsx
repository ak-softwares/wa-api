'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WhatsAppSignup from "@/components/dashboard/wa/WhatsAppSignup"
import RightBar from "@/components/dashboard/rightbar/RightBar";

export default function Dashboard() {

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="grid grid-cols-10 gap-6 h-full">
        {/* Left side (70%) */}
        <div className="col-span-7 space-y-6">
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
                  {true ? (
                    // If WhatsApp is already connected
                    <div className="space-y-2">
                      <p className="text-green-600 font-medium">
                        🎉 Congratulations! WhatsApp is connected ✅
                      </p>
                      <p>
                        Connected number:{" "}
                        <span className="font-semibold">+918265849298</span>
                      </p>
                    </div>
                  ) : (
                    // If WhatsApp not connected
                    <>
                      <p className="mb-4">
                        Connect your WhatsApp business number to start sending messages.
                      </p>
                      <WhatsAppSignup />
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>Manage API Key</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Your API Key"
                    value="sk_test_xxxxxx"
                    readOnly
                  />
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
        </div>

        {/* Right side (30%) */}
        <div className="col-span-3 space-y-6">
          <RightBar />
        </div>
      </div>
    </main>
)

}
