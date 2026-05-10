import { Resend } from "resend";
import pRetry from "p-retry";
import { render } from "@react-email/render";
import InquiryReceivedEmail, { type InquiryEmailProps } from "@/emails/inquiry-received";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendInquiryEmail(props: InquiryEmailProps & { customerEmail: string }) {
  const html = await render(<InquiryReceivedEmail {...props} />);
  const from = process.env.EMAIL_FROM ?? "noreply@example.com";
  const to = process.env.OWNER_EMAIL ?? "owner@example.com";

  if (!resend) {
    // Dev / no Resend key: log instead of sending. Lets the rest of the
    // inquiry flow work locally without a real provider.
    console.log("[email] Resend not configured; would send", {
      from,
      to,
      subject: `Nueva solicitud: ${props.vehicleTitle} · ${props.customerName}`,
      inquiryId: props.inquiryId,
    });
    return { id: `dev-${props.inquiryId}` };
  }

  return pRetry(
    async () =>
      resend.emails.send({
        from,
        to,
        replyTo: props.customerEmail,
        subject: `Nueva solicitud: ${props.vehicleTitle} · ${props.customerName}`,
        html,
        headers: { "X-Inquiry-Id": props.inquiryId },
      }),
    { retries: 3, minTimeout: 500, factor: 2 },
  );
}
