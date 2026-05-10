export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-10 ${align === "center" ? "text-center" : ""}`}>
      {eyebrow && (
        <p
          className="mb-2 text-xs font-semibold uppercase"
          style={{ letterSpacing: "var(--tracking-caps)", color: "var(--fg-3)" }}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="text-4xl md:text-5xl">{title}</h2>
      {subtitle && (
        <p
          className={`mt-3 text-lg ${align === "center" ? "mx-auto max-w-2xl" : ""}`}
          style={{ color: "var(--fg-2)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
