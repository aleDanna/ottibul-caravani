import Image from "next/image";
import { Container } from "./Container";

export function HomePackSalida() {
  return (
    <section id="pack-salida" className="py-16 md:py-24" style={{ background: "var(--bg-page)" }}>
      <Container>
        <div className="mx-auto max-w-xl">
          <Image
            src="/pack-salida.jpg"
            alt="Pack salida: parking gratuito, ropa de cama, menaje y vajilla, mobiliario exterior, consumibles, horarios flexibles y limpieza incluidos"
            width={1240}
            height={1748}
            sizes="(max-width: 768px) 100vw, 600px"
            className="h-auto w-full rounded-[var(--radius-xl)]"
          />
        </div>
      </Container>
    </section>
  );
}
