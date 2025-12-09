import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          
          <p className="text-xs text-muted-foreground">
            © 2025 WA-API of Companies. All rights reserved.
          </p>

          {/* Center Section */}
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms & Conditions
            </Link>
            <Link
              href="http://localhost:3000/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </nav>

          {/* Right Section */}
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="#features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#industries" className="transition-colors hover:text-foreground">
              Industries
            </Link>
            <Link href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
            <Link
              href="https://play.google.com/store/apps/details?id=com.ara.chatflow"
              target="_blank"
              className="transition-colors hover:text-foreground"
            >
              Android App
            </Link>
          </nav>

        </div>
      </div>
    </footer>
  )
}
