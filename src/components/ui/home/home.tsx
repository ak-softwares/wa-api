"use client";
import React, { useState } from "react";
import Link from "next/link";
import WhatsAppSignup from "../wa/WhatsAppSignup";

// Paste this file as app/page.tsx (App Router) or pages/index.tsx (Pages Router)
// TailwindCSS required. Dark-first design.

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      title: "Seamless WhatsApp Integration",
      desc: "Connect your business systems effortlessly with WhatsApp for smooth communication.",
    },
    {
      title: "Automated Messaging",
      desc: "Save time with smart automation for replies, reminders, and follow-ups.",
    },
    {
      title: "Bulk Campaigns",
      desc: "Reach thousands of customers instantly with personalized broadcasts.",
    },
    {
      title: "Smart Chatbots",
      desc: "Handle queries 24/7 with AI-powered flows that delight customers.",
    },
    {
      title: "Real-Time Notifications",
      desc: "Send instant order, payment, and status alerts on WhatsApp.",
    },
    {
      title: "Analytics & Insights",
      desc: "Track delivery, read rates, and engagement to optimize results.",
    },
  ];

  const industries = [
    {
      title: "E‑Commerce",
      desc: "Boost your store with order updates, support, and promotions that drive sales.",
    },
    {
      title: "Hotels & Resorts",
      desc: "Elevate guest experience with booking updates, concierge chat, and feedback flows.",
    },
    {
      title: "Education",
      desc: "Admission updates, fee reminders, and course notifications in real time.",
    },
    {
      title: "Healthcare",
      desc: "Appointments, reports, and reminders to keep patients informed.",
    },
    {
      title: "Finance",
      desc: "Secure alerts, due reminders, and customer support at scale.",
    },
    {
      title: "Logistics",
      desc: "Shipment tracking, delivery alerts, and two‑way support made simple.",
    },
  ];

  const testimonials = [
    {
      name: "Amit Sharma",
      quote:
        "WA‑API has completely simplified our WhatsApp automation. Templates, notifications, and support are now seamless.",
    },
    {
      name: "Priya Verma",
      quote:
        "I struggled with integration before. This platform made it easy and reliable, with quick support whenever needed.",
    },
    {
      name: "Rahul Mehta",
      quote:
        "Real‑time updates cut support calls and improved repeat purchases. Broadcasts are effortless.",
    },
    {
      name: "Sneha Kapoor",
      quote:
        "Developer‑friendly docs and stable infra. Onboarding took minutes, not days.",
    },
    {
      name: "Karan Singh",
      quote:
        "Perfect for growing businesses. Scales smoothly and stays cost‑effective.",
    },
    {
      name: "Neha Joshi",
      quote:
        "Broadcast campaigns at scale without the usual complexity. Huge time saver.",
    },
    {
      name: "Rohit Malhotra",
      quote:
        "Automation for reminders and FAQs just works. Our team finally focuses on high‑value tasks.",
    },
  ];

  const faqs = [
    {
      q: "Is WA‑API really free to use?",
      a: "Yes. It’s 100% free with no subscription fees or hidden charges.",
    },
    {
      q: "Do I need coding skills to set it up?",
      a: "No. Use the dashboard and Android app to run campaigns and automation without code.",
    },
    {
      q: "Can I send WhatsApp broadcasts to many customers?",
      a: "Yes. Send bulk promotions and updates to thousands in a few clicks.",
    },
    {
      q: "How does automation work?",
      a: "Set rules for replies, reminders, and order updates to engage customers 24/7.",
    },
    {
      q: "Which platforms can I use WA‑API on?",
      a: "Use the web dashboard or our free Android app from Google Play.",
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_-10%,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-neutral-900/50 px-3 py-1 text-xs text-emerald-300">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Free • No Subscription • Mobile App
            </div>
            <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
              Automate & Broadcast Your Business with WhatsApp API
            </h1>
            <p className="mb-8 max-w-xl text-neutral-300">
              Reach thousands instantly with WhatsApp marketing campaigns and streamline your workflows
              with automation — no coding, no fees. Start now and scale when you’re ready.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#cta"
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
              >
                Try It Free
              </a>
              <Link
                href="https://play.google.com/store/apps/details?id=com.ara.chatflow"
                target="_blank"
                className="rounded-2xl border border-neutral-700 bg-neutral-900 px-5 py-3 text-sm text-neutral-200 hover:border-neutral-600"
              >
                Download on Google Play
              </Link>
              <WhatsAppSignup />
            </div>
            <p className="mt-4 text-xs text-neutral-400">
              No coding. No subscription fees. Full automation included.
            </p>
          </div>
          <div className="z-10 flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
              <div className="mb-6 text-sm text-neutral-300">Message Analytics</div>
              <div className="h-40 rounded-xl bg-neutral-800/80" />
              <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs">
                {[
                  { label: "Sent", value: "12,450" },
                  { label: "Delivered", value: "12,000" },
                  { label: "Active Numbers", value: "325" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
                    <div className="text-lg font-semibold text-neutral-100">{s.value}</div>
                    <div className="text-neutral-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h3 className="mb-8 text-center text-sm font-medium text-neutral-400">
            Seamless Integration with Your Favorite Tools
          </h3>
          <div className="grid grid-cols-2 gap-4 opacity-80 sm:grid-cols-3 md:grid-cols-6">
            {["Shopify", "WooCommerce", "Zapier", "Google Sheets", "HubSpot", "Zoho CRM"].map(
              (name) => (
                <div
                  key={name}
                  className="flex h-20 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs text-neutral-300"
                >
                  {name}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Smart Features Designed for Your Success</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-300">
              Powerful tools crafted to simplify tasks and elevate everyday experiences.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
              >
                <div className="mb-2 text-base font-medium text-neutral-100">{f.title}</div>
                <p className="text-sm text-neutral-300">{f.desc}</p>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Industries We Empower with WhatsApp Solutions</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-300">
              We help diverse industries leverage WhatsApp to build stronger customer connections, streamline communication, and drive growth effortlessly.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((ind) => (
              <div key={ind.title} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                <div className="mb-2 text-base font-semibold">{ind.title}</div>
                <p className="text-sm text-neutral-300">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Why Businesses Choose WA‑API</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-300">
              Real stories. Real results.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure key={i} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                <blockquote className="text-sm text-neutral-200">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-xs text-neutral-400">— {t.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Got Questions? We’ve Got Answers.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-300">
              We’ve compiled clear answers on setup, pricing, automation, and broadcasts—so you can start with confidence.
            </p>
          </div>
          <div className="mx-auto max-w-3xl divide-y divide-neutral-800 rounded-2xl border border-neutral-800">
            {faqs.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left hover:bg-neutral-900/60"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-sm font-medium text-neutral-200">{item.q}</div>
                    {openFaq === idx && (
                      <p className="mt-2 text-sm text-neutral-300">{item.a}</p>
                    )}
                  </div>
                  <span className="select-none text-xl leading-none text-neutral-500">
                    {openFaq === idx ? "–" : "+"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="border-b border-neutral-900">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold md:text-3xl">Try It Free. Scale When You’re Ready.</h3>
            <p className="mt-3 max-w-xl text-sm text-neutral-300">
              Get instant access to WhatsApp broadcasts, automation, and two‑way chat. Start free today—no subscriptions or hidden fees.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#"
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
              >
                Get Started Free
              </a>
              <Link
                href="https://play.google.com/store/apps/details?id=com.ara.chatflow"
                target="_blank"
                className="rounded-2xl border border-neutral-700 bg-neutral-900 px-5 py-3 text-sm text-neutral-200 hover:border-neutral-600"
              >
                Download Android App
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              {[
                { label: "Campaigns Sent", value: "1.2M+" },
                { label: "Avg. Delivery", value: "96%" },
                { label: "Avg. Response", value: "32%" },
                { label: "Active Users", value: "25k+" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="text-xl font-semibold text-neutral-100">{s.value}</div>
                  <div className="text-neutral-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
