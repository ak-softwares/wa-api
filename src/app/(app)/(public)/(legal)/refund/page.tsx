"use client"

import React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function RefundPage() {
  const { data: session } = useSession()

  const faqs = [
    {
      question: "What is your refund policy?",
      answer: "We offer a 7-day, no-questions-asked refund policy for all new subscriptions and prepaid message packs. If you're not satisfied with our service within the first 7 days of your purchase, you can request a full refund."
    },
    {
      question: "How do I request a refund?",
      answer: "To request a refund, simply contact our support team via email at support@wa-api.com or through the support chat in your dashboard. Include your account email and transaction ID for faster processing."
    },
    {
      question: "How long does it take to receive my refund?",
      answer: "Refunds are typically processed within 3-5 business days. The time it takes for the refund to appear in your account depends on your bank or payment provider, but usually takes 5-10 business days."
    },
    {
      question: "Are there any conditions for refunds?",
      answer: "Refunds are available within 7 days of initial purchase. After 7 days, refunds are not available for used messages, but unused prepaid message packs may be eligible for partial refunds. Contact support for assistance."
    },
    {
      question: "What happens to my account after a refund?",
      answer: "Your account will be downgraded to the Free plan after a refund. You'll retain access to your account history and can upgrade again at any time."
    },
    {
      question: "Are Facebook/Meta charges refundable?",
      answer: "No. Facebook (Meta) charges are separate and billed directly by Meta. We cannot refund Meta's WhatsApp Business API charges. You must contact Meta support directly for any issues with their charges."
    },
    {
      question: "What about refunds for Pay-As-You-Go usage?",
      answer: "For Pay-As-You-Go accounts, refunds are only available for unused prepaid message credits purchased within the last 7 days. Used messages are non-refundable."
    },
    {
      question: "Can I get a refund if I didn't use the service much?",
      answer: "Yes, if it's within 7 days of purchase. We want you to be completely satisfied with our service. If you haven't found value in it during the first week, we're happy to refund your purchase."
    }
  ]

  const refundProcessSteps = [
    {
      step: 1,
      title: "Contact Support",
      description: "Reach out via email or dashboard chat within 7 days of purchase",
      icon: "✉️"
    },
    {
      step: 2,
      title: "Provide Details",
      description: "Share your account email and transaction ID for verification",
      icon: "🔍"
    },
    {
      step: 3,
      title: "Review & Approval",
      description: "We'll review your request (usually within 24 hours)",
      icon: "✅"
    },
    {
      step: 4,
      title: "Receive Refund",
      description: "Get your refund processed in 3-5 business days",
      icon: "💰"
    }
  ]

  const nonRefundableItems = [
    "Facebook/Meta WhatsApp API charges (billed separately by Meta)",
    "Messages already sent and delivered",
    "Services used beyond 7 days from purchase",
    "Enterprise/custom plan setup fees (after service commencement)",
    "Third-party integration costs"
  ]

  const refundableItems = [
    "Unused prepaid message packs (within 7 days)",
    "Subscription fees (within 7 days)",
    "Setup fees (if service not commenced)",
    "Platform subscription charges"
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            7-Day Money-Back Guarantee
          </div>
          <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Hassle-Free Refund Policy
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground">
            We stand behind our service with a 7-day money-back guarantee. If WA-API doesn't meet your expectations, we'll refund your purchase—no questions asked.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-400"
            >
              Request Refund
            </Link>
            <Link
              href="/pricing"
              className="rounded-2xl border border-border bg-background px-6 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Guarantee Banner */}
      <section className="border-b border-border bg-gradient-to-r from-emerald-50 to-blue-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-semibold text-emerald-800">7-Day Risk-Free Trial</h2>
                <p className="mt-2 text-emerald-700">
                  Try WA-API with complete confidence. If you're not satisfied, get a full refund within 7 days.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">7</div>
                  <div className="text-sm text-emerald-700">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">100%</div>
                  <div className="text-sm text-emerald-700">Refund</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-600">0</div>
                  <div className="text-sm text-emerald-700">Questions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Process */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Simple Refund Process</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Getting your refund is straightforward and transparent
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {refundProcessSteps.map((step) => (
              <div key={step.step} className="relative">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="mb-4 text-3xl">{step.icon}</div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-600">
                      {step.step}
                    </div>
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {step.step < 4 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                    <svg className="h-6 w-6 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 font-medium transition-colors hover:bg-accent"
            >
              Start Refund Process
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="border-b border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Refundable Items */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">What's Refundable</h2>
              </div>
              <ul className="space-y-3">
                {refundableItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Refundable Items */}
            <div className="rounded-2xl border border-amber-200 bg-white p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.224 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">What's Not Refundable</h2>
              </div>
              <ul className="space-y-3">
                {nonRefundableItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-lg bg-amber-50 p-4">
                <p className="text-sm text-amber-700">
                  <strong>Important:</strong> Facebook (Meta) charges are billed separately and managed directly by Meta. 
                  We cannot process refunds for Meta's WhatsApp Business API charges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="mb-6 text-2xl font-semibold">Refund Terms & Conditions</h2>
            <div className="space-y-6 text-sm text-muted-foreground">
              <div>
                <h3 className="mb-2 font-medium text-foreground">Eligibility Period</h3>
                <p>Refunds are available within 7 calendar days from the date of purchase. The purchase date is defined as the date when payment was successfully processed.</p>
              </div>
              
              <div>
                <h3 className="mb-2 font-medium text-foreground">Refund Method</h3>
                <p>Refunds are issued to the original payment method used during purchase. Processing times vary by payment provider but typically take 3-5 business days.</p>
              </div>
              
              <div>
                <h3 className="mb-2 font-medium text-foreground">Usage During Trial</h3>
                <p>You may use the service fully during the 7-day period. Your refund eligibility is not affected by your usage level during this time.</p>
              </div>
              
              <div>
                <h3 className="mb-2 font-medium text-foreground">Partial Refunds</h3>
                <p>For Pay-As-You-Go plans, partial refunds may be available for unused message credits after 7 days. Contact support for assistance with partial refunds.</p>
              </div>
              
              <div>
                <h3 className="mb-2 font-medium text-foreground">Account Status Post-Refund</h3>
                <p>After a refund is processed, your account will revert to the Free plan. Your data will be preserved for 30 days, after which it may be permanently deleted.</p>
              </div>
              
              <div>
                <h3 className="mb-2 font-medium text-foreground">Exceptional Circumstances</h3>
                <p>We may make exceptions to our refund policy at our discretion in cases of technical issues that prevent service usage or other exceptional circumstances.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Frequently Asked Questions</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Common questions about our refund policy
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 font-semibold">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-50/50 to-background p-12 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Need Help with a Refund?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Our support team is here to help you with any refund requests or questions
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Contact Support
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-border bg-background px-8 py-3 font-semibold transition-colors hover:bg-accent"
              >
                Go to Dashboard
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-sm font-medium">Email Support</div>
                <a href="mailto:support@wa-api.com" className="text-sm text-emerald-500 hover:underline">
                  support@wa-api.com
                </a>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-sm font-medium">Response Time</div>
                <div className="text-sm text-muted-foreground">Within 24 hours</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-sm font-medium">Business Hours</div>
                <div className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM IST</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • 
              WA-API reserves the right to modify this refund policy at any time.
            </p>
            <p className="mt-2">
              By using our service, you agree to our <Link href="/terms" className="text-emerald-500 hover:underline">Terms of Service</Link> and 
              <Link href="/privacy" className="ml-1 text-emerald-500 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}