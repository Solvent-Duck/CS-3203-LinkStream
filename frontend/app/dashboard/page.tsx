"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";
import {
  type Link,
  getLinks,
  createLink,
  deleteLink,
  ApiError,
  API_BASE,
} from "@/app/lib/api";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showBrowserTip, setShowBrowserTip] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Create form state
  const [newSlug, setNewSlug] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTags, setNewTags] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const fetchLinks = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const data = await getLinks(query ? { query } : undefined);
      setLinks(data);
    } catch {
      setError("Failed to load links");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchLinks();
  }, [user, fetchLinks]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (user) fetchLinks(search || undefined);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, user, fetchLinks]);

  // Automatically refresh click counts when returning to the dashboard tab
  useEffect(() => {
    function onFocus() {
      if (user) fetchLinks(search || undefined);
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user, search, fetchLinks]);

  function getRedirectUrl(link: Link) {
    if (link.team?.slug) {
      return `${API_BASE}/go/${link.team.slug}/${link.slug}`;
    }
    return `${API_BASE}/go/${link.slug}`;
  }

  async function handleCopy(link: Link) {
    try {
      await navigator.clipboard.writeText(`go/${link.slug}`);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback if clipboard API restricted
      const textArea = document.createElement("textarea");
      textArea.value = `go/${link.slug}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await createLink({
        slug: newSlug,
        destinationUrl: newUrl,
        title: newTitle,
        description: newDescription || undefined,
        tags: newTags
          ? newTags.split(",").map((t) => t.trim().toLowerCase())
          : undefined,
      });
      setNewSlug("");
      setNewUrl("");
      setNewTitle("");
      setNewDescription("");
      setNewTags("");
      setShowCreate(false);
      fetchLinks();
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as {
          error?: string;
          errors?: { message: string }[];
        };
        setError(
          data?.error || data?.errors?.[0]?.message || "Failed to create link"
        );
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError("Failed to delete link");
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (authLoading || !user) {
    return (
      <div className="dashboard-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container dashboard-header-inner">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <span></span>
              <span></span>
            </span>
            <span>
              link<span className="brand-accent">stream</span>
              <sup>&reg;</sup>
            </span>
          </a>
          <div className="dashboard-user">
            <span className="dashboard-avatar">
              {user.initials}
            </span>
            <span className="dashboard-name">{user.fullName || user.email}</span>
            <button onClick={handleLogout} className="dashboard-logout">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container dashboard-main">
        <div className="dashboard-top">
          <div>
            <h1>Your links</h1>
            <p className="dashboard-subtitle">
              Manage your team&apos;s shortcuts
            </p>
          </div>
          <button
            className="button button-primary"
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? "Cancel" : "&#xFF0B; New link"}
          </button>
        </div>

        <div className="browser-tip-card">
          <div
            className="browser-tip-header"
            onClick={() => setShowBrowserTip(!showBrowserTip)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowBrowserTip(!showBrowserTip);
              }
            }}
          >
            <div className="browser-tip-title">
              <span className="browser-tip-badge">Pro-tip</span>
              <span>
                Enable <code>go/&lt;keyword&gt;</code> in your browser omnibox
              </span>
            </div>
            <button
              type="button"
              className="browser-tip-toggle"
              aria-expanded={showBrowserTip}
            >
              {showBrowserTip ? "Hide guide ▲" : "Browser setup guide ▼"}
            </button>
          </div>
          {showBrowserTip && (
            <div className="browser-tip-content">
              <p>
                Type shortcuts like <code>go/roadmap</code> straight into your
                browser search bar:
              </p>
              <ol>
                <li>
                  Open Chrome, Edge, or Brave{" "}
                  <strong>
                    Settings &rarr; Search engine &rarr; Manage search engines
                    and site search
                  </strong>
                  .
                </li>
                <li>
                  Under <strong>Site search</strong>, click{" "}
                  <strong>Add</strong>:
                  <ul>
                    <li>
                      <strong>Name:</strong> LinkStream
                    </li>
                    <li>
                      <strong>Shortcut:</strong> <code>go</code>
                    </li>
                    <li>
                      <strong>URL:</strong> <code>{API_BASE}/go/%s</code>
                    </li>
                  </ul>
                </li>
                <li>
                  Type <code>go roadmap</code> in your address bar and hit
                  Enter!
                </li>
              </ol>
            </div>
          )}
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: 20 }}>
            {error}
            <button
              onClick={() => setError("")}
              style={{
                marginLeft: 12,
                background: "none",
                border: "none",
                color: "inherit",
                fontWeight: 800,
              }}
            >
              &times;
            </button>
          </div>
        )}

        {showCreate && (
          <div className="create-form-card">
            <h2>Create a new shortcut</h2>
            <form onSubmit={handleCreate}>
              <div className="create-form-grid">
                <div>
                  <label htmlFor="new-slug">Shortcut slug</label>
                  <div className="shortcut-field">
                    <span>go/</span>
                    <input
                      id="new-slug"
                      type="text"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      placeholder="your-shortcut"
                      pattern="[a-zA-Z0-9\-_/]+"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="new-url">Destination URL</label>
                  <input
                    id="new-url"
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-title">Title</label>
                  <input
                    id="new-title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Product Roadmap"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-tags">Tags (comma separated)</label>
                  <input
                    id="new-tags"
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="planning, product"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="new-desc">Description (optional)</label>
                <input
                  id="new-desc"
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="A short description"
                />
              </div>
              <button
                className="button button-primary"
                type="submit"
                disabled={creating}
                style={{ marginTop: 16 }}
              >
                {creating ? "Creating..." : "Create shortcut"}
              </button>
            </form>
          </div>
        )}

        <div className="dashboard-search">
          <span className="search-symbol">&#x2315;</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links, tags, URLs..."
          />
        </div>

        {loading ? (
          <p className="dashboard-empty">Loading links...</p>
        ) : links.length === 0 ? (
          <p className="dashboard-empty">
            {search
              ? "No links match your search."
              : "No links yet. Create your first shortcut!"}
          </p>
        ) : (
          <div className="links-list">
            {links.map((link) => {
              const redirectUrl = getRedirectUrl(link);
              const isCopied = copiedId === link.id;

              return (
                <div key={link.id} className="link-card">
                  <div className="link-card-main">
                    <div className="link-card-icon">&#x25C8;</div>
                    <div className="link-card-info">
                      <div className="link-card-title-row">
                        <a
                          href={redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-title-link"
                          title="Open via LinkStream redirect"
                        >
                          <strong>{link.title}</strong>
                        </a>
                      </div>

                      <div className="link-card-slug-row">
                        <span className="link-card-slug">go/{link.slug}</span>
                        <button
                          type="button"
                          className={`link-copy-btn ${isCopied ? "copied" : ""}`}
                          onClick={() => handleCopy(link)}
                          title="Copy go/ shortcut to clipboard"
                        >
                          {isCopied ? "✓ Copied!" : "⧉ Copy go/"}
                        </button>
                        <a
                          href={redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-visit-btn"
                          title="Open shortcut destination via LinkStream redirect"
                        >
                          Visit ↗
                        </a>
                      </div>

                      <a
                        href={link.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-card-url"
                        title={link.destinationUrl}
                      >
                        {link.destinationUrl}
                      </a>

                      {link.description && (
                        <p className="link-card-desc">{link.description}</p>
                      )}
                    </div>
                    <div className="link-card-meta">
                      <span
                        className="link-card-clicks"
                        title="Total clicks recorded"
                      >
                        {link.clickCount}{" "}
                        {link.clickCount === 1 ? "click" : "clicks"}
                      </span>
                      {link.tags.length > 0 && (
                        <div className="link-card-tags">
                          {link.tags.map((tag) => (
                            <span key={tag.id} className="link-tag">
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className="link-delete"
                      onClick={() => handleDelete(link.id)}
                      title="Delete link"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
