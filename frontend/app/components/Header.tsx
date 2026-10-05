"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/app/lib/auth-context";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <a className="brand" href="/" aria-label="LinkStream home">
          <span className="brand-mark" aria-hidden="true">
            <span></span>
            <span></span>
          </span>
          <span>
            link<span className="brand-accent">stream</span>
            <sup>&reg;</sup>
          </span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav
          className={`nav${menuOpen ? " open" : ""}`}
          id="site-nav"
          aria-label="Main navigation"
        >
          <div className="nav-links">
            <a href="#how-it-works" onClick={closeMenu}>
              How it works
            </a>
            <a href="#features" onClick={closeMenu}>
              Features
            </a>
            <a href="#teams" onClick={closeMenu}>
              For teams
            </a>
            <a href="#playground" onClick={closeMenu}>
              Try it out
            </a>
          </div>
          {!loading && (
            user ? (
              <a className="nav-cta" href="/dashboard" onClick={closeMenu}>
                Dashboard <span aria-hidden="true">&#x2197;</span>
              </a>
            ) : (
              <div className="nav-auth">
                <a className="nav-login" href="/login" onClick={closeMenu}>
                  Sign in
                </a>
                <a className="nav-cta" href="/signup" onClick={closeMenu}>
                  Get started <span aria-hidden="true">&#x2197;</span>
                </a>
              </div>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
