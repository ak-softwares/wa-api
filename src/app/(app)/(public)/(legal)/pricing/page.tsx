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
  { icon: "🤖", title: "AI Assistant", desc: "24/7 intelligent auto-replies that understand context and resolve queries instantly." },
  { icon: "🧠", title: "AI Agent", desc: "Autonomous multi-step workflows — book appointments, qualify leads, process orders." },
  { icon: "📢", title: "Unlimited Broadcasts", desc: "Send campaigns to your entire contact list with no cap on recipients or frequency." },
  { icon: "👥", title: "Unlimited Contacts", desc: "Import, segment, and manage as many contacts as you need — forever free of charge." },
  { icon: "📊", title: "Advanced Analytics", desc: "Delivery rates, read receipts, reply rates, campaign ROI — full visibility." },
  { icon: "🔌", title: "Full API Access", desc: "REST API, webhooks, and WhatsApp Business API integration on every tier." },
  { icon: "🎨", title: "Custom Templates", desc: "Build rich media message templates: text, images, buttons, and quick replies." },
  { icon: "📱", title: "Multiple WA Numbers", desc: "Connect multiple WhatsApp Business numbers under one account." },
  { icon: "🔒", title: "Security & Compliance", desc: "End-to-end encrypted delivery, audit logs, and role-based access controls." },
]

const FAQS = [
  {
    q: "Are all features available on every plan?",
    a: "Yes! Every plan — including Free — includes our full feature set.",
  },
  {
    q: "How does yearly discount work?",
    a: "Yearly plans are already discounted compared to monthly pricing.",
  },
]

// ── Types ─────────────────────────────────────────────────────────────────────

type Plan = ReturnType<typeof usePricing>["plans"][number]

// ── Components ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  session,
}: {
  plan: Plan
  session: ReturnType<typeof useSession>["data"]
}) {
  const sym = currencySymbol(plan.currency)

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

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        plan.highlighted
          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
          : "border-border bg-card"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
            {plan.badge}
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold">
        {plan.name}
      </h3>

      <div className="mt-4 flex items-end gap-1">
        {isEnterprise ? (
          <span className="text-4xl font-bold">
            Custom
          </span>
        ) : (
          <>
            <span className="text-4xl font-bold">
              {sym}
              {formatPrice(plan.price!, plan.currency)}
            </span>

            <span className="mb-1 text-sm text-muted-foreground">
              /
              {plan.billingCycle === "MONTHLY"
                ? "mo"
                : "yr"}
            </span>
          </>
        )}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {plan.description}
      </p>

      <div className="mt-5 rounded-lg border border-border bg-muted/40 px-3 py-2 text-center text-sm font-medium">
        {formatMessages(plan.messagesPerMonth)}
      </div>

      <Link
        href={ctaHref}
        className={`mt-5 rounded-xl py-2.5 text-center text-sm font-semibold transition ${
          plan.highlighted
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "border border-border hover:bg-accent"
        }`}
      >
        {ctaLabel}
      </Link>

      <div className="my-5 border-t border-border" />

      <ul className="space-y-2">
        {FEATURE_BREAKDOWN.map((feature) => (
          <li
            key={feature.title}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span>{feature.icon}</span>
            <span>{feature.title}</span>
          </li>
        ))}
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
          className="overflow-hidden rounded-xl border border-border"
        >
          <button
            onClick={() =>
              setOpenFaq(openFaq === i ? null : i)
            }
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-medium">{faq.q}</span>

            <span
              className={`transition-transform ${
                openFaq === i ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>

          {openFaq === i && (
            <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
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
      <main className="min-h-screen px-4 py-20">
        <div className="mx-auto max-w-xl text-center">
          Loading pricing...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Hero */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">

          <h1 className="text-4xl font-bold">
            Simple Pricing
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            All plans include every feature.
            Only message volume changes.
          </p>

          {/* Controls */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">

            {/* Billing Toggle */}
            <div className="flex rounded-full border border-border p-1">
              <button
                onClick={() =>
                  setBillingCycle("MONTHLY")
                }
                className={`rounded-full px-5 py-2 text-sm ${
                  billingCycle === "MONTHLY"
                    ? "bg-emerald-500 text-white"
                    : ""
                }`}
              >
                Monthly
              </button>

              <button
                onClick={() =>
                  setBillingCycle("YEARLY")
                }
                className={`rounded-full px-5 py-2 text-sm ${
                  billingCycle === "YEARLY"
                    ? "bg-emerald-500 text-white"
                    : ""
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Currency */}
            <select
              value={currency}
              onChange={(e) =>
                setCurrency(
                  e.target.value as "INR" | "USD"
                )
              }
              className="rounded-full border border-border bg-card px-4 py-2 text-sm"
            >
              <option value="INR">
                INR (₹)
              </option>

              <option value="USD">
                USD ($)
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.tier}
                plan={plan}
                session={session}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-5xl px-4">

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold">
              Everything Included
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {FEATURE_BREAKDOWN.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-3 text-2xl">
                  {item.icon}
                </div>

                <h3 className="font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-3xl px-4">

          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold">
              FAQ
            </h2>
          </div>

          <FaqList />
        </div>
      </section>
    </main>
  )
}