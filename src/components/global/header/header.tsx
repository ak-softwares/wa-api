"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ThemeToggle } from "./themeToggle"
import { Menu, X } from "lucide-react"

export default function Header() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  const href = session ? "/dashboard" : "/auth/login"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/30">
            <span className="text-xl">💬</span>
          </div>
          <span className="font-semibold tracking-tight text-foreground">
            wa-api.me
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="#features" className="hover:text-foreground">Features</Link>
          <Link href="#industries" className="hover:text-foreground">Industries</Link>
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/contact" className="hover:text-foreground">Contact us</Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Desktop buttons */}
            <Link
              href="https://play.google.com/store/apps/details?id=com.ara.chatflow"
              target="_blank"
              className="rounded-xl border border-border px-4 py-2 text-center md:inline-block hidden"
            >
              Get the Android App
            </Link>
          <Link
            href={href}
            className="min-w-20 text-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 md:inline-block"
          >
            Login
          </Link>

          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center justify-center rounded-xl border border-border p-2 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-4 px-4 py-4 text-sm">
            <Link href="#features" onClick={() => setOpen(false)}>Features</Link>
            <Link href="#industries" onClick={() => setOpen(false)}>Industries</Link>
            <Link href="/pricing" onClick={() => setOpen(false)}>Pricing</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>Contact us</Link>

            <Link
              href="https://play.google.com/store/apps/details?id=com.ara.chatflow"
              target="_blank"
              className="rounded-xl border border-border px-4 py-2 text-center"
            >
              Get the Android App
            </Link>

            <Link
              href={href}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-center font-medium text-white"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
