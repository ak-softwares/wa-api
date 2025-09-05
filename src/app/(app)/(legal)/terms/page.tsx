'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/ui/header/header'
import Footer from '@/components/ui/footer/footer'

export default function TermsPage() {
  return (
    <div>
        <Header />
        <main className="max-w-4xl mx-auto p-6">
        <Card className="shadow-md">
            <CardHeader>
            <CardTitle className="text-2xl">Terms & Conditions — WA-API</CardTitle>
            </CardHeader>
            <CardContent>
                <h2>Agreement to Terms</h2>
                <p>
                These Terms &amp; Conditions ("Terms") govern your use of services provided by
                WA-API at <strong>wa-api.me</strong>. By using our services you agree to these Terms.
                </p>

                <h2>Services</h2>
                <p>
                WA-API provides tools and APIs to help businesses integrate with WhatsApp and build
                messaging workflows. Specific features and limits may be described in product pages
                or separate documentation.
                </p>

                <h2>Acceptable Use</h2>
                <p>
                You agree not to use the service for illegal purposes, spam, harassment, or sending
                unsolicited messages. You must comply with WhatsApp’s policies and all applicable
                laws including privacy and anti-spam regulations.
                </p>

                <h2>Accounts &amp; Payment</h2>
                <p>
                You are responsible for maintaining your account security. For paid features you agree
                to the billing terms presented at checkout. Refunds are handled case-by-case.
                </p>

                <h2>Limitation of Liability</h2>
                <p>
                To the maximum extent permitted by law, WA-API and its affiliates are not liable for
                indirect, consequential, or special damages arising from your use of the service.
                </p>

                <h2>Intellectual Property</h2>
                <p>
                All content and software on wa-api.me are owned or licensed by WA-API. You may not
                reproduce, modify, or distribute our intellectual property without permission.
                </p>

                <h2>Termination</h2>
                <p>
                We may suspend or terminate accounts that violate these Terms or pose a risk to the
                service. On termination, your access will end and we may delete your data in
                accordance with our retention policy.
                </p>

                <h2>Governing Law</h2>
                <p>
                These Terms are governed by the laws of the jurisdiction where WA-API operates. If
                any provision is held unenforceable, the remaining provisions remain in effect.
                </p>

                <h2>Contact</h2>
                <p>
                For support or legal requests contact: <a href="mailto:support@wa-api.me">support@wa-api.me</a>.
                </p>

                <p className="text-sm text-muted-foreground">Effective date: {new Date().toLocaleDateString()}</p>
            </CardContent>
        </Card>
        </main>
        <Footer />
    </div>
  )
}
