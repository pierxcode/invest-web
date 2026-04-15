const TICKERS = [
  { symbol: "AAPL",  price: "172.42", change: "+1.24%", up: true  },
  { symbol: "TSLA",  price: "245.18", change: "-0.87%", up: false },
  { symbol: "NVDA",  price: "876.30", change: "+3.12%", up: true  },
  { symbol: "MSFT",  price: "415.50", change: "+0.54%", up: true  },
  { symbol: "AMZN",  price: "188.90", change: "+1.89%", up: true  },
  { symbol: "GOOGL", price: "172.10", change: "-0.32%", up: false },
  { symbol: "META",  price: "509.40", change: "+2.67%", up: true  },
  { symbol: "BRK.B", price: "407.30", change: "+0.21%", up: true  },
  { symbol: "JPM",   price: "197.80", change: "-1.02%", up: false },
  { symbol: "NFLX",  price: "622.50", change: "+4.11%", up: true  },
];

const FEATURES = [
  { icon: "💰", title: "€1,000,000 to invest",    desc: "Start with a million euros of virtual cash. Build your dream portfolio from day one." },
  { icon: "📈", title: "Real-time market data",   desc: "Live prices, real charts, actual news. Experience the stock market exactly as it happens." },
  { icon: "🤖", title: "AI investment advisor",   desc: "Your personal AI analyst. Get instant analysis, portfolio strategy, and stock breakdowns in plain language." },
  { icon: "🎯", title: "Auto orders",             desc: "Set price alerts, recurring buys, and limit orders. Automate your strategy like a pro." },
  { icon: "🏆", title: "Leaderboard & badges",    desc: "Compete globally, climb the ranking, and unlock achievements as your portfolio grows." },
  { icon: "🌍", title: "Geopolitics & news",      desc: "Breaking headlines, market sentiment, and global events — all in one feed." },
];

const STEPS = [
  { step: "01", title: "Create your account",  desc: "Sign up in seconds. No credit card, no bank details, nothing real needed." },
  { step: "02", title: "Get your €1M",         desc: "Your virtual million lands instantly. Start browsing thousands of real stocks." },
  { step: "03", title: "Invest & learn",        desc: "Buy, sell, set alerts, use AI analysis. Track your portfolio in real time." },
];

const STATS = [
  { value: "€1M",       label: "Starting balance" },
  { value: "Real-time", label: "Market data" },
  { value: "10,000+",   label: "Stocks available" },
  { value: "Free",      label: "No risk, no cost" },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px",
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #0a84ff, #30d158)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 18, color: "#fff",
          }}>I</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>Invest</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 14 }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how" className="nav-link">How it works</a>
        </div>
        <a href="#download" className="cta-btn" style={{ padding: "10px 22px", fontSize: 14 }}>
          Download
        </a>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 24px 60px", position: "relative",
      }}>
        {/* Blobs */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", top: "-15%", left: "-10%",
            width: 700, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(10,132,255,0.45) 0%, transparent 70%)",
            filter: "blur(90px)", opacity: 0.35,
          }} />
          <div style={{
            position: "absolute", top: "-10%", right: "-10%",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(48,209,88,0.35) 0%, transparent 70%)",
            filter: "blur(80px)", opacity: 0.25,
          }} />
          <div style={{
            position: "absolute", bottom: "5%", left: "35%",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(120,50,255,0.4) 0%, transparent 70%)",
            filter: "blur(80px)", opacity: 0.2,
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>
          {/* Live badge */}
          <div className="fade-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 999, marginBottom: 32,
            background: "rgba(48,209,88,0.1)", border: "1px solid rgba(48,209,88,0.25)",
            color: "#30d158", fontSize: 13, fontWeight: 600,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "#30d158",
              display: "inline-block", boxShadow: "0 0 8px #30d158",
            }} />
            Markets are open
          </div>

          {/* H1 */}
          <h1 className="gradient-text fade-up-delay-1" style={{
            fontSize: "clamp(42px, 8vw, 80px)",
            fontWeight: 900, letterSpacing: "-0.04em",
            lineHeight: 1.05, marginBottom: 24,
          }}>
            Investment Stock<br />Simulator
          </h1>

          {/* Subtitle */}
          <p className="fade-up-delay-2" style={{
            fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 500,
            color: "rgba(255,255,255,0.6)", marginBottom: 12, lineHeight: 1.5,
          }}>
            Get{" "}
            <span className="green-text" style={{ fontWeight: 700 }}>€1,000,000</span>
            {" "}of virtual money to invest<br />in the real-time stock market.
          </p>
          <p className="fade-up-delay-3" style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", marginBottom: 44 }}>
            No risk. No real money. Just the real market.
          </p>

          {/* CTAs */}
          <div className="fade-up-delay-4" id="download" style={{
            display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
          }}>
            <a href="#" className="cta-btn" style={{ padding: "16px 32px", fontSize: 16 }}>
              ↓ Download on the App Store
            </a>
            <a href="#features" className="outline-btn" style={{ padding: "16px 32px", fontSize: 16 }}>
              See how it works
            </a>
          </div>

          {/* Stats */}
          <div className="fade-up-delay-4" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
            marginTop: 60, maxWidth: 700, margin: "60px auto 0",
          }}>
            {STATS.map(s => (
              <div key={s.label} className="feature-card" style={{
                borderRadius: 16, padding: "16px 12px", textAlign: "center",
              }}>
                <div className="green-text" style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ticker tape ────────────────────────────────────────────── */}
      <div style={{
        overflow: "hidden", padding: "14px 0",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div className="ticker-track" style={{ display: "flex", gap: 10, width: "max-content" }}>
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <div key={i} className="ticker-pill" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{t.symbol}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{t.price}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.up ? "#30d158" : "#ff453a" }}>{t.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
              Everything you need
            </p>
            <h2 className="gradient-text" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>
              Built for real learning
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "0 auto" }}>
              All the tools professional investors use — in an app designed for everyone.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}>
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card" style={{ borderRadius: 20, padding: "28px 24px" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section id="how" style={{ padding: "100px 24px", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
            How it works
          </p>
          <h2 className="gradient-text" style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 60 }}>
            Start investing in minutes
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {STEPS.map(s => (
              <div key={s.step} className="feature-card" style={{ borderRadius: 20, padding: "32px 24px", textAlign: "left" }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: "rgba(255,255,255,0.08)", marginBottom: 20, lineHeight: 1 }}>{s.step}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.5)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 700, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(10,132,255,0.5) 0%, transparent 70%)",
          filter: "blur(70px)", opacity: 0.2, pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <h2 className="gradient-text" style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 20 }}>
            Ready to start?
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 40 }}>
            Join thousands of investors learning the market with real data and zero risk.
          </p>
          <a href="#" className="cta-btn" style={{ padding: "18px 40px", fontSize: 17, display: "inline-block" }}>
            Download Invest — It&apos;s Free
          </a>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{
        padding: "40px 24px", textAlign: "center", fontSize: 13,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: "linear-gradient(135deg, #0a84ff, #30d158)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 13, color: "#fff",
          }}>I</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Invest</span>
        </div>
        <p style={{ marginBottom: 8 }}>
          Stock Market Simulator — No real money is used or at risk. For educational purposes only.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
          {[["Privacy Policy", "/privacy"], ["Terms", "/terms"], ["Contact", "mailto:hello@investapp.com"]].map(([label, href]) => (
            <a key={label} href={href} className="footer-link">{label}</a>
          ))}
        </div>
        <p style={{ marginTop: 24 }}>&copy; {new Date().getFullYear()} Invest. All rights reserved.</p>
      </footer>

    </main>
  );
}
