"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";

type NavItem = { href: string; label: string };

export function MobileMenu({
  items,
  currentLocale,
}: {
  items: NavItem[];
  currentLocale: Locale;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const panel = (
    <div
      className="fixed inset-x-0 bottom-0 top-[72px] z-[60] flex flex-col"
      style={{ background: "var(--bg-page)" }}
      role="dialog"
      aria-modal="true"
    >
      <nav className="flex flex-1 flex-col gap-1 px-5 pt-6">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="rounded-md py-3 text-2xl"
            style={{
              color: "var(--fg-1)",
              fontFamily: "var(--font-serif)",
            }}
            onClick={() => setOpen(false)}
          >
            {it.label}
          </Link>
        ))}
      </nav>
      <div
        className="border-t px-5 py-5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <LanguageSwitcher currentLocale={currentLocale} />
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-md"
        style={{ color: "var(--fg-1)" }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {mounted && open ? createPortal(panel, document.body) : null}
    </>
  );
}
