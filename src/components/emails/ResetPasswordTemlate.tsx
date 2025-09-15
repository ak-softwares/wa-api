import * as React from "react";

interface ResetPasswordElementProps {
  resetLink: string;
}

export function ResetPasswordElement({ resetLink }: ResetPasswordElementProps) {
  return (
    <div>
      <p style={{ fontSize: "15px", marginBottom: "20px" }}>
        We received a request to reset your password for your{" "}
        <strong>wa-api.me</strong> account.
      </p>

      {/* CTA Button */}
      <a
        href={resetLink}
        style={{
          display: "inline-block",
          padding: "12px 20px",
          fontSize: "15px",
          color: "#ffffff",
          backgroundColor: "#2563eb",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        Reset Password
      </a>

      <p style={{ fontSize: "14px", marginTop: "20px", color: "#6b7280" }}>
        If you didn’t request this, you can safely ignore this email.
      </p>
    </div>
  );
}
