import Link from "next/link";

export function Logo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link href={href} className="logo" aria-label="CVmess home">
      <span className="logo-mark"><b>C</b><b>V</b><small>105</small></span>
      {!compact && <span className="logo-word">CV<span>mess</span></span>}
    </Link>
  );
}
