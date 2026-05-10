import { useTranslations } from "next-intl";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

type Tone = "bosco" | "sole" | "cielo" | "terra";
type IconName = "shield" | "headset" | "package" | "calendar";

type WhyEntry = {
  tone: Tone;
  icon: IconName;
  title: string;
  body: string;
};

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  bosco: { bg: "var(--bosco-100)", fg: "var(--bosco-800)" },
  sole: { bg: "var(--sole-100)", fg: "var(--sole-900, #6E4A09)" },
  cielo: { bg: "var(--cielo-100)", fg: "var(--cielo-700)" },
  terra: { bg: "var(--terra-100)", fg: "var(--terra-700)" },
};

function FeatureIcon({ name }: { name: IconName }) {
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
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z" />
        </svg>
      );
    case "headset":
      return (
        <svg {...common}>
          <path d="M4 14a8 8 0 0 1 16 0" />
          <path d="M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z" />
          <path d="M20 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
          <path d="M17 19v1a3 3 0 0 1-3 3h-2" />
        </svg>
      );
    case "package":
      return (
        <svg {...common}>
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
          <path d="M3 8l9 5 9-5" />
          <path d="M12 13v8" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      );
  }
}

export function HomeWhyUs() {
  const t = useTranslations("home");
  const items = t.raw("why") as WhyEntry[];

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--bg-page)" }}>
      <Container>
        <SectionHeading title={t("whyTitle")} subtitle={t("whySubtitle")} />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const tone = TONE_STYLES[item.tone];
            return (
              <div key={item.title} className="flex flex-col gap-4">
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  <FeatureIcon name={item.icon} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--fg-1)" }}>
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
      </Container>
    </section>
  );
}
