import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="state-page">
      <span className="eyebrow">404 · Not found</span>
      <h1>This Voxora route does not exist.</h1>
      <p>Check the address or return to the product overview.</p>
      <Link className="button button-primary" href="/">
        Return home
      </Link>
    </main>
  );
}
