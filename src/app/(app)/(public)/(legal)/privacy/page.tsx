"use client"

import React from "react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mb-8 max-w-4xl text-lg text-muted-foreground">
            At WA-API, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our WhatsApp automation platform.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#data-collection" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Data We Collect
            </a>
            <a href="#data-usage" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              How We Use Data
            </a>
            <a href="#data-protection" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Data Protection
            </a>
            <a href="#rights" className="rounded-2xl border border-border bg-background px-5 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Your Rights
            </a>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="border-b border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="mb-6 text-2xl font-semibold">Privacy at a Glance</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold">We Protect Your Data</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted and stored securely. We never sell your personal information to third parties.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Transparent Practices</h3>
                <p className="text-sm text-muted-foreground">
                  We clearly explain what data we collect, why we collect it, and how we use it.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="font-semibold">Your Control</h3>
                <p className="text-sm text-muted-foreground">
                  You have control over your data. Access, update, or delete your information at any time.
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
            {/* Introduction */}
            <div id="introduction">
              <h2 className="mb-4 text-2xl font-semibold">1. Introduction</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  WA-API ("we," "our," or "us") operates the WhatsApp automation platform (the "Service"). This Privacy Policy applies to all users of our Service, including website visitors, registered users, and customers.
                </p>
                <p>
                  By using our Service, you consent to the data practices described in this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
                </p>
                <p>
                  This Privacy Policy is incorporated into and subject to our <Link href="/terms" className="text-emerald-500 hover:underline">Terms of Service</Link>.
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div id="data-collection">
              <h2 className="mb-4 text-2xl font-semibold">2. Information We Collect</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 font-medium">A. Information You Provide to Us</h3>
                  <ul className="ml-6 space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Account Information:</strong> When you register, we collect your name, email address, phone number, and company details.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Payment Information:</strong> We collect billing details, but payment processing is handled by secure third-party processors. We do not store credit card numbers.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Content Information:</strong> Messages, templates, and campaign content you create or send through our platform.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Contact Lists:</strong> Recipient phone numbers and contact information you upload to send WhatsApp messages.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Support Communications:</strong> Information you provide when contacting our support team.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 font-medium">B. Information We Collect Automatically</h3>
                  <ul className="ml-6 space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Usage Data:</strong> How you interact with our Service, including log files, IP addresses, browser type, device information, and pages visited.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your experience and analyze Service usage.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Message Analytics:</strong> Delivery rates, read receipts, response rates, and engagement metrics for your campaigns.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 font-medium">C. Information from Third Parties</h3>
                  <ul className="ml-6 space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>WhatsApp Business API:</strong> We receive message status updates and delivery reports from Meta's WhatsApp Business API.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Authentication Services:</strong> If you sign in through Google or other third-party services, we may receive basic profile information.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div id="data-usage">
              <h2 className="mb-4 text-2xl font-semibold">3. How We Use Your Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We use the information we collect for the following purposes:</p>
                <ul className="ml-6 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>To provide, maintain, and improve our WhatsApp automation services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>To process your transactions and send billing information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>To send WhatsApp messages on your behalf to your specified recipients</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>To provide customer support and respond to your inquiries</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>To monitor and analyze usage patterns to improve our Service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>To detect, prevent, and address technical issues and security vulnerabilities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>To send important notifications about service updates, security alerts, and administrative messages</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>To personalize your experience and provide relevant content and features</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Sharing and Disclosure */}
            <div id="data-sharing">
              <h2 className="mb-4 text-2xl font-semibold">4. Data Sharing and Disclosure</h2>
              <div className="space-y-6 text-muted-foreground">
                <p>We may share your information in the following circumstances:</p>
                
                <div>
                  <h3 className="mb-2 font-medium">A. Service Providers</h3>
                  <p>We engage third-party companies to facilitate our Service ("Service Providers"), including:</p>
                  <ul className="ml-6 mt-2 space-y-1">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Meta Platforms, Inc.:</strong> To send WhatsApp messages through the WhatsApp Business API</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Payment Processors:</strong> To handle billing and transactions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Hosting Providers:</strong> To store and process data</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Analytics Services:</strong> To understand Service usage and improve features</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">B. Legal Requirements</h3>
                  <p>We may disclose your information if required by law, such as to:</p>
                  <ul className="ml-6 mt-2 space-y-1">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Comply with legal obligations or subpoenas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Protect and defend our rights or property</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Prevent or investigate possible wrongdoing in connection with the Service</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Protect the personal safety of users or the public</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">C. Business Transfers</h3>
                  <p>If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <p className="text-sm text-amber-700">
                    <strong>Important:</strong> We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Security */}
            <div id="data-protection">
              <h2 className="mb-4 text-2xl font-semibold">5. Data Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We implement appropriate technical and organizational security measures to protect your personal information, including:</p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-medium">Technical Measures</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>End-to-end encryption for sensitive data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Regular security audits and vulnerability assessments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Secure data centers with physical security controls</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-medium">Organizational Measures</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Access controls and role-based permissions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Regular security training for staff</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="mt-0.5 h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Data breach response procedures</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div id="rights">
              <h2 className="mb-4 text-2xl font-semibold">6. Your Data Protection Rights</h2>
              <div className="space-y-6 text-muted-foreground">
                <p>Depending on your location, you may have the following rights regarding your personal information:</p>
                
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-medium">Access and Correction</h3>
                    <p className="text-sm">You can access and update your account information through your dashboard settings.</p>
                  </div>
                  
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-medium">Data Portability</h3>
                    <p className="text-sm">You can request a copy of your data in a structured, commonly used format.</p>
                  </div>
                  
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-medium">Deletion</h3>
                    <p className="text-sm">You can request deletion of your personal information, subject to legal retention requirements.</p>
                  </div>
                  
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-medium">Opt-Out</h3>
                    <p className="text-sm">You can opt out of marketing communications by using the unsubscribe link in our emails.</p>
                  </div>
                  
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2 font-medium">Cookie Preferences</h3>
                    <p className="text-sm">You can manage cookies through your browser settings or our cookie preference center.</p>
                  </div>
                </div>

                <p>
                  To exercise any of these rights, please contact us at <a href="mailto:privacy@wa-api.me" className="text-emerald-500 hover:underline">privacy@wa-api.me</a>. We may need to verify your identity before processing your request.
                </p>
              </div>
            </div>

            {/* Data Retention */}
            <div id="retention">
              <h2 className="mb-4 text-2xl font-semibold">7. Data Retention</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We retain your personal information only for as long as necessary to:</p>
                <ul className="ml-6 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Provide you with the Service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Comply with legal obligations (such as tax, accounting, or reporting requirements)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Resolve disputes and enforce our agreements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Maintain business records for analysis and service improvement</span>
                  </li>
                </ul>
                <p>
                  When we no longer need your personal information, we will securely delete or anonymize it. Message logs and campaign data are typically retained for 90 days to provide analytics and troubleshooting, unless you choose to delete them sooner.
                </p>
              </div>
            </div>

            {/* International Data Transfers */}
            <div id="international">
              <h2 className="mb-4 text-2xl font-semibold">8. International Data Transfers</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Your information may be transferred to and processed in countries other than your own. These countries may have data protection laws that are different from those in your country.
                </p>
                <p>
                  We ensure appropriate safeguards are in place for such transfers, including:
                </p>
                <ul className="ml-6 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Standard contractual clauses approved by relevant authorities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Data processing agreements with our service providers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Adequacy decisions where applicable</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Children's Privacy */}
            <div id="children">
              <h2 className="mb-4 text-2xl font-semibold">9. Children's Privacy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our Service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If you become aware that a child has provided us with personal information, please contact us immediately.
                </p>
                <p>
                  If we learn that we have collected personal information from a child under 16, we will take steps to delete that information as soon as possible.
                </p>
              </div>
            </div>

            {/* Changes to Privacy Policy */}
            <div id="changes">
              <h2 className="mb-4 text-2xl font-semibold">10. Changes to This Privacy Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
                <p>
                  We will also notify you via email and/or a prominent notice on our Service before the change becomes effective, if the changes are material.
                </p>
                <p>
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </div>
            </div>

            {/* Contact Us */}
            <div id="contact">
              <h2 className="mb-4 text-2xl font-semibold">11. Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <a href="mailto:support@wa-api.me" className="text-emerald-500 hover:underline">support@wa-api.me</a>
                    </div>
                    <div>
                      <h3 className="font-medium">Data Protection Officer</h3>
                      <p className="text-sm">For data protection inquiries in the European Union, please contact our Data Protection Officer at <a href="mailto:support@wa-api.me" className="text-emerald-500 hover:underline">support@wa-api.me</a></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="rounded-2xl border border-border bg-card p-12">
            <h2 className="text-2xl font-semibold md:text-3xl">Have Privacy Questions?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              We're committed to being transparent about our data practices. Contact us if you have any questions.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Contact Privacy Team
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Response time: We aim to respond to all privacy-related inquiries within 72 hours.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}