"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-page">
      <h1>Let's try that again.</h1>
      <p>Something interrupted this page.</p>
      <button className="button button-dark" onClick={reset}>
        Try again
      </button>
      <p>
        <a href="/">Back to Utter</a>
      </p>
    </main>
  );
}
