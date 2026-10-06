import Header from "./components/Header";
import Teams from "./components/Teams";
import Playground from "./components/Playground";

export default function Home() {
  return (
    <>
      {/* Announcement */}
      <div className="announcement">
        <span className="announcement-dot"></span> A simpler way to find your
        team&apos;s work{" "}
        <a href="#how-it-works">
          See how it works <span aria-hidden="true">&#x2197;</span>
        </a>
      </div>

      <Header />

      <main id="top">
        {/* Hero */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-glow hero-glow-one"></div>
          <div className="hero-glow hero-glow-two"></div>
          <div className="float-link float-link-left" aria-hidden="true">
            <span className="float-icon violet">&#x2726;</span> go/roadmap
          </div>
          <div className="float-link float-link-right" aria-hidden="true">
            <span className="float-icon coral">&#x25C8;</span> go/brand
          </div>
          <div className="container hero-inner">
            <div className="eyebrow">
              <span className="eyebrow-spark">&#x2726;</span> THE SHORTCUT TO
              BETTER WORK
            </div>
            <h1 id="hero-title">
              Everything your team needs?
              <br />
              <em>one link away.</em>
            </h1>
            <p className="hero-copy">
              Stop digging through tabs, chats, and bookmarks. Give every
              important resource a memorable short link your whole team can find,
              use, and share.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#playground">
                Try LinkStream <span aria-hidden="true">&#x2197;</span>
              </a>
              <a className="button button-secondary" href="#how-it-works">
                See how it works <span aria-hidden="true">&darr;</span>
              </a>
            </div>
            <div className="hero-proof">
              <span className="proof-avatars" aria-hidden="true">
                <i>A</i>
                <i>M</i>
                <i>J</i>
              </span>
              <span>Built for teams that move fast, together.</span>
            </div>
          </div>

          {/* Product Stage */}
          <div
            className="container product-stage"
            aria-label="Preview of the LinkStream workspace"
          >
            <div className="product-window">
              <div className="window-top">
                <div className="window-dots">
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <div className="window-address">
                  <span className="lock-icon">&#x25C6;</span>{" "}
                  app.linkstream.co/home
                </div>
                <div className="window-top-end">&#x2197;</div>
              </div>
              <div className="app-shell">
                <aside className="app-sidebar">
                  <div className="app-brand">
                    <span className="mini-mark">&#x25C7;</span> linkstream
                  </div>
                  <div className="app-nav-label">WORKSPACE</div>
                  <div className="app-nav-item active">
                    <span>&#x25A6;</span> Home
                  </div>
                  <div className="app-nav-item">
                    <span>&#x2315;</span> Explore links
                  </div>
                  <div className="app-nav-item">
                    <span>&#x25A4;</span> Collections
                  </div>
                  <div className="app-nav-label space-label">
                    YOUR COLLECTIONS
                  </div>
                  <div className="app-nav-item">
                    <span className="side-dot orange"></span> Company
                  </div>
                  <div className="app-nav-item">
                    <span className="side-dot lilac"></span> Design team
                  </div>
                  <div className="app-nav-item">
                    <span className="side-dot mint"></span> Resources
                  </div>
                  <div className="sidebar-bottom">
                    <span className="profile-avatar">JD</span>
                    <span>
                      Jamie Doe
                      <small>Acme workspace</small>
                    </span>
                    <span className="more-dots">&middot;&middot;&middot;</span>
                  </div>
                </aside>
                <div className="app-main">
                  <div className="app-topline">
                    <span>
                      Workspace <b>&rsaquo;</b> Home
                    </span>
                    <span className="app-top-icons">
                      &#x25EF; &nbsp; &#x2318;
                    </span>
                  </div>
                  <div className="app-greeting">
                    <div>
                      <span className="app-overline">
                        TODAY IN YOUR WORKSPACE
                      </span>
                      <h2>
                        Good morning, Jamie <span>&#x2733;</span>
                      </h2>
                      <p>Everything you need to keep things moving.</p>
                    </div>
                    <div className="app-new">&#xFF0B; New link</div>
                  </div>
                  <div className="app-search">
                    <span className="search-symbol">&#x2315;</span>
                    <span>Search links, people, and collections...</span>
                    <kbd>&#x2318; K</kbd>
                  </div>
                  <div className="app-content-head">
                    <h3>Your quick links</h3>
                    <span>
                      View all <b>&rarr;</b>
                    </span>
                  </div>
                  <div className="quick-grid">
                    <div className="quick-card">
                      <span className="card-icon icon-peach">&#x25A5;</span>
                      <strong>Brand guidelines</strong>
                      <small>go/brand</small>
                      <span className="card-arrow">&#x2197;</span>
                    </div>
                    <div className="quick-card">
                      <span className="card-icon icon-purple">&#x25C8;</span>
                      <strong>Product roadmap</strong>
                      <small>go/roadmap</small>
                      <span className="card-arrow">&#x2197;</span>
                    </div>
                    <div className="quick-card">
                      <span className="card-icon icon-blue">&#x25A4;</span>
                      <strong>Team handbook</strong>
                      <small>go/handbook</small>
                      <span className="card-arrow">&#x2197;</span>
                    </div>
                  </div>
                  <div className="app-content-head second-head">
                    <h3>Trending in your workspace</h3>
                    <span>
                      See more <b>&rarr;</b>
                    </span>
                  </div>
                  <div className="trending-row">
                    <span className="trend-icon">&#x2733;</span>
                    <span>
                      <strong>Q4 planning hub</strong>
                      <small>go/q4-planning &middot; Updated by Alex</small>
                    </span>
                    <span className="trend-pill">Trending &#x2197;</span>
                  </div>
                  <div className="trending-row">
                    <span className="trend-icon lavender">&#x25EB;</span>
                    <span>
                      <strong>Launch checklist</strong>
                      <small>go/launch &middot; Updated by Morgan</small>
                    </span>
                    <span className="trend-visits">128 visits</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="stage-badge">
              <span>&#x2726;</span> Less searching. More doing.
            </div>
          </div>
        </section>

        {/* Value Strip */}
        <section className="value-strip">
          <div className="container value-inner">
            <span>ONE SIMPLE IDEA</span>
            <p>Great work starts when everyone can find what they need.</p>
            <span className="value-flower">&#x2733;</span>
          </div>
        </section>

        {/* How It Works */}
        <section className="section how-section" id="how-it-works">
          <div className="container">
            <div className="section-heading centered">
              <div className="section-kicker">HOW IT WORKS</div>
              <h2>
                From &ldquo;where is that?&rdquo;
                <br />
                to <em>right here.</em>
              </h2>
              <p>
                Turn long, forgettable URLs into shortcuts that make sense to
                everyone.
              </p>
            </div>
            <div className="steps-grid">
              <article className="step-card">
                <div className="step-number">01 / CREATE</div>
                <div className="step-art create-art">
                  <div className="url-line">
                    <span>https://docs.company.com/files/2026/...</span>
                    <span>&#x2198;</span>
                  </div>
                  <div className="art-connector"></div>
                  <div className="short-line">
                    <span className="short-dot">&#x2733;</span>
                    <strong>go/roadmap</strong>
                    <span>&#x2197;</span>
                  </div>
                </div>
                <h3>Make it memorable</h3>
                <p>
                  Give any resource a short, intuitive name your teammates will
                  actually remember.
                </p>
              </article>
              <article className="step-card">
                <div className="step-number">02 / SHARE</div>
                <div className="step-art share-art">
                  <div className="share-bubble first">
                    <span className="bubble-avatar">A</span>
                    <span>
                      Here&apos;s the plan: <b>go/roadmap</b>
                    </span>
                  </div>
                  <div className="share-bubble second">
                    <span className="bubble-avatar purple">M</span>
                    <span>Perfect, found it! &#x2728;</span>
                  </div>
                  <div className="share-cursor">&#x2197;</div>
                </div>
                <h3>Share it anywhere</h3>
                <p>
                  Drop a link into a message, meeting, or conversation. Everyone
                  gets there instantly.
                </p>
              </article>
              <article className="step-card">
                <div className="step-number">03 / FIND</div>
                <div className="step-art find-art">
                  <div className="find-search">
                    &#x2315; <span>Search anything...</span>
                    <span className="find-key">&#x2318; K</span>
                  </div>
                  <div className="find-result">
                    <span className="result-icon">&#x25A5;</span>
                    <span>
                      <b>Brand guidelines</b>
                      <small>go/brand</small>
                    </span>
                    <span>&#x2197;</span>
                  </div>
                  <div className="find-result fade">
                    <span className="result-icon violet">&#x25C8;</span>
                    <span>
                      <b>Product roadmap</b>
                      <small>go/roadmap</small>
                    </span>
                    <span>&#x2197;</span>
                  </div>
                </div>
                <h3>Find it in a flash</h3>
                <p>
                  Search your team&apos;s shared knowledge instead of retracing
                  yesterday&apos;s tabs.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section feature-section" id="features">
          <div className="container">
            <div className="feature-layout">
              <div className="feature-copy">
                <div className="section-kicker">
                  MADE FOR THE WAY YOU WORK
                </div>
                <h2>
                  Your team&apos;s knowledge,
                  <br />
                  <em>finally flowing.</em>
                </h2>
                <p>
                  Resources don&apos;t have to live in scattered corners of your
                  workspace. LinkStream brings the useful stuff together in one
                  place.
                </p>
                <div className="feature-points">
                  <div>
                    <span className="feature-point-icon">&#x2315;</span>
                    <span>
                      <strong>Search less, discover more</strong>
                      <small>
                        Find the right link as quickly as you can think of it.
                      </small>
                    </span>
                  </div>
                  <div>
                    <span className="feature-point-icon">&#x25A6;</span>
                    <span>
                      <strong>Keep everyone in the loop</strong>
                      <small>
                        Shared collections make important resources easy to
                        access.
                      </small>
                    </span>
                  </div>
                  <div>
                    <span className="feature-point-icon">&#x2197;</span>
                    <span>
                      <strong>Make every link count</strong>
                      <small>
                        See what your team uses and keep your workspace fresh.
                      </small>
                    </span>
                  </div>
                </div>
                <a className="text-link" href="#playground">
                  Explore LinkStream <span>&#x2197;</span>
                </a>
              </div>
              <div className="feature-visual">
                <div className="feature-visual-glow"></div>
                <div className="feature-collection">
                  <div className="collection-head">
                    <span className="collection-icon">&#x25EB;</span>
                    <span>
                      <strong>Design resources</strong>
                      <small>A home for everything creative</small>
                    </span>
                    <span>&middot;&middot;&middot;</span>
                  </div>
                  <div className="collection-list">
                    <div>
                      <span className="list-icon peach">&#x25A5;</span>
                      <span>
                        <b>Brand guidelines</b>
                        <small>go/brand</small>
                      </span>
                      <span>&#x2197;</span>
                    </div>
                    <div>
                      <span className="list-icon purple">&#x25C8;</span>
                      <span>
                        <b>Design system</b>
                        <small>go/design-system</small>
                      </span>
                      <span>&#x2197;</span>
                    </div>
                    <div>
                      <span className="list-icon blue">&#x25A6;</span>
                      <span>
                        <b>Asset library</b>
                        <small>go/assets</small>
                      </span>
                      <span>&#x2197;</span>
                    </div>
                  </div>
                  <div className="collection-foot">
                    <span className="tiny-avatars" aria-hidden="true">
                      <i>A</i>
                      <i>M</i>
                      <i>J</i>
                    </span>{" "}
                    Shared with the whole team <span>&#xFF0B;</span>
                  </div>
                </div>
                <div className="floating-note">
                  <span className="note-icon">&#x2726;</span>
                  <span>
                    <b>One place for it all</b>
                    <small>Beautifully organized, easy to share.</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Teams />

        <Playground />

        {/* Closing */}
        <section className="closing-section">
          <div className="container closing-inner">
            <span className="closing-spark">&#x2733;</span>
            <div className="section-kicker">
              WORK, WITHOUT THE WHERE-IS-IT
            </div>
            <h2>
              Good things happen when
              <br />
              everything <em>connects.</em>
            </h2>
            <p>
              Bring your team&apos;s most important links into the flow.
            </p>
            <a className="button button-light" href="#playground">
              Try LinkStream <span aria-hidden="true">&#x2197;</span>
            </a>
            <span className="closing-orbit orbit-one"></span>
            <span className="closing-orbit orbit-two"></span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div>
              <a className="brand footer-brand" href="#top">
                <span className="brand-mark" aria-hidden="true">
                  <span></span>
                  <span></span>
                </span>
                <span>
                  link<span className="brand-accent">stream</span>
                  <sup>&reg;</sup>
                </span>
              </a>
              <p>
                Make knowledge easy to find
                <br />
                and even easier to share.
              </p>
            </div>
            <div className="footer-links">
              <div>
                <strong>Explore</strong>
                <a href="#how-it-works">How it works</a>
                <a href="#features">Features</a>
                <a href="#teams">For teams</a>
              </div>
              <div>
                <strong>Get started</strong>
                <a href="#playground">Try the preview</a>
                <a href="#top">Back to top &uarr;</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 LinkStream. Made for better work.</span>
            <span>One link away from what matters. &#x2733;</span>
          </div>
        </div>
      </footer>
    </>
  );
}
