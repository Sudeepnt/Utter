"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

// The browser handles the attachment. Allow a retry without assuming that
// the download has finished or that the browser accepted it.
const RETRY_DELAY_MS = 30_000;

export function DownloadLink({
  href,
  className,
  label,
  icon,
  endIcon,
  showStatus = false,
}: {
  href: string;
  className: string;
  label: string;
  icon: ReactNode;
  endIcon?: ReactNode;
  showStatus?: boolean;
}) {
  const [state, setState] = useState<"idle" | "starting" | "retry">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    function reset(event: PageTransitionEvent) {
      if (event.persisted) {
        window.clearTimeout(timer.current);
        timer.current = undefined;
        setState("idle");
      }
    }
    window.addEventListener("pageshow", reset);
    return () => {
      window.removeEventListener("pageshow", reset);
      window.clearTimeout(timer.current);
    };
  }, []);

  function start(event: MouseEvent<HTMLAnchorElement>) {
    if (timer.current !== undefined) {
      event.preventDefault();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    setState("starting");
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setState("retry");
    }, RETRY_DELAY_MS);
  }

  const starting = state === "starting";
  return (
    <>
      <a
        className={`${className} download-link`}
        href={href}
        aria-disabled={starting || undefined}
        onClick={start}
        onAuxClick={(event) => {
          if (timer.current !== undefined) event.preventDefault();
        }}
      >
        {starting ? <span className="download-spinner" aria-hidden="true" /> : icon}
        {starting ? "Starting download…" : label}
        {!starting && endIcon}
      </a>
      <span className={showStatus ? "download-status" : "sr-only"} role="status">
        {starting && "Check your browser’s downloads for the installer."}
        {state === "retry" && "If the installer hasn’t appeared in your downloads, try again."}
      </span>
    </>
  );
}
