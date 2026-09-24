import Link from "next/link";

export function Logo({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <Link className="logo" href="/" aria-label="Voxora home">
      <span className="logo-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      {!compact && <span>voxora</span>}
    </Link>
  );
}
