"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { submitInquiryAction, type InquiryState } from "@/app/actions/inquiries";
import { COUNTRY_OPTIONS } from "@/lib/countries";

const initial: InquiryState = {};

export function InquiryForm({
  vehicleId,
  locale,
}: {
  vehicleId: string;
  locale: Locale;
}) {
  const [state, action] = useActionState(submitInquiryAction, initial);
  const t = useTranslations("form");
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const [checkInValue, setCheckInValue] = useState("");
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);
  const checkOutMin = checkInValue
    ? (() => {
        const [y, m, day] = checkInValue.split("-").map(Number);
        return new Date(Date.UTC(y, m - 1, day + 1)).toISOString().slice(0, 10);
      })()
    : minDate;
  const inputClass =
    "mt-1 w-full rounded-[var(--radius-sm)] border p-2 text-sm";
  const inputStyle: React.CSSProperties = {
    borderColor: "var(--border-default)",
    background: "var(--bianco)",
  };

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="hidden" name="locale" value={locale} />
      <input
        type="text"
        name="websiteUrl"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div>
        <label className="block text-sm font-medium">{t("name")}</label>
        <input name="name" type="text" required className={inputClass} style={inputStyle} />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs" style={{ color: "var(--terra-700)" }}>{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">{t("email")}</label>
        <input name="email" type="email" required className={inputClass} style={inputStyle} />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs" style={{ color: "var(--terra-700)" }}>{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">{t("phone")}</label>
        <div className="mt-1 flex gap-2">
          <select
            name="phoneCountry"
            defaultValue="ES"
            aria-label="Country code"
            className={`${inputClass} mt-0 flex-shrink-0`}
            style={{ ...inputStyle, width: "auto" }}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.nativeName} ({c.dialCode})
              </option>
            ))}
          </select>
          <input
            name="phone"
            type="tel"
            required
            className={`${inputClass} mt-0 min-w-0 flex-1`}
            style={inputStyle}
          />
        </div>
        {state.fieldErrors?.phone && (
          <p className="mt-1 text-xs" style={{ color: "var(--terra-700)" }}>{state.fieldErrors.phone}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">{t("checkIn")}</label>
          <input
            name="checkIn"
            type="date"
            required
            min={minDate}
            onChange={(e) => setCheckInValue(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
          {state.fieldErrors?.checkIn && (
            <p className="mt-1 text-xs" style={{ color: "var(--terra-700)" }}>{state.fieldErrors.checkIn}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">{t("checkOut")}</label>
          <input name="checkOut" type="date" required min={checkOutMin} className={inputClass} style={inputStyle} />
          {state.fieldErrors?.checkOut && (
            <p className="mt-1 text-xs" style={{ color: "var(--terra-700)" }}>{state.fieldErrors.checkOut}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">{t("guests")}</label>
        <input
          name="guests"
          type="number"
          min={1}
          max={20}
          required
          defaultValue={2}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">{t("message")}</label>
        <textarea name="message" rows={3} className={inputClass} style={inputStyle} />
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span style={{ color: "var(--fg-2)" }}>{t("consent")}</span>
      </label>

      {state.error && (
        <p className="text-sm" style={{ color: "var(--terra-700)" }}>{state.error}</p>
      )}
      <Submit label={t("submit")} />
    </form>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[var(--radius-sm)] py-2.5 text-white"
      style={{ background: "var(--brand)" }}
    >
      {pending ? "…" : label}
    </button>
  );
}
