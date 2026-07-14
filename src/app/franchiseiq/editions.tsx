"use client";

import { useState } from "react";
import { EDITIONS } from "@/lib/franchiseiq-editions";

export function EditionSwitcher() {
  const [active, setActive] = useState(0);
  const ed = EDITIONS[active];

  return (
    <div>
      <div className="edtabs" role="tablist" aria-label="FranchiseIQ market">
        {EDITIONS.map((e, i) => (
          <button
            key={e.code}
            role="tab"
            aria-selected={i === active}
            className={"edtab" + (i === active ? " edtab--active" : "")}
            onClick={() => setActive(i)}
          >
            <span aria-hidden="true">{e.flag}</span> {e.country}
            <span className="edtab__city mono">{e.city}</span>
          </button>
        ))}
      </div>

      <section className="appframe" aria-label={`FranchiseIQ ${ed.country} live application`}>
        <div className="appframe__bar">
          <span className="appframe__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="appframe__label mono">
            franchiseiq · {ed.code.toUpperCase()} · pilot: {ed.city}
          </span>
          <a className="appframe__open" href={ed.app} target="_blank" rel="noopener">
            Open ↗
          </a>
        </div>
        <iframe
          key={ed.code}
          src={ed.app}
          title={`FranchiseIQ ${ed.country} interactive pilot`}
          loading="lazy"
        />
      </section>

      <div className="prov">
        <p className="prov__head mono">
          provenance · {ed.country} production pipeline ({ed.zones} pilot {ed.unit}s, keyed on{" "}
          {ed.joinKey})
        </p>
        <dl className="ledger" style={{ maxWidth: "none" }}>
          {ed.sources.map(([k, v]) => (
            <div className="ledger__row" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
