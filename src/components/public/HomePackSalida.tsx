import { useTranslations } from "next-intl";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

type Tone = "bosco" | "sole" | "cielo" | "terra";
type PackIconName =
  | "parking"
  | "bed"
  | "utensils"
  | "table"
  | "propane"
  | "clock"
  | "spray";

type PackItem = {
  tone: Tone;
  icon: PackIconName;
  title: string;
  body: string;
};

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  bosco: { bg: "var(--bosco-100)", fg: "var(--bosco-800)" },
  sole: { bg: "var(--sole-100)", fg: "var(--sole-900, #6E4A09)" },
  cielo: { bg: "var(--cielo-100)", fg: "var(--cielo-700)" },
  terra: { bg: "var(--terra-100)", fg: "var(--terra-700)" },
};

function PackIcon({ name }: { name: PackIconName }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "parking":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M10 17V7h3a3 3 0 0 1 0 6h-3" />
        </svg>
      );
    case "bed":
      return (
        <svg {...common}>
          <path d="M3 20v-8" />
          <path d="M21 20v-5a3 3 0 0 0-3-3H3" />
          <path d="M3 16h18" />
          <circle cx="7.5" cy="11.5" r="2" />
        </svg>
      );
    case "utensils":
      return (
        <svg {...common}>
          <path d="M5 2v8a2 2 0 0 0 2 2v10" />
          <path d="M9 2v8a2 2 0 0 1-2 2" />
          <path d="M15 22V11a4 4 0 0 1 4-4V2" />
          <path d="M19 7v15" />
        </svg>
      );
    case "table":
      return (
        <svg {...common}>
          <path d="M3 9h18" />
          <path d="M5 9v3" />
          <path d="M19 9v3" />
          <path d="M7 12v8" />
          <path d="M17 12v8" />
          <path d="M5 12h14" />
        </svg>
      );
    case "propane":
      return (
        <svg {...common}>
          <path d="M8 22V9" />
          <path d="M16 22V9" />
          <path d="M8 9a4 4 0 0 1 8 0" />
          <path d="M10 5V3h4v2" />
          <path d="M8 22h8" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "spray":
      return (
        <svg {...common}>
          <rect x="7" y="10" width="10" height="11" rx="2" />
          <path d="M9 10V6h6v4" />
          <path d="M3 7h3" />
          <path d="M3 4h3" />
          <path d="M3 10h3" />
        </svg>
      );
  }
}

export function HomePackSalida() {
  const t = useTranslations("home");
  const items = t.raw("packSalidaItems") as PackItem[];

  return (
    <section id="pack-salida" className="py-16 md:py-24" style={{ background: "var(--bg-page)" }}>
      <Container>
        <SectionHeading
          title={t("packSalidaTitle")}
          subtitle={t("packSalidaSubtitle")}
        />
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const tone = TONE_STYLES[item.tone];
            return (
              <div key={item.title} className="flex flex-col gap-4">
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  <PackIcon name={item.icon} />
                </div>
                <div>
                  <h3
                    className="text-sm font-semibold uppercase"
                    style={{
                      letterSpacing: "var(--tracking-caps)",
                      color: "var(--fg-1)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-3)" }}>
                    {item.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p
          className="mx-auto mt-12 max-w-2xl text-center text-sm italic"
          style={{ color: "var(--fg-3)" }}
        >
          {t("packSalidaFooter")}
        </p>
      </Container>
    </section>
  );
}
