"use client";

import Link from "next/link";

const Footer: React.FC = () => {
  return (
      <footer className="py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-xs text-neutral-400">
              © 2025 AraGroup of Companies. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-400">
              <a href="#features" className="hover:text-neutral-200">Features</a>
              <a href="#industries" className="hover:text-neutral-200">Industries</a>
              <a href="#faq" className="hover:text-neutral-200">FAQ</a>
              <Link
                href="https://play.google.com/store/apps/details?id=com.ara.chatflow"
                target="_blank"
                className="hover:text-neutral-200"
              >
                Android App
              </Link>
            </div>
          </div>
        </div>
      </footer>
  );
};

export default Footer;
