"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "./icons";
import { DownloadLink } from "./download-link";

const scenarios = [
  {
    name: "The video idea",
    app: "Script draft",
    tag: "FOR CREATORS",
    title: "Catch the idea before it disappears.",
    text: "Here's the thing about starting: your first version doesn't have to be perfect. It just has to exist. So today, we're making something.",
    detail:
      "Talk through a hook, a voiceover, or that oddly specific idea for your next video.",
  },
  {
    name: "The big email",
    app: "New message",
    tag: "FOR THE DAY JOB",
    title: "Get to the point. In your own voice.",
    text: "Hey team, I've been thinking about the next launch. Let's keep the first version simple, get it into people's hands, and learn from what they actually use.",
    detail:
      "Turn the thought in your head into a message, an update, or a proposal while it's still fresh.",
  },
  {
    name: "The perfect prompt",
    app: "Prompt draft",
    tag: "FOR BUILDERS",
    title: "Your next prompt is a conversation.",
    text: "Build a simple dashboard with a weekly overview, a clear activity feed, and a button to export everything. Keep it clean and make it work on mobile.",
    detail:
      "Explain the whole idea to your AI tools without compressing it into a few tired keystrokes.",
  },
];
const platforms = {
  mac: "/api/download?platform=macos-arm64",
  windows: "/api/download?platform=windows-x64",
};
function PlatformDownload({
  os,
  light = false,
}: {
  os: "mac" | "windows";
  light?: boolean;
}) {
  return (
    <DownloadLink
      className={`button ${light ? "button-white" : "button-dark"}`}
      href={platforms[os]}
      icon={<Icon name={os === "mac" ? "apple" : "windows"} />}
      label={`Download for ${os === "mac" ? "Mac" : "Windows"}`}
      endIcon={<Icon name="download" size={18} />}
    />
  );
}
function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <a
      className={`brand ${inverse ? "inverse" : ""}`}
      href="/"
      aria-label="Utter home"
    >
      <Image
        src="/assets/utter-logo.png"
        alt=""
        width={42}
        height={42}
        loading="eager"
      />
      <span>
        utter<span className="brand-dot">.</span>
      </span>
    </a>
  );
}
function Wave({ className = "" }: { className?: string }) {
  return (
    <span className={`wave ${className}`} aria-hidden="true">
      {Array.from({ length: 25 }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--i": i,
              "--height": `${10 + ((i * 17 + 13) % 34)}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [active, setActive] = useState(0);
  const [count, setCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const demo = scenarios[active];
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    change();
    media.addEventListener("change", change);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    root.current
      ?.querySelectorAll(".reveal")
      .forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      media.removeEventListener("change", change);
    };
  }, []);
  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      setCount(demo.text.length);
      setPlaying(false);
      return;
    }
    const timer = setInterval(
      () =>
        setCount((current) => {
          if (current >= demo.text.length) {
            clearInterval(timer);
            return current;
          }
          return current + 2;
        }),
      23,
    );
    return () => clearInterval(timer);
  }, [playing, active, reduced, demo.text.length]);
  useEffect(() => {
    if (playing && count >= demo.text.length) setPlaying(false);
  }, [playing, count, demo.text.length]);
  function replay() {
    setCount(0);
    setPlaying(true);
  }
  function choose(index: number) {
    setActive(index);
    setCount(0);
    setPlaying(false);
  }

  return (
    <div ref={root} className={motionPaused ? "motion-paused" : undefined}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav
            className={menu ? "navigation open" : "navigation"}
            aria-label="Main navigation"
          >
            <a href="#feeling" onClick={() => setMenu(false)}>
              The feeling
            </a>
            <a href="#why-utter" onClick={() => setMenu(false)}>
              Why Utter
            </a>
            <a href="#creators" onClick={() => setMenu(false)}>
              For creators
            </a>
          </nav>
          <a className="header-download" href="#download">
            Get Utter <Icon name="download" size={17} />
          </a>
          <button
            className="menu-toggle"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Icon name={menu ? "close" : "menu"} />
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-spark">✳</span> BIG THOUGHTS. LESS TYPING.
            </div>
            <h1>
              Say it.
              <br />
              Skip the
              <br />
              <span className="serif-word">typing.</span>
              <span className="headline-spark" aria-hidden="true">
                ✳
              </span>
            </h1>
            <p className="hero-description">
              Your brain is on a roll. Let it talk.
              <br />
              Utter turns your voice into text in the apps you already use.
              Privately, on your computer.
            </p>
            <div className="hero-actions">
              <PlatformDownload os="mac" />
              <DownloadLink
                className="text-button"
                href={platforms.windows}
                icon={<Icon name="windows" size={17} />}
                label="Get it for Windows"
              />
            </div>
            <p className="hero-fine">
              Mac & Windows <span>·</span> No account needed for local dictation
            </p>
          </div>
          <div
            className="hero-visual"
            onPointerMove={(e) => {
              if (reduced || motionPaused) return;
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty(
                "--mx",
                `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`,
              );
              e.currentTarget.style.setProperty(
                "--my",
                `${-((e.clientY - r.top) / r.height - 0.5) * 10}deg`,
              );
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.setProperty("--mx", "0deg");
              e.currentTarget.style.setProperty("--my", "0deg");
            }}
          >
            <div className="mascot-stage">
              <div className="stage-grid" />
              <span className="stage-label">
                A LITTLE LOUDER. A LITTLE MORE YOU.
              </span>
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <Image
                className="hero-mascot"
                src="/assets/utter-logo.png"
                width={570}
                height={570}
                alt="Utter's exuberant mascot, ready to get your thoughts out loud"
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 760px) 90vw, 45vw"
              />
              <span className="speech-bubble">
                Oh, that’s a good idea.<span>Let’s get it down.</span>
              </span>
              <div className="listening-pill">
                <Icon name="mic" size={18} />
                <Wave />
                <span>your voice, unleashed</span>
              </div>
            </div>
            <span className="floating-note note-one">
              <Icon name="check" size={15} /> Your thoughts. Already typed.
            </span>
            <span className="floating-note note-two">
              <Icon name="lock" size={15} /> Stays on your device
            </span>
            <span className="hero-caption">A small app. A very big mouth.</span>
          </div>
        </section>
        <section className="truth-strip wrap" aria-label="Utter at a glance">
          <div>
            <Icon name="lock" />
            <span>On-device transcription</span>
          </div>
          <div>
            <Icon name="spark" />
            <span>Your choice of speech models</span>
          </div>
          <div>
            <Icon name="code" />
            <span>Open source. Open possibilities.</span>
          </div>
        </section>
        <div className="word-ribbon" aria-hidden="true">
          <div>
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i}>
                LESS TAP TAP. <b>MORE BLAH BLAH.</b>
                <i>✳</i>
              </span>
            ))}
          </div>
        </div>

        <section id="feeling" className="section wrap reveal">
          <div className="section-top">
            <div>
              <span className="eyebrow">THAT THOUGHT? KEEP GOING.</span>
              <h2>
                From “hear me out”
                <br />
                to <span className="serif-word">all written out.</span>
              </h2>
            </div>
            <p>
              For the ideas that arrive fully formed.
              <br />
              And the ones you need to talk your way into.
            </p>
          </div>
          <div className="demo-layout">
            <div className="steps">
              {[
                {
                  n: "01",
                  title: "Hold your shortcut.",
                  body: "One key gets Utter listening. You pick the shortcut that feels right.",
                },
                {
                  n: "02",
                  title: "Give your thoughts a voice.",
                  body: "The local speech model does the transcription on your computer.",
                },
                {
                  n: "03",
                  title: "Let go. There it is.",
                  body: "Your words paste into the app you're using. Give them a read, then make your next move.",
                },
              ].map((step) => (
                <div className="step" key={step.n}>
                  <span>{step.n}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="interactive-demo">
              <div className="demo-toolbar">
                <div className="traffic-lights">
                  <i />
                  <i />
                  <i />
                </div>
                <span>{demo.app}</span>
                <span className="example-label">INTERACTIVE EXAMPLE</span>
              </div>
              <div
                className="demo-tabs"
                role="tablist"
                aria-label="Choose a dictation example"
              >
                {scenarios.map((s, i) => (
                  <button
                    role="tab"
                    id={`demo-tab-${i}`}
                    aria-controls="demo-output"
                    aria-selected={active === i}
                    key={s.name}
                    onClick={() => choose(i)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                        e.preventDefault();
                        const next =
                          (active +
                            (e.key === "ArrowRight" ? 1 : -1) +
                            scenarios.length) %
                          scenarios.length;
                        choose(next);
                        document.getElementById(`demo-tab-${next}`)?.focus();
                      }
                    }}
                    tabIndex={active === i ? 0 : -1}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <div
                id="demo-output"
                className="demo-document"
                role="tabpanel"
                aria-labelledby={`demo-tab-${active}`}
              >
                <span className="document-kicker">
                  LET'S GET THIS OUT OF YOUR HEAD.
                </span>
                <p>
                  {count === 0 && !playing ? (
                    <span className="placeholder">
                      An idea is a terrible thing to leave in your head.
                    </span>
                  ) : (
                    demo.text.slice(0, count)
                  )}
                  <span className="cursor" aria-hidden="true" />
                </p>
              </div>
              <div className="demo-bottom">
                <button
                  className={`demo-play ${playing ? "is-playing" : ""}`}
                  onClick={playing ? () => setPlaying(false) : replay}
                >
                  <Icon name={playing ? "waves" : "play"} size={18} />
                  {playing
                    ? "Pause demo"
                    : count > 0
                      ? "Play it again"
                      : "Play the demo"}
                </button>
                <span>Simulated dictation · no mic needed</span>
              </div>
              <span className="sr-only" aria-live="polite">
                {!playing && count >= demo.text.length
                  ? "Example complete. " + demo.text
                  : ""}
              </span>
            </div>
          </div>
        </section>

        <section id="why-utter" className="why-section">
          <div className="wrap">
            <div className="section-top reveal">
              <div>
                <span className="eyebrow">
                  BIG PERSONALITY. SMALL FOOTPRINT.
                </span>
                <h2>
                  Great dictation.
                  <br />
                  <span className="serif-word">Your terms.</span>
                </h2>
              </div>
              <p>
                Looking for a local-first alternative to Wispr Flow?
                <br />
                Here's where Utter makes its own kind of noise.
              </p>
            </div>
            <div className="feature-grid">
              <article className="feature privacy-feature reveal">
                <div className="feature-icon">
                  <Icon name="lock" size={24} />
                </div>
                <h3>
                  Your thoughts stay
                  <br />
                  close to home.
                </h3>
                <p>
                  Local dictation runs on your device after the speech model
                  downloads. Your everyday thoughts don't need a round trip to a
                  transcription server.
                </p>
                <div className="privacy-orbit" aria-hidden="true">
                  <span className="privacy-circle circle-1" />
                  <span className="privacy-circle circle-2" />
                  <span className="privacy-circle circle-3" />
                  <div className="local-device">
                    <Icon name="lock" size={27} />
                    <span>ON YOUR DEVICE</span>
                  </div>
                  <span className="orbit-chip chip-top">your wild idea</span>
                  <span className="orbit-chip chip-bottom">
                    your actual voice
                  </span>
                </div>
                <p className="feature-footnote">
                  Optional online integrations are yours to enable.
                </p>
              </article>
              <article className="feature models-feature reveal">
                <div className="feature-icon">
                  <Icon name="waves" size={24} />
                </div>
                <h3>
                  One voice.
                  <br />
                  More possibilities.
                </h3>
                <p>
                  Pick a local speech model that suits your language, hardware,
                  and workflow. Utter works with Whisper, Parakeet, and more.
                </p>
                <div className="model-stack" aria-hidden="true">
                  <div>
                    <span className="model-symbol purple">W</span>
                    <b>Whisper</b>
                    <Icon name="check" size={16} />
                  </div>
                  <div>
                    <span className="model-symbol orange">P</span>
                    <b>Parakeet</b>
                    <span className="local-badge">LOCAL</span>
                  </div>
                  <div>
                    <span className="model-symbol green">Q</span>
                    <b>Qwen ASR</b>
                    <span className="local-badge">LOCAL</span>
                  </div>
                </div>
                <p className="feature-footnote">
                  Language support and requirements vary by model.
                </p>
              </article>
              <article className="feature vocabulary-feature reveal">
                <div className="feature-icon">
                  <Icon name="spark" size={24} />
                </div>
                <h3>
                  All your wonderfully
                  <br />
                  specific words.
                </h3>
                <p>
                  Give Utter the names, products, and niche vocabulary that make
                  your work yours.
                </p>
                <div className="vocabulary-cloud" aria-hidden="true">
                  <span>your channel name</span>
                  <span>that client</span>
                  <span>Figma</span>
                  <span>your next big thing</span>
                  <span>utterly you</span>
                </div>
              </article>
              <article className="feature open-feature reveal">
                <div className="feature-icon">
                  <Icon name="code" size={24} />
                </div>
                <h3>
                  No account.
                  <br />
                  Just an open door.
                </h3>
                <p>
                  Start local dictation without creating an account. And with
                  MIT-licensed source code, the curious can look under the hood.
                </p>
                <a
                  className="inline-link"
                  href="https://github.com/Sudeepnt/Hex"
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore the source <Icon name="code" size={17} />
                </a>
                <span className="open-decoration" aria-hidden="true">
                  &lt;/&gt;
                </span>
              </article>
            </div>
          </div>
        </section>

        <section id="creators" className="creator-section wrap reveal">
          <div className="creator-copy">
            <span className="eyebrow">FOR PEOPLE WITH SOMETHING TO SAY.</span>
            <h2>
              Less typing.
              <br />
              More <span className="serif-word">making.</span>
            </h2>
            <p>
              Your next script. The newsletter you've been putting off. A prompt
              with the details you'd usually leave out. Talk it through while
              the idea's still hot.
            </p>
            <a className="text-button" href="#download">
              Make room for the good stuff <Icon name="spark" size={18} />
            </a>
            <span className="creator-disclaimer">
              Workflow examples, inspired by the work creators do.
            </span>
          </div>
          <div className="creator-cards">
            <article className="creator-card creator-orange">
              <span className="creator-kind">THE CONTENT CREATOR</span>
              <span className="big-quote" aria-hidden="true">
                “
              </span>
              <h3>
                Wait, that's actually
                <br />a great opening.
              </h3>
              <p>
                Talk through your next video hook before your inner editor gets
                a vote.
              </p>
              <span className="creator-format">
                SCRIPT DRAFT / VOICEOVER / CAPTION
              </span>
            </article>
            <article className="creator-card creator-lilac">
              <span className="creator-kind">THE SERIAL IDEA PERSON</span>
              <div className="idea-spark" aria-hidden="true">
                ✳
              </div>
              <h3>
                More of the idea.
                <br />
                Less of the friction.
              </h3>
              <p>
                Get the whole thought into your notes, your email, or your next
                AI prompt.
              </p>
              <span className="creator-format">
                BRAIN DUMP / NEWSLETTER / BIG PLAN
              </span>
            </article>
          </div>
        </section>

        <section className="faq-section wrap reveal">
          <div>
            <span className="eyebrow">A FEW THINGS WORTH ASKING.</span>
            <h2>
              Before you
              <br />
              <span className="serif-word">get loud.</span>
            </h2>
          </div>
          <div className="faq-list">
            {[
              [
                "What does Utter actually do?",
                "Hold a shortcut, speak, and release it. Utter transcribes your speech with a local model and pastes the text into the focused app. It's a desktop dictation app for the writing you already do.",
              ],
              [
                "Does my speech leave my computer?",
                "Core local dictation is processed on your device after you download a model. Optional online features, such as rewriting integrations, can contact external services if you enable them.",
              ],
              [
                "Is this an alternative to Wispr Flow or Whisper?",
                "Utter is a local-first desktop dictation alternative to apps such as Wispr Flow. Whisper is a speech model, not the same kind of product: Utter can use Whisper alongside other local models. Pick the engine that fits your needs.",
              ],
              [
                "Which computers can run it?",
                "The Mac installer targets Apple silicon and macOS 15 or later. Windows targets 64-bit Windows 10 and 11; x64 speech processing requires an AVX2-capable processor. Installer availability is shown on the download page.",
              ],
              [
                "What happens when I install it?",
                "Open Utter, set up a local speech model, and choose your shortcut. Allow microphone access; on Mac, Accessibility permission is also needed to paste into other apps. Internet is needed for the first model download.",
              ],
              [
                "Where do I find plans and pricing?",
                "Utter is free right now. The Pricing page inside the app confirms that no purchase is required. Paid plans and checkout are not active.",
              ],
              [
                "Are the desktop downloads available yet?",
                "The download page shows the latest published installer. If your platform's release isn't ready, we'll tell you there. You can check back at the same link when it's available.",
              ],
            ].map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Icon name="chevron" size={20} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="download" className="download-section">
          <div className="wrap download-inner">
            <div>
              <span className="eyebrow">
                YOUR NEXT GREAT THING STARTS HERE.
              </span>
              <h2>
                You've got
                <br />
                something to <span className="serif-word">say.</span>
              </h2>
              <p>Give your keyboard a break. Get a little Utter.</p>
              <div className="download-buttons">
                <PlatformDownload os="mac" light />
                <PlatformDownload os="windows" light />
              </div>
              <div className="system-details">
                <span>
                  MAC <b>Apple silicon · macOS 15+</b>
                </span>
                <span>
                  WINDOWS <b>64-bit Windows 10 / 11 · AVX2</b>
                </span>
              </div>
              <p className="release-note">
                Published installers download when available. If yours is still
                being prepared, we'll let you know.
              </p>
            </div>
            <div className="download-mascot">
              <Image
                src="/assets/utter-logo.png"
                alt=""
                width={460}
                height={460}
                sizes="(max-width: 760px) 260px, 33vw"
              />
              <span aria-hidden="true">say heyyy.</span>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer wrap">
        <div>
          <Brand />
          <p>Big thoughts. Out loud.</p>
        </div>
        <div className="footer-links">
          <a href="#why-utter">Why Utter</a>
          <a href="#download">Downloads</a>
          <a
            href="https://github.com/Sudeepnt/Utter"
            target="_blank"
            rel="noreferrer"
          >
            Website source
          </a>
          <a
            href="https://github.com/Sudeepnt/Hex"
            target="_blank"
            rel="noreferrer"
          >
            App source
          </a>
        </div>
        <button
          className="motion-toggle"
          aria-pressed={motionPaused}
          onClick={() => setMotionPaused(!motionPaused)}
        >
          {motionPaused ? "Resume animation" : "Pause animation"}
        </button>
        <span className="copyright">
          © {new Date().getFullYear()} Utter. Your words, your device.
        </span>
      </footer>
    </div>
  );
}
