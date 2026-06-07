export default function Support() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 24px 80px", lineHeight: 1.8 }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Support</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 48 }}>We&apos;re here to help.</p>

      {[
        ["Contact us", "For any questions, issues, or feedback, email us at pier.stein93@gmail.com — we typically respond within 24 hours."],
        ["Account issues", "If you can't log in or need to reset your account, email us with the email address linked to your account and we'll sort it out."],
        ["Delete your account", "You can delete your account and all associated data at any time from Settings → Account → Delete Account inside the app."],
        ["Bugs & feedback", "Found a bug or have a feature request? We'd love to hear from you at pier.stein93@gmail.com."],
        ["No real money", "Invest is a stock market simulator. We never handle real money, payments, or financial credentials of any kind."],
      ].map(([title, body]) => (
        <div key={title as string} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>{body}</p>
        </div>
      ))}

      <div style={{ marginTop: 48 }}>
        <a href="/" style={{ color: "#0a84ff", textDecoration: "none", fontSize: 14 }}>← Back to home</a>
      </div>
    </div>
  );
}
