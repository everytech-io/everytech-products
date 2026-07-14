import Link from "next/link";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="EveryTech Products">
        <Logo />
        <span className="brand__word">EveryTech</span>
        <span className="brand__tag mono">Products</span>
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <ul>
          <li>
            <Link href="/#products">Products</Link>
          </li>
          <li>
            <a href="https://everytech.io" target="_blank" rel="noopener">
              The firm
            </a>
          </li>
        </ul>
        <Link className="btn btn--sm" href="/franchiseiq">
          Launch FranchiseIQ
        </Link>
      </nav>
    </header>
  );
}
