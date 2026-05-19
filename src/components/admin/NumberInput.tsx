"use client";

import { useState } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number | null | undefined;
  onChange: (n: number | null) => void;
  /** Value emitted when the user clears the field. Defaults to null. */
  emptyValue?: number | null;
};

// A number input that holds the textual representation locally so the user can
// freely clear the field even when the bound value is 0. The parent state is
// updated on every keystroke (number or null).
export function NumberInput({ value, onChange, emptyValue = null, ...rest }: Props) {
  const [text, setText] = useState(() => (value == null || value === 0 ? "" : String(value)));

  return (
    <input
      {...rest}
      type="number"
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw === "") {
          onChange(emptyValue);
          return;
        }
        const n = Number(raw);
        if (!Number.isNaN(n)) onChange(n);
      }}
    />
  );
}
