import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { VoicePreview } from "@/components/voice-preview";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Voxora workspace operations dashboard.",
};

const phrases = [
  {
    title: "Appointment confirmed",
    locale: "English · en-US",
    uses: "1,284",
    status: "Active",
  },
  {
    title: "نوبت شما تأیید شد",
    locale: "Dari · fa-AF",
    uses: "926",
    status: "Active",
  },
  {
    title: "Queue update",
    locale: "English · en-US",
    uses: "418",
    status: "Review",
  },
] as const;

const activity = [
  ["Speech request completed", "Appointment confirmed", "2 min ago"],
  ["Phrase updated", "Queue update", "34 min ago"],
  ["API key rotated", "Production web", "Yesterday"],
] as const;

export default function DashboardPage() {
  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <Logo />
        <nav aria-label="Workspace navigation">
          <Link className="active" href="/dashboard">
            <span aria-hidden="true">◫</span> Overview
          </Link>
          <a href="#phrases">
            <span aria-hidden="true">≋</span> Phrase library
          </a>
          <a href="#usage">
            <span aria-hidden="true">◌</span> Usage
          </a>
          <a href="#activity">
            <span aria-hidden="true">↺</span> Audit activity
          </a>
        </nav>
        <div className="sidebar-footer">
          <div className="workspace-avatar">AH</div>
          <div>
            <strong>Afghan Health</strong>
            <span>Production workspace</span>
          </div>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="mobile-brand">
            <Logo compact />
            <span>Voxora</span>
          </div>
          <div className="header-status">
            <span className="status-dot" /> All systems operational
          </div>
          <div className="header-actions">
            <span className="role-badge">Admin</span>
            <div className="user-avatar">FM</div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-intro">
            <div>
              <span className="eyebrow">Workspace overview</span>
              <h1>Good morning, Faramarz.</h1>
              <p>
                Your voice operations are healthy and comfortably within budget.
              </p>
            </div>
            <button className="button button-primary" type="button">
              + New phrase
            </button>
          </section>

          <section className="metric-grid" aria-label="Workspace metrics">
            <article>
              <div className="metric-icon mint" aria-hidden="true">
                ↗
              </div>
              <span>Requests this month</span>
              <strong>12,482</strong>
              <small>
                <b>+18.4%</b> from last month
              </small>
            </article>
            <article id="usage">
              <div className="metric-icon amber" aria-hidden="true">
                ◔
              </div>
              <span>Usage this month</span>
              <strong>
                742k <em>/ 1m chars</em>
              </strong>
              <div className="progress">
                <span style={{ width: "74.2%" }} />
              </div>
            </article>
            <article>
              <div className="metric-icon violet" aria-hidden="true">
                ⌁
              </div>
              <span>Success rate</span>
              <strong>99.82%</strong>
              <small>Last 30 days</small>
            </article>
            <article>
              <div className="metric-icon blue" aria-hidden="true">
                ◫
              </div>
              <span>Active phrases</span>
              <strong>38</strong>
              <small>Across 3 locales</small>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel preview-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Voice sandbox</span>
                  <h2>Preview safely in your browser</h2>
                </div>
                <span className="privacy-chip">No upload</span>
              </div>
              <VoicePreview text="Your appointment is confirmed. Please arrive fifteen minutes early." />
            </article>

            <article className="panel usage-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Budget control</span>
                  <h2>Monthly usage</h2>
                </div>
                <span>74%</span>
              </div>
              <div className="usage-ring">
                <div>
                  <strong>258k</strong>
                  <span>remaining</span>
                </div>
              </div>
              <div className="usage-legend">
                <span>
                  <i className="used" /> Consumed 721k
                </span>
                <span>
                  <i className="reserved" /> Reserved 21k
                </span>
              </div>
            </article>
          </section>

          <section className="table-grid">
            <article className="panel" id="phrases">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Content</span>
                  <h2>Top phrases</h2>
                </div>
                <a href="#phrases">View library</a>
              </div>
              <div className="phrase-list">
                {phrases.map((phrase) => (
                  <div className="phrase-row" key={phrase.title}>
                    <div className="phrase-play" aria-hidden="true">
                      ▶
                    </div>
                    <div>
                      <strong
                        dir={phrase.locale.startsWith("Dari") ? "rtl" : "ltr"}
                      >
                        {phrase.title}
                      </strong>
                      <span>{phrase.locale}</span>
                    </div>
                    <span
                      className={`table-status ${phrase.status.toLowerCase()}`}
                    >
                      {phrase.status}
                    </span>
                    <div className="uses">
                      <strong>{phrase.uses}</strong>
                      <span>uses</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel" id="activity">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Governance</span>
                  <h2>Recent activity</h2>
                </div>
                <a href="#activity">Open audit log</a>
              </div>
              <div className="activity-list">
                {activity.map(([title, detail, time]) => (
                  <div key={`${title}-${detail}`}>
                    <span className="activity-dot" />
                    <div>
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </div>
                    <time>{time}</time>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
