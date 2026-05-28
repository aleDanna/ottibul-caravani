"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";

const STORAGE_KEY = "ottibull-cookie-consent-v1";

type ConsentValue = "granted" | "denied";

function setGtagConsent(value: ConsentValue) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["consent", "update", {
    analytics_storage: value,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  }]);
}

function subscribeToStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function getConsentSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

function getConsentServerSnapshot() {
  return null;
}

export function ConsentBanner({ locale }: { locale: Locale }) {
  const t = useTranslations("cookieConsent");
  const stored = useSyncExternalStore(
    subscribeToStorage,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  // Replay granted consent on mount/hydration (e.g. returning visitor)
  useEffect(() => {
    if (stored === "granted") {
      setGtagConsent("granted");
    }
  }, [stored]);

  const visible = stored === null;

  if (!visible) return null;

  const decide = (value: ConsentValue) => {
    localStorage.setItem(STORAGE_KEY, value);
    setGtagConsent(value);
    // The storage event only fires in OTHER browsing contexts; dispatch a synthetic
    // one so useSyncExternalStore subscribers are notified in the same tab.
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: value }));
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("title")}
      className="fixed bottom-4 right-4 left-4 z-50 max-w-md rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-lg)] sm:left-auto sm:bottom-6 sm:right-6"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
    >
      <h2 className="text-base font-semibold" style={{ color: "var(--fg-1)" }}>
        {t("title")}
      </h2>
      <p className="mt-2 text-sm" style={{ color: "var(--fg-3)" }}>
        {t("body")}{" "}
        <Link href={`/${locale}/cookies`} className="underline">
          {t("privacyLink")}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold"
          style={{ background: "var(--brand)", color: "var(--fg-on-dark)" }}
        >
          {t("accept")}
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold"
          style={{
            background: "transparent",
            color: "var(--fg-2)",
            border: "1px solid var(--border-default)",
          }}
        >
          {t("reject")}
        </button>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}
