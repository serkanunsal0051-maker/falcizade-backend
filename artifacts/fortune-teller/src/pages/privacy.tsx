export default function Privacy() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(170deg, #1c0840 0%, #150930 30%, #0e0622 60%, #090318 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 64px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#fbbf24",
            textShadow: "0 0 24px rgba(251,191,36,0.55)",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Privacy Policy
        </h1>

        <div
          style={{
            width: 80,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.50), transparent)",
            margin: "0 auto 32px",
          }}
        />

        <div
          style={{
            background: "linear-gradient(145deg, rgba(34,10,72,0.92) 0%, rgba(20,6,44,0.88) 100%)",
            border: "1px solid rgba(251,191,36,0.28)",
            borderRadius: 20,
            padding: "28px 24px",
            boxShadow: "0 0 32px rgba(109,40,217,0.20), 0 8px 28px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.40), transparent)",
              marginBottom: 20,
            }}
          />

          <p style={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.75, fontSize: 14, margin: "0 0 16px" }}>
            This application uses <strong style={{ color: "#fbbf24" }}>Google AdMob</strong> to display ads.
            AdMob may collect device identifiers and usage data to provide personalized ads.
          </p>

          <p style={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.75, fontSize: 14, margin: "0 0 16px" }}>
            This app does not collect or store personal user data.
          </p>

          <p style={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.75, fontSize: 14, margin: "0 0 24px" }}>
            <strong style={{ color: "#fbbf24" }}>Google Privacy Policy:</strong>{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#a78bfa", textDecoration: "underline", wordBreak: "break-all" }}
            >
              https://policies.google.com/privacy
            </a>
          </p>

          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.20), transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
