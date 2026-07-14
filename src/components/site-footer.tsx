import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <Link className="brand brand--footer" href="/" aria-label="EveryTech Products">
        <Logo />
        <span className="brand__word">EveryTech Products</span>
      </Link>
      <nav className="footer-nav" aria-label="Footer">
        <Link href="/franchiseiq">FranchiseIQ</Link>
        <a href="https://everytech.io" target="_blank" rel="noopener">
          everytech.io
        </a>
        <a href="mailto:contact@everytech.io">contact@everytech.io</a>
      </nav>
      <span className="footer-meta mono">&copy; {year} EveryTech &middot; GMT+8</span>
    </footer>
  );
}
