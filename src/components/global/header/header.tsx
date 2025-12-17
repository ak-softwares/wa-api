"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { ThemeToggle } from "./themeToggle"

export default function Header() {
  const { data: session } = useSession()

  const href = session ? "/dashboard" : "/auth/login";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/30">
            <span className="text-xl">💬</span>
          </div>
          <span className="font-semibold tracking-tight text-foreground hover:text-foreground/80">
            wa-api.me
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#industries" className="transition-colors hover:text-foreground">
            Industries
          </Link>
          <Link href="#testimonials" className="transition-colors hover:text-foreground">
            Testimonials
          </Link>
          <Link href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link href="/contact" className="transition-colors hover:text-foreground">
            Contact us
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="https://play.google.com/store/apps/details?id=com.ara.chatflow"
            target="_blank"
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Get the Android App
          </Link>
          <Link
            href={href}
            className="hidden rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-400 md:inline-block"
          >
            Get Started Free
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
