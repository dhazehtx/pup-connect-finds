import { BRAND } from "@shared/brand";

export function LegalBlurb({
  variant = "generic",
}: { variant?: "stripe" | "booking" | "generic" }) {
  const copy = {
    stripe:
      `${BRAND.name} is a marketplace. We don't provide pet services or insurance and don't supervise users. By continuing, you accept animal-related risks and agree services are between you and the other party. See our`,
    booking:
      `Services are provided by independent users, not ${BRAND.name}. You assume animal-related risks and agree disputes are between the parties. See our`,
    generic:
      "By continuing, you agree to the",
  }[variant];

  return (
    <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.4, marginTop: 8 }}>
      {copy}{" "}
      <a href="/legal/terms" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
        Terms
      </a>
      {variant === "stripe" && " (release, indemnity, arbitration)"}
      {variant === "generic" ? " of Service" : ""} and{" "}
      <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
        Privacy
      </a>
      {variant === "generic" ? " Policy" : ""}.
    </p>
  );
}
