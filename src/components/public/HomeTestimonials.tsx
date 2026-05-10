import { useTranslations } from "next-intl";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

type Testimonial = {
  initials: string;
  name: string;
  city: string;
  quote: string;
};

const TONES = [
  { background: "var(--crema-100)", avatarBg: "var(--bosco-200, #C9DBC8)", avatarFg: "var(--bosco-900)" },
  { background: "var(--bosco-100)", avatarBg: "var(--terra-300)", avatarFg: "var(--terra-700)" },
];

export function HomeTestimonials() {
  const t = useTranslations("home");
  const items = t.raw("testimonials") as Testimonial[];

  return (
    <section className="py-16 md:py-24" style={{ background: "var(--bg-page)" }}>
      <Container>
        <SectionHeading
          eyebrow={t("testimonialsEyebrow")}
          title={t("testimonialsTitle")}
          subtitle={t("testimonialsSubtitle")}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {items.map((tEntry, i) => {
            const tone = TONES[i] ?? TONES[0];
            return (
              <div
                key={tEntry.name}
                className="rounded-[var(--radius-xl)] p-8 md:p-10"
                style={{ background: tone.background }}
              >
                <blockquote
                  className="text-2xl italic leading-snug md:text-3xl"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "var(--fg-1)",
                    textWrap: "pretty",
                  }}
                >
                  &ldquo;{tEntry.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: tone.avatarBg, color: tone.avatarFg }}
                    aria-hidden="true"
                  >
                    {tEntry.initials}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: "var(--fg-1)" }}>
                      {tEntry.name}
                    </div>
                    <div className="text-sm" style={{ color: "var(--fg-3)" }}>
                      {tEntry.city}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
