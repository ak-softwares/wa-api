'use client';

import { signOut, useSession } from "next-auth/react";
import React from "react";
import Link from "next/link";

function Navbar() {

  const { data: session } = useSession();

  const signOutUser = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur"> 
      {/* Header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/30 grid place-items-center">
              <span className="text-xl">💬</span>
            </div>
            <span className="font-semibold tracking-tight text-neutral-300 hover:text-white">wa-api.me</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex text-sm text-neutral-300">
          <Link href="#features" className="hover:text-white">Features</Link>
          <Link href="#industries" className="hover:text-white">Industries</Link>
          <Link href="#testimonials" className="hover:text-white">Testimonials</Link>
          <Link href="#faq" className="hover:text-white">FAQ</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="https://play.google.com/store/apps/details?id=com.ara.chatflow"
            className="rounded-xl border border-emerald-400/30 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/10"
            target="_blank"
          >
            Get the Android App
          </Link>
          <a
            href="#cta"
            className="hidden rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 md:inline-block"
          >
            Get Started Free
          </a>
          {session ? (
            <button
              onClick={signOutUser}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-black hover:bg-red-400"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/auth/signin">
              <button className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
