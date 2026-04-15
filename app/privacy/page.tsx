export default function Privacy() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 24px 80px", lineHeight: 1.8 }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 48 }}>Last updated: April 2026</p>

      {[
        ["What we collect", "We collect your email address and the name you provide during signup. We also store portfolio data, transactions, and preferences you create within the app."],
        ["How we use it", "Your data is used solely to provide the Invest app experience — saving your portfolio, personalising your feed, and enabling features like the leaderboard. We do not sell your data."],
        ["Real-time market data", "Invest uses third-party market data providers to display live stock prices and news. No personal data is shared with these providers."],
        ["AI features", "When you use the AI advisor, your messages are processed by Anthropic's Claude API. We do not store conversation history beyond your active session. Anthropic's privacy policy applies to AI processing."],
        ["Data storage", "Your account data is stored securely via Supabase with encryption at rest and in transit."],
        ["No real money", "Invest is a simulator. We never collect payment information, bank details, or financial credentials of any kind."],
        ["Children", "Invest is not directed at children under 13. We do not knowingly collect data from children."],
        ["Your rights", "You can delete your account and all associated data at any time from the app settings. Contact us at privacy@investapp.com for any data requests."],
        ["Contact", "Questions? Email us at privacy@investapp.com"],
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
