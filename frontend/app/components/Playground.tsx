"use client";

import { useState, useRef } from "react";
import { createPreviewLink } from "@/app/lib/preview";

export default function Playground() {
  const [resultLink, setResultLink] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [copyText, setCopyText] = useState("Copy");
  const destinationRef = useRef<HTMLInputElement>(null);
  const keywordRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const destination = destinationRef.current!;
    const keyword = keywordRef.current!;

    try {
      const link = createPreviewLink(destination.value, keyword.value);
      setResultLink(link);
      setShowResult(true);
      setCopyText("Copy");
    } catch (error) {
      const message = (error as Error).message;
      const field = message.startsWith("Use 1–32") ? keyword : destination;
      field.setCustomValidity(message);
      field.reportValidity();
    }
  }

  function clearValidity(e: React.FormEvent<HTMLInputElement>) {
    e.currentTarget.setCustomValidity("");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(resultLink);
      setCopyText("Copied!");
    } catch {
      setCopyText("Select to copy");
    }
  }

  return (
    <section className="section playground-section" id="playground">
      <div className="container playground-layout">
        <div className="playground-copy">
          <div className="section-kicker">GIVE IT A GO</div>
          <h2>
            Your next shortcut TEST
            <br />
            starts <em>right here.</em>
          </h2>
          <p>
            See how a long URL becomes something your team can actually
            remember. This preview runs entirely in your browser.
          </p>
          <div className="playground-note">
            <span>&#x2733;</span> No account needed to try the preview.
          </div>
        </div>
        <div className="playground-card">
          <div className="playground-card-top">
            <span>
              <i></i>
              <i></i>
              <i></i>
            </span>
            <strong>Create a short link</strong>
            <span>&#x2726;</span>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="destination">Destination URL</label>
            <input
              ref={destinationRef}
              id="destination"
              name="destination"
              type="url"
              placeholder="https://yourcompany.com/important-resource"
              required
              onInput={clearValidity}
            />
            <label htmlFor="keyword">Your shortcut TEST</label>
            <div className="shortcut-field">
              <span>go/</span>
              <input
                ref={keywordRef}
                id="keyword"
                name="keyword"
                type="text"
                placeholder="your-shortcut"
                pattern="[a-zA-Z0-9-]+"
                maxLength={32}
                required
                aria-describedby="keyword-help"
                onInput={clearValidity}
              />
            </div>
            <small id="keyword-help">
              Letters, numbers, and hyphens work best.
            </small>
            <button className="button button-primary create-button" type="submit">
              Create preview link <span>&#x2197;</span>
            </button>
            {showResult && (
              <div
                className="preview-result"
                role="status"
                aria-live="polite"
              >
                <div>
                  <span>Your shortcut is ready</span>
                  <strong>{resultLink}</strong>
                </div>
                <button type="button" aria-label="Copy shortcut" onClick={handleCopy}>
                  {copyText}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
