import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";

export type VehicleCardData = {
  id: string;
  slug: string;
  type: "camper" | "motorcycle" | "car" | "bicycle" | "boat";
  basePricePerDay: string;
  location: string;
  attributes: Record<string, unknown>;
  translations: { locale: "es" | "ca" | "en"; title: string }[];
  images: { url: string; altText: string | null; isCover: boolean }[];
};

type VehicleCardProps = {
  locale: Locale;
  vehicle: VehicleCardData;
};

const TYPE_ICON_PATHS: Record<VehicleCardData["type"], React.ReactElement> = {
  camper: (
    <>
      <path d="M2 17V6a1 1 0 0 1 1-1h11v12" />
      <path d="M14 9h4l3 4v4h-2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  motorcycle: (
    <>
      <circle cx="6" cy="17" r="4" />
      <circle cx="18" cy="17" r="4" />
      <path d="m6 17 4-9h5l3 9" />
      <path d="M11 6h3" />
    </>
  ),
  car: (
    <>
      <path d="M5 17H3v-4l3-7h12l3 7v4h-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  bicycle: (
    <>
      <circle cx="6" cy="17" r="4" />
      <circle cx="18" cy="17" r="4" />
      <path d="m6 17 4-9h5l3 9" />
      <path d="M11 6h3" />
    </>
  ),
  boat: (
    <>
      <path d="M2 17h20" />
      <path d="M5 12 12 4l7 8" />
      <path d="M5 17V12h14v5" />
    </>
  ),
};

function TypeIcon({ type }: { type: VehicleCardData["type"] }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TYPE_ICON_PATHS[type]}
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0" />
      <circle cx="17" cy="9" r="3" />
      <path d="M22 20a5 5 0 0 0-7-4.6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function pickTitle(
  translations: VehicleCardData["translations"],
  locale: Locale,
  fallbackSlug: string,
) {
  const match = translations.find((t) => t.locale === locale);
  if (match) return match.title;
  const es = translations.find((t) => t.locale === "es");
  if (es) return es.title;
  const any = translations[0];
  return any?.title ?? fallbackSlug;
}

function pickCover(images: VehicleCardData["images"]) {
  if (images.length === 0) return null;
  const cover = images.find((img) => img.isCover);
  return cover ?? images[0];
}

function pickSeats(attributes: Record<string, unknown>): number | null {
  const travel = attributes["travelSeats"];
  if (typeof travel === "number") return travel;
  if (typeof travel === "string" && travel !== "") {
    const n = Number(travel);
    if (!Number.isNaN(n)) return n;
  }
  const seats = attributes["seats"];
  if (typeof seats === "number") return seats;
  if (typeof seats === "string" && seats !== "") {
    const n = Number(seats);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

const TYPE_LABEL_KEY: Record<VehicleCardData["type"], string> = {
  camper: "filterCamper",
  motorcycle: "filterMotorcycle",
  car: "filterCar",
  bicycle: "filterBicycle",
  boat: "filterBoat",
};

export function VehicleCard({ locale, vehicle }: VehicleCardProps) {
  const t = useTranslations("catalog");
  const title = pickTitle(vehicle.translations, locale, vehicle.slug);
  const cover = pickCover(vehicle.images);
  const seats = pickSeats(vehicle.attributes);
  const typeLabel = t(TYPE_LABEL_KEY[vehicle.type]);
  const priceNumber = Number(vehicle.basePricePerDay);
  const priceFormatted = Number.isFinite(priceNumber)
    ? priceNumber.toLocaleString(locale, { maximumFractionDigits: 0 })
    : vehicle.basePricePerDay;
  const fromPrice = t("fromPrice", { price: priceFormatted });

  return (
    <Link
      href={`/${locale}/vehicles/${vehicle.slug}`}
      aria-label={title}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--bg-elevated)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.altText ?? title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--cielo-100), var(--sole-100), var(--crema-100), var(--bosco-100))",
            }}
          />
        )}
      </div>
      <div className="flex flex-col gap-2 p-5">
        <h3 className="text-lg font-semibold" style={{ color: "var(--fg-1)" }}>
          {title}
        </h3>
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
          style={{ color: "var(--fg-3)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <TypeIcon type={vehicle.type} />
            {typeLabel}
          </span>
          {seats !== null && (
            <span className="inline-flex items-center gap-1.5">
              <UsersIcon />
              {seats}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <PinIcon />
            {vehicle.location}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-base font-bold" style={{ color: "var(--fg-1)" }}>
            {fromPrice}
          </span>
        </div>
      </div>
    </Link>
  );
}
