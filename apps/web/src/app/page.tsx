import Link from "next/link";

import { Logo } from "@/components/logo";
import { VoicePreview } from "@/components/voice-preview";
import { isExternalSpeechPreviewEnabled } from "@/server/speech-provider";

const trustSignals = [
  [
    "Tenant isolation",
    "Workspace identity is explicit across every protected boundary.",
  ],
  [
    "Provider portable",
    "Stable contracts keep speech vendors replaceable and testable.",
  ],
  [
    "Usage governed",
    "Atomic reservation prevents surprise spend before work is queued.",
  ],
  [
    "Audit ready",
    "Security-sensitive changes produce structured, tenant-scoped events.",
  ],
] as const;

const architectureSteps = [
  [
    "01",
    "Authorize",
    "Resolve membership and enforce role permissions server-side.",
  ],
  [
    "02",
    "Reserve",
    "Validate idempotency and reserve the workspace usage budget.",
  ],
  ["03", "Dispatch", "Publish provider-neutral work through a durable outbox."],
  [
    "04",
    "Reconcile",
    "Normalize results, release failures, and emit an audit trail.",
  ],
] as const;

export default function HomePage() {
  const previewMode = isExternalSpeechPreviewEnabled() ? "openai" : "browser";

  return (
    <main className="marketing-shell">
      <nav className="marketing-nav" aria-label="Primary navigation">
        <Logo />
        <div className="nav-links">
          <a href="#platform">Platform</a>
          <a href="#architecture">Architecture</a>
          <a href="#security">Security</a>
        </div>
        <Link className="button button-secondary" href="/dashboard">
          Open workspace
        </Link>
      </nav>

      <section className="hero section-grid" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="pill">
            <span className="status-dot" /> Architecture foundation · v0.1
          </span>
          <h1 id="hero-title">
            Voice infrastructure,
            <span>without the vendor lock-in.</span>
          </h1>
          <p className="hero-lead">
            Build accessible speech experiences with tenant-safe workflows,
            predictable usage, and a provider-independent control plane your
            team can trust.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/dashboard">
              Explore the workspace <span aria-hidden="true">↗</span>
            </Link>
            <a className="text-link" href="#architecture">
              Review the system design <span aria-hidden="true">↓</span>
            </a>
          </div>
          <dl className="hero-metrics">
            <div>
              <dt>99.95%</dt>
              <dd>Target API availability</dd>
            </div>
            <div>
              <dt>&lt;300 ms</dt>
              <dd>Request acceptance target</dd>
            </div>
            <div>
              <dt>4 roles</dt>
              <dd>Workspace RBAC model</dd>
            </div>
          </dl>
        </div>

        <div className="hero-console" aria-label="Voice request preview">
          <div className="console-topline">
            <div>
              <span className="eyebrow">Live control surface</span>
              <strong>Afghan Health Network</strong>
            </div>
            <span className="environment-badge">Production</span>
          </div>
          <VoicePreview mode={previewMode} />
          <div className="request-grid">
            <div>
              <span>Locale</span>
              <strong>en-US</strong>
            </div>
            <div>
              <span>Provider</span>
              <strong>{previewMode === "openai" ? "OpenAI" : "Local"}</strong>
            </div>
            <div>
              <span>Idempotency</span>
              <strong>Protected</strong>
            </div>
            <div>
              <span>Usage state</span>
              <strong className="healthy">Within budget</strong>
            </div>
          </div>
        </div>
      </section>

      <section
        className="trust-strip"
        id="platform"
        aria-label="Platform principles"
      >
        {trustSignals.map(([title, description]) => (
          <article key={title}>
            <span className="check-mark" aria-hidden="true">
              ✓
            </span>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="architecture-section" id="architecture">
        <div className="section-heading">
          <span className="eyebrow">System design</span>
          <h2>Every request earns its way to the provider.</h2>
          <p>
            The critical path is explicit, testable, and designed to prevent
            cross-tenant access, duplicate work, and unbounded provider spend.
          </p>
        </div>
        <div className="architecture-grid">
          {architectureSteps.map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="security-section section-grid" id="security">
        <div>
          <span className="eyebrow">Secure by construction</span>
          <h2>Content stays private. Decisions stay explainable.</h2>
          <p>
            Voxora keeps raw speech text out of telemetry, scopes data by
            workspace, and treats every provider and client boundary as
            untrusted.
          </p>
          <Link className="button button-light" href="/dashboard">
            Inspect the product experience
          </Link>
        </div>
        <div className="security-list">
          <div>
            <span>01</span>
            <p>Server-side RBAC on every protected operation</p>
          </div>
          <div>
            <span>02</span>
            <p>Private object storage with expiring delivery URLs</p>
          </div>
          <div>
            <span>03</span>
            <p>Correlation without logging customer speech content</p>
          </div>
          <div>
            <span>04</span>
            <p>Bounded retries and explicit failure reconciliation</p>
          </div>
        </div>
      </section>

      <footer className="marketing-footer">
        <Logo />
        <p>Production-oriented voice accessibility infrastructure.</p>
        <span>Open source · MIT</span>
      </footer>
    </main>
  );
}
