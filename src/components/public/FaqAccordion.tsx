"use client";

import { useState } from "react";

type FaqItem = { id: string; question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  return (
    <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
      {items.map((it) => {
        const isOpen = openId === it.id;
        return (
          <div key={it.id} style={{ borderColor: "var(--border-subtle)" }}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : it.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between py-5 text-left"
            >
              <span className="text-lg font-medium">{it.question}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{
                  transition: "transform 200ms var(--ease-out)",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {isOpen && (
              <p
                className="pb-5 text-base"
                style={{ color: "var(--fg-2)", lineHeight: "var(--lh-base)" }}
              >
                {it.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
