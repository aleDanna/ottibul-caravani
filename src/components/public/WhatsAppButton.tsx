export function WhatsAppButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-[var(--radius-sm)] px-6 py-3 font-semibold text-white"
      style={{ background: "#25D366" }}
    >
      {label}
    </a>
  );
}
