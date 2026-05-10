type UsefulLinkCardProps = {
  name: string;
  url: string;
  description: string;
};

function ExternalLinkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function UsefulLinkCard({ name, url, description }: UsefulLinkCardProps) {
  const domain = getDomain(url);
  const logoUrl = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-[var(--radius-lg)] border bg-[var(--bg-elevated)] p-6 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              className="h-10 w-10 rounded-[var(--radius-sm)] flex-shrink-0"
              style={{
                background: "var(--bg-sunken)",
                objectFit: "contain",
                padding: "4px",
              }}
            />
          )}
          <h3 className="text-lg font-semibold" style={{ color: "var(--fg-1)" }}>
            {name}
          </h3>
        </div>
        <span style={{ color: "var(--fg-3)" }} aria-hidden="true">
          <ExternalLinkIcon />
        </span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--fg-2)" }}>
        {description}
      </p>
    </a>
  );
}
