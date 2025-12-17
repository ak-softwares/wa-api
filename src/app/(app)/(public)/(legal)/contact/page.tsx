'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <Card className="shadow-md dark:bg-card">
        <CardHeader>
          <CardTitle className="text-2xl">Contact Us — WA-API</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <h2>Get in Touch</h2>
          <p>
            We’re here to help! If you have questions about WA-API, need support,
            or want to discuss integrations, feel free to reach out using any of
            the methods below.
          </p>

          <h2>Contact Details</h2>

          <ul className="space-y-2">
            <li>
              <strong>📞 Call:</strong>{' '}
              <a
                href="tel:+918077030731"
                className="text-primary underline"
              >
                +91 8077030731
              </a>
            </li>

            <li>
              <strong>💬 WhatsApp:</strong>{' '}
              <a
                href="https://wa.me/918077030731"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Chat on WhatsApp
              </a>
            </li>

            <li>
              <strong>📧 Email:</strong>{' '}
              <a
                href="mailto:waapi.me@gmail.com"
                className="text-primary underline"
              >
                waapi.me@gmail.com
              </a>
            </li>
          </ul>

          <h2>Support Hours</h2>
          <p>
            Our team typically responds within 24 hours on business days.
            WhatsApp support may be faster for urgent issues.
          </p>

          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
