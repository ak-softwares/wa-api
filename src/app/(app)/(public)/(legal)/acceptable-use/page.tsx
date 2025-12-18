"use client"

import React from "react"
import Link from "next/link"

export default function AcceptableUsePolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm text-red-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.224 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Violation of this policy may result in account suspension or termination
          </div>
          <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Acceptable Use Policy
          </h1>
          <p className="mb-8 max-w-4xl text-lg text-muted-foreground">
            This Acceptable Use Policy ("AUP") outlines the prohibited uses of WA-API's services. By using our WhatsApp automation platform, you agree to comply with this policy and all applicable laws.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#prohibited" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Prohibited Uses
            </a>
            <a href="#content" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Content Restrictions
            </a>
            <a href="#whatsapp" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              WhatsApp Compliance
            </a>
            <a href="#enforcement" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Enforcement
            </a>
          </div>
        </div>
      </section>

      {/* Policy Overview */}
      <section className="border-b border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Permitted Uses</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Legitimate business communication, customer support, and marketing to opted-in recipients.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Compliance Required</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Must comply with WhatsApp Business Policy, local laws, and anti-spam regulations.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Strictly Prohibited</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Spam, illegal content, harassment, fraud, and unsolicited commercial messages.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">24-Hour Response Window</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You must respond to user-initiated conversations within 24 hours using approved templates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="space-y-12">
            {/* Introduction */}
            <div>
              <h2 className="mb-4 text-2xl font-semibold">1. Policy Application</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  This Acceptable Use Policy applies to all users of WA-API services, including customers, their employees, agents, and any third parties using the service on their behalf.
                </p>
                <p>
                  This policy is incorporated by reference into our <Link href="/terms" className="text-emerald-500 hover:underline">Terms and Conditions</Link>. Violations may result in immediate account suspension or termination without refund.
                </p>
                <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                  <p className="text-sm text-red-700">
                    <strong>Zero Tolerance:</strong> We have a zero-tolerance policy for spam, illegal activities, or content that violates WhatsApp's Terms of Service. Violations will result in immediate account termination.
                  </p>
                </div>
              </div>
            </div>

            {/* Prohibited Uses */}
            <div id="prohibited">
              <h2 className="mb-6 text-2xl font-semibold">2. Prohibited Uses of WA-API</h2>
              
              {/* Spam and Unsolicited Messages */}
              <div className="mb-8 rounded-2xl border border-red-200 bg-red-50/50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.224 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-red-700">A. Spam and Unsolicited Messages</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Bulk Unsolicited Messages</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Sending WhatsApp messages to recipients who have not explicitly opted-in to receive communications from you.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Purchased/Scraped Lists</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Using contact lists obtained without proper consent, including purchased lists, scraped data, or harvested phone numbers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Deceptive Subject Lines</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Using misleading subject lines or content designed to trick recipients into opening messages.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Opt-Out Violations</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Continuing to send messages to recipients who have opted out or requested to be removed from your list.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Illegal and Harmful Activities */}
              <div className="mb-8 rounded-2xl border border-red-200 bg-red-50/50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-red-700">B. Illegal and Harmful Activities</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Illegal Content</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Promoting illegal activities, substances, or services, including drugs, weapons, human trafficking, or other criminal enterprises.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Harmful Software</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Distributing malware, viruses, ransomware, spyware, or any other malicious software.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Phishing and Fraud</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Attempting to obtain sensitive information through deceptive means (phishing), financial scams, or impersonation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Harassment and Threats</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Sending threatening, intimidating, harassing, or bullying messages to individuals or groups.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fraud and Deceptive Practices */}
              <div className="mb-8 rounded-2xl border border-red-200 bg-red-50/50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-red-700">C. Fraud and Deceptive Practices</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Impersonation</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Impersonating any person or entity, including government agencies, businesses, or individuals.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Financial Scams</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Promoting pyramid schemes, Ponzi schemes, investment fraud, or other financial scams.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Fake News and Misinformation</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Spreading false information, fake news, or conspiracy theories that could cause harm.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Identity Theft</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Attempting to collect personal information for identity theft or unauthorized access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System and Network Abuse */}
              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-red-700">D. System and Network Abuse</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Service Disruption</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Attempting to disrupt, overload, or harm WA-API's infrastructure or services.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Unauthorized Access</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Attempting to gain unauthorized access to WA-API systems, accounts, or data.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">API Abuse</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Making excessive API calls, automated scraping, or other actions that degrade service performance.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-700">Bypassing Restrictions</h4>
                      <p className="mt-1 text-sm text-red-600">
                        Attempting to circumvent messaging limits, security measures, or other system restrictions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Restrictions */}
            <div id="content">
              <h2 className="mb-6 text-2xl font-semibold">3. Content Restrictions</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Prohibited Content */}
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
                  <h3 className="mb-4 font-semibold text-red-700">Prohibited Content</h3>
                  <ul className="space-y-3 text-sm text-red-600">
                    <li className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Adult content, pornography, or sexually explicit material</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Hate speech, racism, or discriminatory content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Violent, graphic, or excessively gory content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Gambling, casinos, or betting services (where prohibited)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Tobacco, alcohol, or drug-related content</span>
                    </li>
                  </ul>
                </div>

                {/* Restricted Content */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                  <h3 className="mb-4 font-semibold text-amber-700">Restricted Content (Requires Care)</h3>
                  <ul className="space-y-3 text-sm text-amber-600">
                    <li className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <span>Political campaigns and fundraising</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <span>Healthcare and medical advice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <span>Financial advice and investment opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <span>Cryptocurrency and NFT promotions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <span>Weight loss and dietary supplements</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-border bg-card p-6">
                <h4 className="mb-2 font-medium">Content Responsibility</h4>
                <p className="text-sm text-muted-foreground">
                  You are solely responsible for all content sent through WA-API. Ensure you have the necessary rights, licenses, and permissions for any content you distribute. Content that violates intellectual property rights, including copyright and trademark infringement, is strictly prohibited.
                </p>
              </div>
            </div>

            {/* WhatsApp Compliance */}
            <div id="whatsapp">
              <h2 className="mb-6 text-2xl font-semibold">4. WhatsApp Business Policy Compliance</h2>
              
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-blue-700">Mandatory WhatsApp Requirements</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="mb-2 font-medium text-blue-700">24-Hour Messaging Window</h4>
                    <div className="rounded-lg border border-blue-200 bg-white p-4">
                      <ul className="space-y-2 text-sm text-blue-600">
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>You may send free-form messages to users within 24 hours of their last message</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>After 24 hours, you must use approved message templates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Templates must be approved by WhatsApp before use</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium text-blue-700">Consent Requirements</h4>
                    <ul className="space-y-2 text-sm text-blue-600">
                      <li className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>You must obtain explicit opt-in consent from recipients before sending marketing messages</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Transactional messages (order updates, appointments, etc.) do not require opt-in but must be relevant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>You must provide clear opt-out instructions in every marketing message</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium text-blue-700">WhatsApp Prohibitions</h4>
                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                      <ul className="space-y-1 text-sm text-red-600">
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Do not use WhatsApp for emergency services</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Do not send automated messages that simulate human conversation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Do not use WhatsApp for bulk messaging without proper templates</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <a 
                    href="https://www.whatsapp.com/legal/business-policy/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                  >
                    ↗ Review WhatsApp Business Policy
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Legal Compliance */}
            <div id="legal">
              <h2 className="mb-4 text-2xl font-semibold">5. Legal and Regulatory Compliance</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You must comply with all applicable laws and regulations, including but not limited to:</p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="mb-2 font-medium">Anti-Spam Laws</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>CAN-SPAM Act (USA)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>GDPR (European Union)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>CASL (Canada)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Spam Act 2003 (Australia)</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="mb-2 font-medium">Data Protection</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>General Data Protection Regulation (GDPR)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>California Consumer Privacy Act (CCPA)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Personal Data Protection Bill (India)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Other local data protection laws</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h4 className="mb-2 font-medium">Jurisdictional Compliance</h4>
                  <p className="text-sm text-muted-foreground">
                    You are responsible for complying with laws in your jurisdiction and the jurisdictions of your message recipients. This includes telemarketing regulations, consumer protection laws, and industry-specific regulations (healthcare, finance, etc.).
                  </p>
                </div>
              </div>
            </div>

            {/* Enforcement */}
            <div id="enforcement">
              <h2 className="mb-4 text-2xl font-semibold">6. Policy Enforcement</h2>
              <div className="space-y-6 text-muted-foreground">
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
                  <h3 className="mb-4 text-xl font-semibold text-red-700">Violation Consequences</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-medium text-red-700">Immediate Actions</h4>
                      <ul className="space-y-2 text-sm text-red-600">
                        <li className="flex items-start gap-3">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span><strong>Account Suspension:</strong> Immediate suspension of your account pending investigation</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span><strong>Service Termination:</strong> Permanent termination of your account for severe violations</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span><strong>Data Retention:</strong> We may retain your data as required by law or for investigation purposes</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium text-red-700">Financial Consequences</h4>
                      <ul className="space-y-2 text-sm text-red-600">
                        <li className="flex items-start gap-3">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span><strong>No Refunds:</strong> No refunds will be issued for accounts terminated due to policy violations</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span><strong>Financial Liability:</strong> You may be liable for damages caused by your violations</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium text-red-700">Legal Actions</h4>
                      <ul className="space-y-2 text-sm text-red-600">
                        <li className="flex items-start gap-3">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span><strong>Cooperation with Authorities:</strong> We will cooperate with law enforcement for illegal activities</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span><strong>Reporting to WhatsApp:</strong> We may report violations to WhatsApp, which could result in your WhatsApp number being banned</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Reporting Violations</h3>
                  <p>
                    To report violations of this Acceptable Use Policy, please contact us at <a href="mailto:abuse@wa-api.me" className="text-emerald-500 hover:underline">abuse@wa-api.me</a>. Include evidence and details of the violation for prompt investigation.
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <p className="text-sm text-amber-700">
                    <strong>Note:</strong> We reserve the right to modify this Acceptable Use Policy at any time. Continued use of WA-API after changes constitutes acceptance of the updated policy.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact and Resources */}
            <div id="contact">
              <h2 className="mb-4 text-2xl font-semibold">7. Contact and Resources</h2>
              <div className="space-y-6 text-muted-foreground">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="mb-3 font-medium">Policy Questions</h3>
                    <p className="mb-4 text-sm">For questions about this Acceptable Use Policy:</p>
                    <a href="mailto:compliance@wa-api.me" className="text-sm font-medium text-emerald-500 hover:underline">
                      support@wa-api.me
                    </a>
                  </div>
                  
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="mb-3 font-medium">Report Abuse</h3>
                    <p className="mb-4 text-sm">To report violations or abusive behavior:</p>
                    <a href="mailto:abuse@wa-api.me" className="text-sm font-medium text-emerald-500 hover:underline">
                      support@wa-api.me
                    </a>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-3 font-medium">Additional Resources</h3>
                  <div className="space-y-2">
                    <a 
                      href="https://www.whatsapp.com/legal/business-policy/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                    >
                      ↗ WhatsApp Business Policy
                    </a>
                    <a 
                      href="https://developers.facebook.com/docs/whatsapp/guides/compliance/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                    >
                      ↗ WhatsApp Compliance Guide
                    </a>
                    <Link href="/terms" className="flex items-center gap-2 text-sm text-emerald-500 hover:underline">
                      ↗ WA-API Terms and Conditions
                    </Link>
                    <Link href="/privacy" className="flex items-center gap-2 text-sm text-emerald-500 hover:underline">
                      ↗ WA-API Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Warning */}
      <section className="border-t border-border bg-red-50/30 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="rounded-2xl border border-red-200 bg-white p-12">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.224 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mb-4 text-2xl font-semibold text-red-700">Zero Tolerance Policy</h2>
            <p className="mx-auto mb-6 max-w-2xl text-red-600">
              We maintain a zero-tolerance policy for violations of this Acceptable Use Policy. Serious violations will result in immediate account termination without refund and may be reported to authorities.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Review Your Campaigns
              </Link>
              <a
                href="mailto:support@wa-api.me"
                className="rounded-xl border border-red-300 bg-white px-8 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Request Compliance Review
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}