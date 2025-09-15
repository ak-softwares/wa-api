import * as React from "react";

interface BaseEmailProps {
  firstName?: string;
  children: React.ReactNode; // 👈 You can pass custom elements here
}

export function BaseEmailTemplate({ firstName, children }: BaseEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f9fafb",
        padding: "40px 20px",
        color: "#111827",
      }}
    >
      {/* Card */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <p style={{ fontSize: "15px", marginBottom: "16px", color: "#111827" }}>
          Hello {firstName ?? ''},
        </p>

        {/* 👇 Custom Content Injected */}
        <div>{children}</div>

        {/* Footer */}
        <hr style={{ margin: "30px 0", borderColor: "#e5e7eb" }} />
        <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center" }}>
          © {new Date().getFullYear()} wa-api.me · All rights reserved.
        </p>
      </div> 
    </div>
  );
}
