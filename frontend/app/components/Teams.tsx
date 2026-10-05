"use client";

import { useState, useRef } from "react";

interface TeamData {
  label: string;
  title: string;
  description: string;
  links: [string, string, string][];
}

const teams: Record<string, TeamData> = {
  design: {
    label: "DESIGN",
    title: "Keep creativity moving.",
    description:
      "Give your team a single, easy path to the files, feedback, and inspiration behind great work.",
    links: [
      ["◈", "go/design-system", "Components & patterns"],
      ["▥", "go/brand", "Brand guidelines"],
      ["▦", "go/assets", "Creative library"],
    ],
  },
  engineering: {
    label: "ENGINEERING",
    title: "Build without the bottlenecks.",
    description:
      "Keep docs, dashboards, and deploy details within reach so your team can stay focused on shipping.",
    links: [
      ["⌘", "go/docs", "Technical documentation"],
      ["▥", "go/sprint", "Current sprint"],
      ["◈", "go/deploys", "Release dashboard"],
    ],
  },
  people: {
    label: "PEOPLE",
    title: "Make everyone feel at home.",
    description:
      "Help new teammates and old hands find the policies, perks, and people they need.",
    links: [
      ["✳", "go/onboarding", "New hire guide"],
      ["▥", "go/benefits", "Benefits hub"],
      ["◈", "go/handbook", "Team handbook"],
    ],
  },
  marketing: {
    label: "MARKETING",
    title: "Keep every launch in sync.",
    description:
      "Put campaign plans, creative assets, and reporting in one easy-to-share stream.",
    links: [
      ["▦", "go/campaigns", "Campaign calendar"],
      ["◈", "go/assets", "Creative assets"],
      ["▥", "go/reports", "Performance reports"],
    ],
  },
};

const teamKeys = Object.keys(teams);
const iconClasses = ["", "peach", "blue"];

export default function Teams() {
  const [activeTeam, setActiveTeam] = useState("design");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const team = teams[activeTeam];

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % teamKeys.length;
    else if (e.key === "ArrowLeft")
      next = (index - 1 + teamKeys.length) % teamKeys.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = teamKeys.length - 1;

    if (next !== null) {
      e.preventDefault();
      setActiveTeam(teamKeys[next]);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <section className="section teams-section" id="teams">
      <div className="container">
        <div className="section-heading centered">
          <div className="section-kicker">FOR EVERY TEAM</div>
          <h2>
            One workspace.
            <br />
            <em>A million ways to move.</em>
          </h2>
          <p>
            From your first day to your next big launch, the right link is
            always close.
          </p>
        </div>
        <div className="team-tabs" role="tablist" aria-label="Team examples">
          {teamKeys.map((key, i) => (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              className={`team-tab${activeTeam === key ? " active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeTeam === key}
              aria-controls="team-panel"
              tabIndex={activeTeam === key ? 0 : -1}
              onClick={() => setActiveTeam(key)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <div className="team-panel" role="tabpanel" id="team-panel">
          <div className="team-panel-copy">
            <span className="team-eyebrow">
              LINKSTREAM FOR <span>{team.label}</span>
            </span>
            <h3>{team.title}</h3>
            <p>{team.description}</p>
            <div className="team-panel-footer">
              <span>Try these shortcuts</span>
              <span className="decorative-arrow">&#x2197;</span>
            </div>
          </div>
          <div className="team-links">
            {team.links.map(([icon, name, desc], i) => (
              <div key={name} className="team-link">
                <span
                  className={`team-link-icon${iconClasses[i] ? ` ${iconClasses[i]}` : ""}`}
                >
                  {icon}
                </span>
                <span>
                  <b>{name}</b>
                  <small>{desc}</small>
                </span>
                <span>&#x2197;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
