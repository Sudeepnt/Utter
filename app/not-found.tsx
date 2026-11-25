import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-page">
      <span className="eyebrow">A LITTLE LOST FOR WORDS.</span>
      <h1>Nothing to utter here.</h1>
      <p>That page doesn't exist. The good stuff is back at home.</p>
      <Link className="button button-dark" href="/">
        Back to Utter
      </Link>
    </main>
  );
}
