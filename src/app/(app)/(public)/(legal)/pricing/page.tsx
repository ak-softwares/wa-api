"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

import { usePricing } from "@/hooks/pricing/usePricing"

// ── Display-only helpers ──────────────────────────────────────────────────────

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
}

function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOL[currency] ?? currency
}

function formatPrice(price: number, currency: string): string {
  return price.toLocaleString(
    currency === "INR" ? "en-IN" : undefined,
    { maximumFractionDigits: 0 }
  )
}

function formatMessages(n: number | null): string {
  if (n == null || n < 0) return "Unlimited messages"
  return `${n.toLocaleString()} messages / month`
}

// ── Static content ────────────────────────────────────────────────────────────

const FEATURE_BREAKDOWN = [
  { icon: "🤖", title: "AI Assistant",         desc: "24/7 intelligent auto-replies that understand context and resolve queries instantly." },
  { icon: "🧠", title: "AI Agent",             desc: "Autonomous multi-step workflows — book appointments, qualify leads, process orders." },
  { icon: "📢", title: "Unlimited Broadcasts", desc: "Send campaigns to your entire contact list with no cap on recipients or frequency." },
  { icon: "👥", title: "Unlimited Contacts",   desc: "Import, segment, and manage as many contacts as you need — forever free of charge." },
  { icon: "📊", title: "Advanced Analytics",   desc: "Delivery rates, read receipts, reply rates, campaign ROI — full visibility." },
  { icon: "🔌", title: "Full API Access",      desc: "REST API, webhooks, and WhatsApp Business API integration on every tier." },
  { icon: "🎨", title: "Custom Templates",     desc: "Build rich media message templates: text, images, buttons, and quick replies." },
  { icon: "📱", title: "Multiple WA Numbers",  desc: "Connect multiple WhatsApp Business numbers under one account." },
  { icon: "🔒", title: "Security & Compliance",desc: "End-to-end encrypted delivery, audit logs, and role-based access controls." },
]

const ALL_FEATURES = [
  { icon: "🤖", label: "AI Assistant (24/7 smart replies)" },
  { icon: "🧠", label: "AI Agent (autonomous workflows)" },
  { icon: "📢", label: "Unlimited broadcast campaigns" },
  { icon: "👥", label: "Unlimited contacts" },
  { icon: "📊", label: "Advanced analytics dashboard" },
  { icon: "🔌", label: "Full API access" },
  { icon: "📱", label: "WhatsApp Business API integration" },
  { icon: "🎨", label: "Custom message templates" },
  { icon: "🔒", label: "Advanced security features" },
  { icon: "📞", label: "Priority support" },
]

const FAQS = [
  {
    q: "Are all features available on every plan?",
    a: "Yes! Every plan — including Free — includes our full feature set: AI Assistant, AI Agent, unlimited contacts, unlimited broadcasts, API access, and analytics. The only difference between plans is the number of messages included per month.",
  },
  {
    q: "What happens when I exceed my monthly message limit?",
    a: "When you reach your plan's message limit, you can either upgrade to the next plan or purchase additional messages at our standard rate. We'll notify you at 80% and 100% usage so you're never caught off guard.",
  },
  {
    q: "What are Facebook (Meta) API charges?",
    a: "Facebook's WhatsApp Business API charges are separate and billed directly by Meta to your Facebook Business Manager account. Our plan fees cover platform usage only. Meta charges vary by conversation type (utility, marketing, authentication) and region.",
  },
  {
    q: "How does the yearly discount work?",
    a: "Switch to annual billing and pay for 10 months instead of 12 — that's 2 months free. The discount applies immediately and your plan renews annually at the discounted rate.",
  },
  {
    q: "Can I switch plans anytime?",
    a: "Absolutely. Upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Our Free plan gives you 100 messages/month forever so you can test the platform before committing. No credit card required.",
  },
]

// ── Types ─────────────────────────────────────────────────────────────────────

