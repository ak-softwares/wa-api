"use client"

import React from "react"
import Link from "next/link"

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Terms and Conditions
          </h1>
          <p className="mb-8 max-w-4xl text-lg text-muted-foreground">
            Welcome to WA-API. These Terms and Conditions govern your use of our WhatsApp automation platform. By accessing or using our services, you agree to be bound by these terms.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#acceptance" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Acceptance
            </a>
            <a href="#account" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Account Terms
            </a>
            <a href="#usage" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Acceptable Use
            </a>
            <a href="#payments" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Payments
            </a>
            <a href="#termination" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Termination
            </a>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="border-b border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="mb-6 text-2xl font-semibold">Important Highlights</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Account Responsibility</h3>
                <p className="text-sm text-muted-foreground">
                  You are responsible for maintaining the security of your account and all activities that occur under it.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <h3 className="font-semibold">Prohibited Content</h3>
                <p className="text-sm text-muted-foreground">
                  You may not use WA-API to send spam, illegal content, or violate WhatsApp's Terms of Service.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold">7-Day Refund</h3>
                <p className="text-sm text-muted-foreground">
                  We offer a 7-day money-back guarantee for new subscriptions. See our <Link href="/refund" className="text-blue-500 hover:underline">Refund Policy</Link> for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="space-y-12">
            {/* Agreement */}
            <div id="acceptance">
              <h2 className="mb-4 text-2xl font-semibold">1. Agreement to Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  By accessing or using WA-API ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of the terms, you may not access the Service.
                </p>
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm">
                    <strong>Important:</strong> These Terms constitute a legally binding agreement between you ("User," "Customer," or "you") and WA-API ("we," "us," or "our").
                  </p>
                </div>
                <p>
                  Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
                </p>
              </div>
            </div>

            {/* Definitions */}
            <div id="definitions">
              <h2 className="mb-4 text-2xl font-semibold">2. Definitions</h2>
              <div className="space-y-4 text-muted-foreground">
                <ul className="ml-6 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span><strong>"Service"</strong> refers to the WA-API WhatsApp automation platform accessible via our website and mobile applications.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span><strong>"Content"</strong> refers to messages, images, videos, templates, and other materials sent through the Service.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span><strong>"Account"</strong> refers to the unique account created for you to access our Service.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span><strong>"Subscription"</strong> refers to the recurring payment plan you select to access premium features.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span><strong>"WhatsApp Business API"</strong> refers to Meta's official API for business messaging on WhatsApp.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Account Terms */}
            <div id="account">
              <h2 className="mb-4 text-2xl font-semibold">3. Account Registration and Security</h2>
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="mb-2 font-medium">A. Registration Requirements</h3>
                  <p>To use our Service, you must:</p>
                  <ul className="ml-6 mt-2 space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Be at least 18 years of age or have parental consent</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Provide accurate, current, and complete information during registration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Maintain the accuracy of your account information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Have a valid WhatsApp Business account or phone number</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">B. Account Security</h3>
                  <p>You are responsible for:</p>
                  <ul className="ml-6 mt-2 space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Maintaining the confidentiality of your account credentials</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>All activities that occur under your account</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Immediately notifying us of any unauthorized use of your account</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Ensuring that you log out of your account at the end of each session</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <p className="text-sm text-amber-700">
                    <strong>Warning:</strong> We reserve the right to disable any account at any time if we believe you have violated these Terms. You may not share your account credentials with others or allow others to access your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptable Use */}
            <div id="usage">
              <h2 className="mb-4 text-2xl font-semibold">4. Acceptable Use Policy</h2>
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="mb-2 font-medium">A. Permitted Use</h3>
                  <p>You may use our Service for:</p>
                  <ul className="ml-6 mt-2 space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Legitimate business communication with customers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Sending transactional notifications (order updates, appointments, etc.)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Marketing communications to opted-in recipients</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Customer support and engagement</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">B. Prohibited Activities</h3>
                  <p>You agree NOT to use our Service to:</p>
                  <div className="ml-6 mt-2 space-y-3">
                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                      <h4 className="mb-1 font-medium text-red-700">Spam and Unsolicited Messages</h4>
                      <ul className="space-y-1 text-sm text-red-600">
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Send unsolicited commercial messages (spam)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Purchase or use harvested contact lists</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Send messages without proper recipient consent</span>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                      <h4 className="mb-1 font-medium text-red-700">Illegal Content</h4>
                      <ul className="space-y-1 text-sm text-red-600">
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Promote illegal activities or substances</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Transmit hate speech, harassment, or threats</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Distribute malware, viruses, or harmful code</span>
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                      <h4 className="mb-1 font-medium text-red-700">Fraud and Abuse</h4>
                      <ul className="space-y-1 text-sm text-red-600">
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Impersonate others or misrepresent your identity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Engage in phishing or fraudulent activities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span>Attempt to bypass or circumvent our security measures</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">C. Compliance with WhatsApp Terms</h3>
                  <p>You must comply with WhatsApp's Terms of Service and Business Policy, including:</p>
                  <ul className="ml-6 mt-2 space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Using approved message templates for initial conversations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Obtaining proper consent from message recipients</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Providing opt-out mechanisms in all marketing messages</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Respecting WhatsApp's messaging limits and guidelines</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Payments and Billing */}
            <div id="payments">
              <h2 className="mb-4 text-2xl font-semibold">5. Payments, Billing, and Refunds</h2>
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="mb-2 font-medium">A. Pricing and Plans</h3>
                  <ul className="ml-6 space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Our pricing is available on our <Link href="/pricing" className="text-emerald-500 hover:underline">Pricing Page</Link> and may be updated from time to time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>We charge $0.002 per message sent through our platform (Pay-As-You-Go plan)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Facebook (Meta) WhatsApp Business API charges are separate and billed directly by Meta</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>All fees are exclusive of applicable taxes, which you are responsible for</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">B. Billing and Payment</h3>
                  <ul className="ml-6 space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>You must provide valid payment information and keep it updated</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Payments are processed through secure third-party payment processors</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>For Pay-As-You-Go plans, charges accumulate in real-time and are billed periodically</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Failed payments may result in service suspension until payment is received</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">C. Refund Policy</h3>
                  <div className="ml-6 space-y-2">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                      <h4 className="mb-1 font-medium text-emerald-700">7-Day Money-Back Guarantee</h4>
                      <p className="text-sm text-emerald-600">
                        We offer a 7-day money-back guarantee for new subscriptions. If you're not satisfied with our service within the first 7 days of purchase, you can request a full refund. See our <Link href="/refund" className="font-semibold hover:underline">Refund Policy</Link> for complete details.
                      </p>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Refunds are processed to the original payment method within 3-5 business days</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Used messages are non-refundable after the 7-day period</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Facebook/Meta charges are not refundable through WA-API</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">D. Price Changes</h3>
                  <p>We reserve the right to modify our pricing at any time. We will provide notice of price changes at least 30 days in advance. Your continued use of the Service after price changes constitutes acceptance of the new prices.</p>
                </div>
              </div>
            </div>

            {/* Intellectual Property */}
            <div id="ip">
              <h2 className="mb-4 text-2xl font-semibold">6. Intellectual Property Rights</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="mb-2 font-medium">A. Our Intellectual Property</h3>
                  <p>The Service and its original content, features, and functionality are owned by WA-API and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">B. Your Content</h3>
                  <ul className="ml-6 space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>You retain ownership of any content you create or send through our Service</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>By using our Service, you grant us a license to process, transmit, and store your content as necessary to provide the Service</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>You are responsible for ensuring you have the rights to use any content you send</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">C. Trademarks</h3>
                  <p>WA-API's trademarks and trade dress may not be used in connection with any product or service without prior written consent. WhatsApp and the WhatsApp logo are trademarks of Meta Platforms, Inc.</p>
                </div>
              </div>
            </div>

            {/* Termination */}
            <div id="termination">
              <h2 className="mb-4 text-2xl font-semibold">7. Termination</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms.</p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-medium">Upon Termination</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Your right to use the Service will immediately cease</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>You may request deletion of your data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Any outstanding payments will become due immediately</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-medium">Survival</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Provisions regarding intellectual property</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Limitations of liability and indemnification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Governing law and dispute resolution</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div id="liability">
              <h2 className="mb-4 text-2xl font-semibold">8. Limitation of Liability</h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <p className="text-amber-700">
                    <strong>Important Disclaimer:</strong> To the maximum extent permitted by law, WA-API shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </div>
                <p>Our total liability for any claims under these Terms, including for any implied warranties, is limited to the amount you paid us to use the Service in the last 12 months.</p>
                <p>We are not responsible for:</p>
                <ul className="ml-6 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Service interruptions caused by third-party providers (including WhatsApp/Meta)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Content sent by users through our platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Unauthorized access to your account due to your failure to protect credentials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Changes to WhatsApp's policies or API that affect Service functionality</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Governing Law */}
            <div id="governing">
              <h2 className="mb-4 text-2xl font-semibold">9. Governing Law and Dispute Resolution</h2>
              <div className="space-y-4 text-muted-foreground">
                <ul className="ml-6 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span><strong>Governing Law:</strong> These Terms shall be governed by the laws of India, without regard to its conflict of law provisions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span><strong>Dispute Resolution:</strong> Any disputes shall first be attempted to be resolved through good faith negotiations. If unsuccessful, disputes shall be submitted to binding arbitration in accordance with Indian arbitration laws.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span><strong>Venue:</strong> Arbitration shall take place in [City, State], India. Each party shall bear its own costs.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Changes to Terms */}
            <div id="changes">
              <h2 className="mb-4 text-2xl font-semibold">10. Changes to Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.</p>
                <p>What constitutes a material change will be determined at our sole discretion.</p>
                <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
              </div>
            </div>

            {/* Contact Information */}
            <div id="contact">
              <h2 className="mb-4 text-2xl font-semibold">11. Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>If you have any questions about these Terms, please contact us:</p>
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <a href="mailto:support@wa-api.me" className="text-emerald-500 hover:underline">support@wa-api.me</a>
                    </div>
                    <div>
                      <h3 className="font-medium">Business Hours</h3>
                      <p className="text-sm">Monday - Friday, 9:00 AM - 6:00 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acknowledgment Section */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-semibold text-emerald-800">By Using WA-API, You Acknowledge That:</h2>
                <ul className="mt-4 space-y-2 text-emerald-700">
                  <li className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>You have read, understood, and agree to be bound by these Terms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>You are authorized to enter into this agreement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="mt-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>You will comply with WhatsApp's Terms of Service</span>
                  </li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <div className="rounded-lg border border-emerald-200 bg-white p-6">
                  <p className="text-sm font-medium text-emerald-800">Need Legal Assistance?</p>
                  <a href="mailto:support@wa-api.me" className="mt-2 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">
                    Contact Legal Team
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Policies */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Related Policies</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Review our other important policies
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Link href="/privacy" className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-accent hover:text-accent-foreground">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold">Privacy Policy</h3>
              <p className="mt-2 text-sm text-muted-foreground">How we collect, use, and protect your data</p>
            </Link>
            <Link href="/refund" className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-accent hover:text-accent-foreground">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Refund Policy</h3>
              <p className="mt-2 text-sm text-muted-foreground">7-day money-back guarantee and refund process</p>
            </Link>
            <Link href="/acceptable-use" className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-accent hover:text-accent-foreground">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="font-semibold">Acceptable Use Policy</h3>
              <p className="mt-2 text-sm text-muted-foreground">Prohibited activities and content guidelines</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}