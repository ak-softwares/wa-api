import Link from "next/link"

export default function ChildSafetyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Child Safety Standards
          </div>
          <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            Child Safety & CSAE Prevention Standards
          </h1>
          <p className="max-w-4xl text-lg text-muted-foreground">
            WA-API has a zero-tolerance policy for child sexual abuse and exploitation (CSAE) and child sexual abuse
            material (CSAM). This page describes our published standards, reporting process, and dedicated contact
            details for child safety compliance.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="mb-4 text-2xl font-semibold">Our Safety Standards</h2>
            <p className="mb-4 text-muted-foreground">
              We prohibit any content, behavior, or activity involving the sexual abuse or exploitation of children.
              Accounts found engaging in these activities are immediately suspended and, where required, reported to
              relevant authorities.
            </p>
            <ul className="ml-6 space-y-2 text-muted-foreground">
              <li className="list-disc">Zero tolerance for CSAM, grooming, and any sexual exploitation of minors.</li>
              <li className="list-disc">Proactive moderation, abuse detection, and policy enforcement workflows.</li>
              <li className="list-disc">Immediate account action (restriction, suspension, or permanent removal) for violations.</li>
              <li className="list-disc">Cooperation with law enforcement and child safety organizations where legally required.</li>
              <li className="list-disc">User reporting channels for fast review and escalation of suspected abuse.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="mb-3 text-2xl font-semibold">Designated Child Safety Contact</h2>
            <p className="mb-6 text-muted-foreground">
              Our designated point of contact is trained to discuss CSAM prevention practices, compliance controls, and
              safety incident response for WA-API.
            </p>
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Team:</span> Child Safety & Trust Operations
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a href="mailto:childsafety@wa-api.me" className="text-emerald-600 hover:underline">
                  childsafety@wa-api.me
                </a>
              </p>
              <p>
                <span className="font-medium">Support Email:</span>{" "}
                <a href="mailto:support@wa-api.me" className="text-emerald-600 hover:underline">
                  support@wa-api.me
                </a>
              </p>
              <p>
                <span className="font-medium">Emergency Contact:</span>{" "}
                <a href="tel:+918077030731" className="text-emerald-600 hover:underline">
                  +91 8077030731
                </a>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="mb-3 text-2xl font-semibold">How to Report</h2>
            <p className="mb-4 text-muted-foreground">
              If you encounter suspected child exploitation content or behavior, please report it immediately with as
              much context as possible (account ID, timestamps, and relevant message details).
            </p>
            <ol className="ml-6 space-y-2 text-muted-foreground">
              <li className="list-decimal">Email our safety team at childsafety@wa-api.me.</li>
              <li className="list-decimal">Include links, screenshots, and a short description.</li>
              <li className="list-decimal">Do not redistribute harmful content beyond what is necessary for reporting.</li>
              <li className="list-decimal">For immediate threats, contact local law enforcement first.</li>
            </ol>
            <div className="mt-6">
              <Link href="/contact" className="inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