type Plan = ReturnType<typeof usePricing>["plans"][number]

// ── Components ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  session,
  billingCycle,
  currency,
}: {
  plan: Plan
  session: ReturnType<typeof useSession>["data"]
  billingCycle: "MONTHLY" | "YEARLY"
  currency: string
}) {
  const sym = currencySymbol(currency)
  const isEnterprise = plan.price == null

  const ctaHref = isEnterprise
    ? "/contact"
    : session
      ? plan.price === 0
        ? "/dashboard"
        : "/dashboard/billing"
      : "/auth/login"

  const ctaLabel =
    session && plan.price === 0
      ? "Current Plan"
      : plan.cta

  // plan.price — per-month figure for the active billing cycle & currency,
  //               already resolved correctly by the hook/API.

  return (
    <div
      className={`relative flex flex-col rounded-2xl border ${
        plan.highlighted
          ? "border-emerald-500 bg-gradient-to-b from-emerald-50/60 to-background shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30 dark:from-emerald-950/40 dark:to-background"
          : "border-border bg-card"
      } p-6`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-bold ${
              plan.highlighted
                ? "bg-emerald-500 text-white"
                : "border border-border bg-muted text-muted-foreground"
            }`}
          >
            {plan.badge}
          </span>
        </div>
      )}

      {/* Plan name & price */}
      <div className="mb-5 mt-1">
        <h3 className="text-base font-semibold">{plan.name}</h3>

        <div className="mt-3 flex items-end gap-1">
          {isEnterprise ? (
            <span className="text-3xl font-bold">Custom</span>
          ) : plan.price === 0 ? (
            <>
              <span className="text-3xl font-bold">{sym}0</span>
              <span className="mb-0.5 text-sm text-muted-foreground">/mo</span>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold">
                {sym}{formatPrice(plan.price!, currency)}
              </span>
              <span className="mb-0.5 text-sm text-muted-foreground">/mo</span>
            </>
          )}
        </div>

        <p className="mt-2 text-xs leading-snug text-muted-foreground">
          {plan.description}
        </p>
      </div>

      {/* Message allowance pill */}
      <div
        className={`mb-5 rounded-lg border px-3 py-2 text-center text-sm font-semibold ${
          plan.highlighted
            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "border-border bg-muted/40 text-foreground"
        }`}
      >
        {formatMessages(plan.messagesPerMonth)}
        <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
          + Meta API charges
        </span>
      </div>

      {/* CTA */}
      <Link
        href={ctaHref}
        className={`mb-6 block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-all ${
          plan.highlighted
            ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:shadow-md"
            : "border border-border bg-background text-foreground hover:bg-accent"
        }`}
      >
        {ctaLabel}
      </Link>

      {/* Divider */}
      <div className="mb-4 border-t border-border" />

      {/* All features */}
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Everything included
      </p>
      <ul className="flex-1 space-y-2.5">
        {ALL_FEATURES.map((f) => (
          <li
            key={f.label}
            className="flex items-start gap-2 text-xs text-muted-foreground"
          >
            <span className="mt-0.5 shrink-0">{f.icon}</span>
            <span>{f.label}</span>
          </li>
        ))}
        <li className="flex items-start gap-2 text-xs text-muted-foreground">
          <span className="mt-0.5 shrink-0">➕</span>
          <span>Meta WhatsApp API (billed by Meta)</span>
        </li>
      </ul>
    </div>
  )
}

function FaqList() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => (
        <div
          key={faq.q}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold"
          >
            {faq.q}
            <span
              className={`ml-4 shrink-0 text-muted-foreground transition-transform ${
                openFaq === i ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>

          {openFaq === i && (
            <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { data: session } = useSession()

  const {
    plans,
    currency,
    setCurrency,
    billingCycle,
    setBillingCycle,
    loading,
  } = usePricing()

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-16 text-foreground">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
          <span className="mx-auto mb-4 block h-2 w-24 animate-pulse rounded-full bg-emerald-400" />
          <h1 className="text-2xl font-semibold">Loading pricing...</h1>
          <p className="mt-3 text-muted-foreground">
            Fetching the latest plans and supported currencies.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            All features included on every plan
          </div>

          <h1 className="mb-4 mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Simple, Transparent Pricing
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Every plan includes AI Assistant, AI Agent, unlimited contacts, and unlimited
            broadcasts. Pay only for the message volume you need.
          </p>

          {/* Controls Row */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">

            {/* Billing Toggle */}
            <div className="relative flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
              <button
                onClick={() => setBillingCycle("MONTHLY")}
                className={`relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  billingCycle === "MONTHLY"
                    ? "bg-emerald-500 text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("YEARLY")}
                className={`relative z-10 flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  billingCycle === "YEARLY"
                    ? "bg-emerald-500 text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    billingCycle === "YEARLY"
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  Save 2 months
                </span>
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "INR" | "USD")}
                className="bg-transparent text-sm focus:outline-none"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>
          </div>

          {billingCycle === "YEARLY" && (
            <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              🎉 Pay for 10 months, get 2 months free!
            </p>
          )}
        </div>
      </section>

      {/* ── Pricing Cards ────────────────────────────────── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.tier}
                plan={plan}
                session={session}
                billingCycle={billingCycle}
                currency={currency}
              />
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ✅ All plans include the exact same features — only message volume differs.
            Meta / Facebook API charges are <strong>always additional</strong> and billed
            directly by Meta.
          </p>
        </div>
      </section>

      {/* ── Feature Breakdown ────────────────────────────── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">
              What&apos;s Included on Every Plan
            </h2>
            <p className="mt-3 text-muted-foreground">No feature gating. No paywalls.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {FEATURE_BREAKDOWN.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-3 text-2xl">{item.icon}</div>
                <h3 className="mb-1 text-sm font-semibold">{item.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Meta Pricing Note ────────────────────────────── */}
      <section className="border-b border-border bg-amber-50/50 py-10 dark:bg-amber-950/20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl border border-amber-200 bg-white/70 p-6 shadow-sm dark:border-amber-700/40 dark:bg-card">
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-800 dark:text-amber-400">
              <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Facebook (Meta) API Charges — Billed Separately by Meta
            </h3>
            <div className="grid gap-6 text-sm text-amber-700 dark:text-amber-300 sm:grid-cols-2">
              <div>
                <p className="mb-2 font-medium">Our platform fee covers:</p>
                <ul className="space-y-1 text-xs">
                  {[
                    "AI Assistant & AI Agent",
                    "Unlimited broadcasts & contacts",
                    "Analytics, templates, API access",
                    "Customer support",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <svg
                        className="h-3.5 w-3.5 shrink-0 text-emerald-500 dark:text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 font-medium">Meta charges separately for:</p>
                <ul className="space-y-1 text-xs">
                  {[
                    "Each WhatsApp conversation opened",
                    "Varies by category (marketing, utility, auth)",
                    "Varies by recipient's country",
                    "Billed to your Facebook Business Manager",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span className="shrink-0 text-amber-400 dark:text-amber-500">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 border-t border-amber-100 pt-4 dark:border-amber-800/40">
              <Link
                href="https://whatsappbusiness.com/products/platform-pricing/"
                target="_blank"
                className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                ↗ View official Meta WhatsApp Business API pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>
          <FaqList />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-50/50 to-background p-12 dark:from-emerald-950/30 dark:to-background">
            <h2 className="text-2xl font-semibold md:text-3xl">Ready to Start?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join businesses already automating their WhatsApp with AI. Start free — no
              credit card needed.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href={session ? "/dashboard/billing" : "/auth/login"}
                className="rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Start Free
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-border bg-background px-8 py-3 font-semibold transition-colors hover:bg-accent"
              >
                Talk to Sales
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              100 messages free every month · No credit card · Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}