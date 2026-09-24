"use client";

export default function ErrorPage({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="state-page">
      <span className="eyebrow">Unexpected error</span>
      <h1>Voxora could not load this view.</h1>
      <p>
        The incident is isolated. Retry the request or return to the product
        page.
      </p>
      <button className="button button-primary" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
