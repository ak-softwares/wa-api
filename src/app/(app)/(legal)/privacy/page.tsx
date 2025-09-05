'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Prose } from "@/components/ui/prose"
import Header from '@/components/ui/header/header'
import Footer from '@/components/ui/footer/footer'

export default function PrivacyPolicyPage() {
  return (
    <div>
        <Header />
        <main className="max-w-4xl mx-auto p-6">
        <Card className="shadow-md">
            <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy — WA-API</CardTitle>
            </CardHeader>
            <CardContent>
            <Prose>
                <h2>Introduction</h2>
                <p>
                WA-API ("we", "us", "our") operates the website <strong>wa-api.me</strong> and
                provides WhatsApp API related services. This Privacy Policy explains how we collect,
                use, and protect your information.
                </p>

                <h2>Contact</h2>
                <p>
                For questions about this policy please contact us at <a href="mailto:support@wa-api.me">support@wa-api.me</a>.
                </p>

                <h2>Information We Collect</h2>
                <ul>
                <li><strong>Account data:</strong> name, email, phone number if you register.</li>
                <li><strong>Payment and billing:</strong> (if applicable) we may collect billing details processed by third-party providers.</li>
                <li><strong>Usage data:</strong> logs, IP address, cookies and analytics to improve the service.</li>
                </ul>

                <h2>How We Use Your Data</h2>
                <ul>
                <li>To provide, maintain, and improve our services.</li>
                <li>To respond to customer support requests.</li>
                <li>To send transactional messages and important notices about the service.</li>
                </ul>

                <h2>Sharing &amp; Third Parties</h2>
                <p>
                We do not sell personal data. We may share information with service providers who
                process payments, host infrastructure, or provide analytics. All third parties are
                required to protect your data and may process it only for the purposes we authorize.
                </p>

                <h2>Cookies &amp; Tracking</h2>
                <p>
                We use cookies and similar technologies to operate the website, enable features, and
                gather analytics. You can control cookie preferences in your browser settings.
                </p>

                <h2>Data Retention &amp; Security</h2>
                <p>
                We retain personal data only for as long as necessary. We use reasonable technical and
                organizational measures to protect data, but no internet transmission is completely
                secure — we cannot guarantee absolute security.
                </p>

                <h2>Your Rights</h2>
                <p>
                Depending on your jurisdiction you may have rights to access, correct, delete, or
                restrict processing of your personal data. To exercise these rights contact us at
                <a href="mailto:support@wa-api.me"> support@wa-api.me</a>.
                </p>

                <h2>Changes to the Policy</h2>
                <p>
                We may update this Privacy Policy from time to time. When we do, we will post the
                updated policy on this page with a revised effective date.
                </p>

                <p className="text-sm text-muted-foreground">Effective date: {new Date().toLocaleDateString()}</p>
            </Prose>
            </CardContent>
        </Card>
        </main>
        <Footer />
    </div>
  )
}
