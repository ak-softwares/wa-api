"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function ContactPage() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general"
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    // Reset form after submission
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      category: "general"
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const contactMethods = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Call Us",
      description: "Speak directly with our support team",
      value: "+91 8077030731",
      action: "tel:+918077030731",
      color: "bg-blue-50 text-blue-600 border-blue-200",
      buttonText: "Make a Call",
      type: "phone"
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "WhatsApp",
      description: "Instant messaging support",
      value: "+91 8077030731",
      action: "https://wa.me/918077030731",
      color: "bg-green-50 text-green-600 border-green-200",
      buttonText: "Chat on WhatsApp",
      type: "whatsapp"
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email Us",
      description: "Send us an email anytime",
      value: "support@wa-api.me",
      action: "mailto:support@wa-api.me",
      color: "bg-purple-50 text-purple-600 border-purple-200",
      buttonText: "Send Email",
      type: "email"
    }
  ]

  const supportCategories = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing & Refunds" },
    { value: "sales", label: "Sales & Enterprise" },
    { value: "api", label: "API & Integration" },
    { value: "feedback", label: "Feedback & Suggestions" }
  ]

  const faqs = [
    {
      question: "What are your support hours?",
      answer: "Our support team is available Monday to Friday, 9:00 AM to 6:00 PM IST (Indian Standard Time). WhatsApp and email support may have extended hours for urgent issues."
    },
    {
      question: "How quickly can I expect a response?",
      answer: "WhatsApp and phone calls are typically answered immediately during business hours. Email responses are usually within 4-6 hours during business days."
    },
    {
      question: "Do you offer technical support for API integration?",
      answer: "Yes! We provide comprehensive technical support for API integration. For complex integrations, we recommend scheduling a call with our technical team."
    },
    {
      question: "Can I get help with my WhatsApp Business API setup?",
      answer: "Absolutely. We assist with WhatsApp Business API setup, template approval, and integration with our platform. Contact our technical support team for assistance."
    }
  ]

  const businessHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM IST" },
    { day: "Saturday", hours: "10:00 AM - 2:00 PM IST" },
    { day: "Sunday", hours: "Emergency Support Only" }
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            24/7 Support Available
          </div>
          <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            We're Here to Help
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-muted-foreground">
            Get in touch with our support team through WhatsApp, phone, or email. We're ready to assist you with any questions about WA-API.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/918077030731"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-400"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
              </svg>
              Chat on WhatsApp
            </a>
            <a
              href="tel:+918077030731"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-6 py-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call +91 8077030731
            </a>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">Multiple Ways to Connect</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Choose your preferred method to get in touch with our support team
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {contactMethods.map((method, index) => (
              <div key={index} className="rounded-2xl border border-border bg-card p-8">
                <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full ${method.color.split(' ')[0]} ${method.color.split(' ')[2]}`}>
                  {method.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{method.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{method.description}</p>
                <div className="mb-6 rounded-lg bg-muted p-4">
                  <div className="text-sm font-medium">{method.value}</div>
                </div>
                <a
                  href={method.action}
                  target={method.type === "whatsapp" || method.type === "email" ? "_blank" : "_self"}
                  rel={method.type === "whatsapp" ? "noopener noreferrer" : ""}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    method.type === "whatsapp" 
                      ? "bg-green-500 text-white hover:bg-green-600" 
                      : method.type === "phone"
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                >
                  {method.type === "whatsapp" && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                    </svg>
                  )}
                  {method.type === "phone" && (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                  {method.type === "email" && (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {method.buttonText}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="border-b border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-semibold">Send us a Message</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium">
                    Inquiry Type *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {supportCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Please describe your inquiry in detail..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Business Hours & FAQ */}
            <div className="space-y-8">
              {/* Business Hours */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <h3 className="mb-6 text-xl font-semibold">Business Hours</h3>
                <div className="space-y-4">
                  {businessHours.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                      <span className="text-sm font-medium">{schedule.day}</span>
                      <span className="text-sm text-muted-foreground">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">
                    <strong>Emergency Support:</strong> Available 24/7 for critical issues affecting your WhatsApp messaging services.
                  </p>
                </div>
              </div>

              {/* FAQ */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <h3 className="mb-6 text-xl font-semibold">Quick Answers</h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <h4 className="mb-2 font-medium">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-500 hover:underline"
                  >
                    View all FAQs
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before Contacting */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8">
            <h2 className="mb-6 text-2xl font-semibold text-emerald-800">Before Contacting Us</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-4 font-medium text-emerald-700">For Faster Support:</h3>
                <ul className="space-y-3 text-sm text-emerald-700">
                  <li className="flex items-start gap-3">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Have your account email ready</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>For billing issues, have your transaction ID</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Check our documentation and FAQ first</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-medium text-emerald-700">Useful Links:</h3>
                <div className="space-y-2 text-sm">
                  <Link href="/faq" className="block text-emerald-600 hover:underline">Frequently Asked Questions</Link>
                  <Link href="/documentation" className="block text-emerald-600 hover:underline">API Documentation</Link>
                  <Link href="/pricing" className="block text-emerald-600 hover:underline">Pricing & Plans</Link>
                  <Link href="/refund" className="block text-emerald-600 hover:underline">Refund Policy</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-50/50 to-background p-12">
            <h2 className="text-2xl font-semibold md:text-3xl">Still Have Questions?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Don't hesitate to reach out. Our team is here to help you succeed with WA-API.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="https://wa.me/918077030731"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                </svg>
                Chat on WhatsApp Now
              </a>
              <a
                href="tel:+918077030731"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 py-3 font-semibold transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call +91 8077030731
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}