"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initial: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input name="email" type="email" required className="w-full border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Contraseña</label>
        <input name="password" type="password" required className="w-full border p-2" />
      </div>
      {state.error && <p className="text-red-600">{state.error}</p>}
      <SubmitBtn />
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-black py-2 text-white">
      {pending ? "…" : "Acceder"}
    </button>
  );
}
