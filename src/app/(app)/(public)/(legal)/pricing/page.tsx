"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { FREE_MONTHLY_MESSAGES, PRICE_PER_CREDIT_USD } from "@/utiles/constans/wallet";

type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';

interface CurrencyRates {
  USD: number;
  EUR: number;
  GBP: number;
  INR: number;
}

interface ConvertedPrice {
  symbol: string;
  value: string;
  rate: number;
}

export default function PricingPage() {
  const { data: session } = useSession()
  const [selectedPlan, setSelectedPlan] = useState<string>("pay-as-you-go")
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD')
  const [conversionRates, setConversionRates] = useState<CurrencyRates>({
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    INR: 83.5
  })

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹'
  }

  const currencyNames = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    INR: 'Indian Rupee'
  }

  // Mock currency conversion - in production, use real API
  const convertPrice = (usdAmount: string): ConvertedPrice => {
    const numericAmount = parseFloat(usdAmount.replace('$', '').replace(',', ''))
    const rate = conversionRates[selectedCurrency]
    const convertedValue = selectedCurrency === 'USD' 
      ? numericAmount 
      : numericAmount * rate
    
    return {
      symbol: currencySymbols[selectedCurrency],
      value: convertedValue.toLocaleString(undefined, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 5
      }),
      rate: rate
    }
  }

  const pricingPlans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for testing and small businesses",
      features: [
        `Up to ${FREE_MONTHLY_MESSAGES} messages/month`,
        "Basic automation",
        "1 WhatsApp number",
        "Basic analytics",
        "Community support",
      ],
      cta: session ? "Current Plan" : "Get Started Free",
      href: session ? "/dashboard" : "/auth/login",
      highlighted: false,
    },
    {
      id: "pay-as-you-go",
      name: "Pay-As-You-Go",
      usdPrice: PRICE_PER_CREDIT_USD,
      period: "per message",
      description: "Best for growing businesses with variable volume",
      features: [
        "AI-powered automated replies",
        "Unlimited bulk messaging",
        "Multiple WhatsApp numbers",
        "Advanced analytics dashboard",
        "Priority email support",
        "Custom message templates",
        "API access",
        "WhatsApp Business API integration",
      ],
      cta: "Start Sending",
      href: session ? "/dashboard" : "/auth/login",
      highlighted: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "monthly",
      description: "For large organizations with high-volume needs",
      features: [
        "Everything in Pay-As-You-Go",
        "Unlimited messages (bulk discounts)",
        "Dedicated account manager",
        "SLA guarantee (99.9% uptime)",
        "Phone & priority support",
        "Custom integration support",
        "Advanced security features",
        "White-label options available",
      ],
      cta: "Contact Sales",
      href: "/contact",
      highlighted: false,
    },
  ]

  const usageExamples = [
    { messages: "1,000", cost: "$2.00", description: "Small business monthly" },
    { messages: "10,000", cost: "$20.00", description: "Medium business monthly" },
    { messages: "100,000", cost: "$200.00", description: "Growing enterprise monthly" },
    { messages: "1,000,000", cost: "$2,000.00", description: "Large enterprise monthly" },
  ]

  const faqs = [
    {
      question: "How does the ${0.002} per message pricing work?",
      answer: "You're charged $0.002 for every message sent through our platform. This includes both outbound messages (campaigns, notifications) and automated AI replies. There are no monthly subscriptions or hidden fees - you only pay for what you use."
    },
    {
      question: "What about Facebook (Meta) API charges?",
      answer: "Facebook's WhatsApp Business API charges are separate and billed directly by Meta. These charges are paid using your debit/credit card connected to your Facebook Business Manager account. Our $0.002 fee is for our platform services only."
    },
    {
      question: "How do I pay for Facebook API charges?",
      answer: "You need to add a payment method in your Facebook Business Manager. Meta will charge you directly for their WhatsApp Business API usage. For current Meta pricing, visit: "
    },
    {
      question: "Is there any minimum commitment?",
      answer: "No minimum commitment. Start with our Free tier and upgrade to Pay-As-You-Go whenever you're ready. You can send as few or as many messages as you need."
    },
    {
      question: "What's included in the unlimited bulk messaging?",
      answer: "You can send unlimited broadcast messages to your subscribers. Each message sent (including bulk messages) is charged at $0.002. There are no limits on the number of campaigns or recipients."
    },
    {
      question: "How does AI-powered auto-reply work?",
      answer: "Our AI automatically responds to common customer queries 24/7. Each AI-generated reply is charged at $0.002. You can customize response templates and train the AI on your business specifics."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! You can downgrade to Free or cancel anytime. No contracts, no cancellation fees."
    }
  ]

  const getConvertedExamples = () => {
    if (selectedCurrency === 'USD') return usageExamples;
    
    const rate = conversionRates[selectedCurrency];
    const symbol = currencySymbols[selectedCurrency];
    
    return usageExamples.map(example => {
      const numericAmount = parseFloat(example.cost.replace('$', '').replace(',', ''));
      const convertedAmount = numericAmount * rate;
      
      return {
        ...example,
        cost: `${symbol}${convertedAmount.toFixed(2)}`
      };
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Transparent Pricing That Grows With You
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground">
            Pay only for what you use. No monthly subscriptions, no hidden fees. 
            Just <span className="font-semibold text-emerald-500">
              {selectedCurrency === 'USD' ? '$' : currencySymbols[selectedCurrency]}
              {selectedCurrency === 'USD' ? '0.002' : (0.002 * conversionRates[selectedCurrency]).toFixed(4)}
            </span> per message with AI replies and unlimited bulk messaging included.
          </p>
          
          {/* Currency Selector */}
          <div className="mb-6 inline-flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Facebook API charges are separate and paid directly to Meta
            </div>
            
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Currency:</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                className="bg-transparent text-sm focus:outline-none"
              >
                {Object.entries(currencyNames).map(([code, name]) => (
                  <option key={code} value={code}>{name} ({currencySymbols[code as Currency]})</option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">
                1 USD = {currencySymbols[selectedCurrency]}{conversionRates[selectedCurrency].toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Choose Your Plan</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Start free, scale with Pay-As-You-Go, or get custom enterprise solutions
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => {
              let displayPrice, displayPeriod;
              
              if (plan.id === "pay-as-you-go") {
                const converted = convertPrice(`$${plan.usdPrice}`);
                displayPrice = converted.value;
                displayPeriod = `per message`;
              } else if (plan.id === "free") {
                const converted = convertPrice(plan.price ?? "");
                displayPrice = converted.value;
                displayPeriod = plan.period;
              } else {
                displayPrice = plan.price;
                displayPeriod = plan.period;
              }

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border ${
                    plan.highlighted 
                      ? 'border-emerald-500 bg-gradient-to-b from-emerald-50/50 to-background shadow-lg' 
                      : 'border-border bg-card'
                  } p-8`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-emerald-500 px-4 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      {plan.id === "pay-as-you-go" ? (
                        <>
                          <span className="text-4xl font-bold">
                            {currencySymbols[selectedCurrency]}{displayPrice}
                          </span>
                          <span className="ml-2 text-muted-foreground">/{displayPeriod}</span>
                        </>
                      ) : plan.id === "free" ? (
                        <>
                          <span className="text-4xl font-bold">
                            {currencySymbols[selectedCurrency]}{displayPrice}
                          </span>
                          <span className="ml-2 text-muted-foreground">/{displayPeriod}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">{displayPrice}</span>
                          <span className="ml-2 text-muted-foreground">/{displayPeriod}</span>
                        </>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                    {plan.id === "pay-as-you-go" && selectedCurrency !== 'USD' && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        ≈ ${plan.usdPrice} USD per message
                      </p>
                    )}
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <svg className="mr-3 h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'border border-border bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Cost Calculator */}
      <section className="border-b border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Calculate Your Monthly Cost</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Estimate your monthly expenses based on message volume
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 rounded-2xl border border-border bg-card p-8 md:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Monthly Message Volume</h3>
                  <span className="text-sm text-muted-foreground">
                    Rate: {currencySymbols[selectedCurrency]}{selectedCurrency === 'USD' ? '0.002' : (0.002 * conversionRates[selectedCurrency]).toFixed(5)} per msg
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Messages per month</label>
                    <input
                      type="range"
                      min="100"
                      max="1000000"
                      step="100"
                      defaultValue="10000"
                      className="w-full"
                      onChange={(e) => {
                        // Add calculation logic here
                      }}
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>100</span>
                      <span>10K</span>
                      <span>100K</span>
                      <span>1M</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border p-4">
                      <div className="text-2xl font-bold text-emerald-500">
                        {currencySymbols[selectedCurrency]}{(10000 * 0.002 * conversionRates[selectedCurrency]).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Platform cost</div>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="text-2xl font-bold text-blue-500">
                        {currencySymbols[selectedCurrency]}{((10000 * 0.002 * conversionRates[selectedCurrency]) * 2.25).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Estimated Meta charges*</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    *Meta charges vary based on conversation type and region. 
                    <Link 
                      href="https://developers.facebook.com/docs/whatsapp/pricing/" 
                      target="_blank"
                      className="ml-1 text-blue-500 hover:underline"
                    >
                      View Meta pricing details
                    </Link>
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Example Scenarios</h3>
                  <span className="text-xs text-muted-foreground">
                    in {selectedCurrency}
                  </span>
                </div>
                <div className="space-y-3">
                  {getConvertedExamples().map((example, index) => (
                    <div key={index} className="rounded-lg border border-border p-4">
                      <div className="flex justify-between">
                        <span className="font-medium">{example.messages} messages</span>
                        <span className="font-semibold text-emerald-500">{example.cost}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{example.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8">
            <h3 className="mb-4 flex items-center text-lg font-semibold text-amber-800">
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Important: Understanding Facebook (Meta) Charges
            </h3>
            <div className="space-y-4 text-sm text-amber-700">
              <p>
                <strong>Our platform charges {selectedCurrency === 'USD' ? '$0.002' : `${currencySymbols[selectedCurrency]}${(0.002 * conversionRates[selectedCurrency]).toFixed(4)}`} per message</strong> for our services including:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>AI-powered automated replies</li>
                <li>Unlimited bulk messaging campaigns</li>
                <li>Advanced analytics dashboard</li>
                <li>API access and integration</li>
                <li>Customer support</li>
              </ul>
              <p>
                <strong>Separately, Facebook (Meta) charges apply</strong> for WhatsApp Business API usage. These are:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Billed directly by Meta to your Facebook Business Manager</li>
                <li>Paid using your debit/credit card on file with Meta</li>
                <li>Based on conversation types (utility, authentication, marketing)</li>
                <li>Vary by country and conversation category</li>
              </ul>
              <p className="pt-2">
                <Link 
                  href="https://developers.facebook.com/docs/whatsapp/pricing/" 
                  target="_blank"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  ↗ View official Meta WhatsApp Business API pricing
                </Link>
              </p>
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
              Clear answers to common questions about pricing and billing
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 font-semibold">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">
                  {faq.answer}
                  {faq.question.includes("Facebook API charges") && (
                    <Link 
                      href="https://developers.facebook.com/docs/whatsapp/pricing/" 
                      target="_blank"
                      className="ml-1 font-semibold text-blue-500 hover:underline"
                    >
                      https://developers.facebook.com/docs/whatsapp/pricing/
                    </Link>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-50/50 to-background p-12">
            <h2 className="text-2xl font-semibold md:text-3xl">Ready to Get Started?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Join thousands of businesses using WA-API to power their WhatsApp communications
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href={session ? "/dashboard/billing" : "/auth/login"}
                className="rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Start Pay-As-You-Go
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-border bg-background px-8 py-3 font-semibold transition-colors hover:bg-accent"
              >
                Contact Sales
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required to start • 100 messages free every month
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}