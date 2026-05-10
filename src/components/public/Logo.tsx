type LogoVariant = "color" | "light" | "mark";

const SRC: Record<LogoVariant, string> = {
  color: "/logo-ottibull.svg",
  light: "/logo-ottibull-light.svg",
  mark: "/favicon.svg",
};

export function Logo({
  variant = "color",
  className,
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={SRC[variant]} alt="Otti Bull" className={className} />;
}
