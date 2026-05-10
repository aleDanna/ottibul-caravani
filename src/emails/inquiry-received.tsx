import { Heading, Section, Text, Link } from "@react-email/components";
import { EmailLayout } from "./components/Layout";

export type InquiryEmailProps = {
  vehicleTitle: string;
  vehicleAdminUrl: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message?: string;
  inquiryId: string;
};

export default function InquiryReceivedEmail(props: InquiryEmailProps) {
  return (
    <EmailLayout>
      <Heading as="h2">Nueva solicitud: {props.vehicleTitle}</Heading>
      <Section>
        <Text>
          <strong>Cliente:</strong> {props.customerName}
        </Text>
        <Text>
          <strong>Email:</strong>{" "}
          <Link href={`mailto:${props.customerEmail}`}>{props.customerEmail}</Link>
        </Text>
        <Text>
          <strong>Teléfono:</strong>{" "}
          <Link href={`tel:${props.customerPhone}`}>{props.customerPhone}</Link>
        </Text>
        <Text>
          <strong>Fechas:</strong> {props.checkIn} → {props.checkOut}
        </Text>
        <Text>
          <strong>Personas:</strong> {props.guests}
        </Text>
        {props.message && (
          <Text>
            <strong>Mensaje:</strong> {props.message}
          </Text>
        )}
      </Section>
      <Section>
        <Link
          href={props.vehicleAdminUrl}
          style={{
            background: "#000",
            color: "#fff",
            padding: "10px 16px",
            textDecoration: "none",
          }}
        >
          Abrir en admin
        </Link>
      </Section>
      <Text style={{ fontSize: "11px", color: "#888" }}>ID: {props.inquiryId}</Text>
    </EmailLayout>
  );
}
