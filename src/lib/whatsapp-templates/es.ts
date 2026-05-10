import type { WhatsAppTemplateInput } from "../whatsapp";

export function renderEs(i: WhatsAppTemplateInput): string {
  const fmt = (d: Date) => d.toLocaleDateString("es-ES");
  const lines = [
    `Hola! Solicitud para «${i.vehicleTitle}» del ${fmt(i.checkIn)} al ${fmt(i.checkOut)} (${i.guests} personas).`,
    `Mi nombre: ${i.customerName} · Email: ${i.customerEmail} · Tel: ${i.customerPhone}.`,
  ];
  if (i.message && i.message.trim().length > 0) lines.push(i.message.trim());
  return lines.join("\n");
}
