import { Html, Head, Body, Container, Heading, Hr } from "@react-email/components";
import type { ReactNode } from "react";

export function EmailLayout({ children }: { children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#f6f6f6", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ background: "#fff", padding: "24px", maxWidth: "600px" }}>
          <Heading as="h1" style={{ fontSize: "20px" }}>
            Otti Bull
          </Heading>
          <Hr />
          {children}
        </Container>
      </Body>
    </Html>
  );
}
