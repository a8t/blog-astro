import React, { useEffect, useId, useRef, useState } from "react";
import migrationMap from "@/config/chords-migration.json";

const STORAGE_KEY = "chords-deprecation-dismissed-at";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const SONGS_INDEX_URL = "https://talaawitan.com/songs";

type PageKind = "index" | "song";

type DeprecationModalProps = {
  page: PageKind;
  slug?: string;
  title?: string;
};

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

function getDestinationUrl(page: PageKind, slug?: string): string {
  if (page === "index" || !slug) {
    return SONGS_INDEX_URL;
  }
  const mapped = (migrationMap as Record<string, string>)[slug];
  return mapped ?? SONGS_INDEX_URL;
}

function withUtm(url: string, content: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "andytran");
  u.searchParams.set("utm_medium", "deprecation_modal");
  u.searchParams.set("utm_campaign", "chords_migration");
  u.searchParams.set("utm_content", content);
  return u.toString();
}

function readDismissedAt(): Date | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function writeDismissedAt(date = new Date()): void {
  try {
    localStorage.setItem(STORAGE_KEY, date.toISOString());
  } catch {
    // ignore quota / private mode failures
  }
}

function capture(
  event: string,
  properties: Record<string, unknown>,
): void {
  try {
    window.posthog?.capture(event, properties);
  } catch {
    // analytics must never break the UI
  }
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
  );
  return Array.from(nodes).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      el.tabIndex !== -1,
  );
}

export default function DeprecationModal({
  page,
  slug,
  title,
}: DeprecationModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [isReprompt, setIsReprompt] = useState(false);

  const utmContent = page === "index" ? "index" : (slug ?? "song");
  const destinationUrl = withUtm(getDestinationUrl(page, slug), utmContent);

  const baseProps = {
    page,
    ...(slug ? { slug } : {}),
    is_reprompt: isReprompt,
  };

  useEffect(() => {
    const dismissedAt = readDismissedAt();
    const now = Date.now();

    if (!dismissedAt) {
      setIsReprompt(false);
      setOpen(true);
      capture("chords_deprecation_shown", {
        page,
        ...(slug ? { slug } : {}),
        is_reprompt: false,
      });
      return;
    }

    const elapsed = now - dismissedAt.getTime();
    if (elapsed >= DISMISS_MS) {
      setIsReprompt(true);
      setOpen(true);
      capture("chords_deprecation_shown", {
        page,
        ...(slug ? { slug } : {}),
        is_reprompt: true,
      });
      return;
    }

    const daysSinceDismiss = Math.floor(elapsed / (24 * 60 * 60 * 1000));
    capture("chords_visit_while_dismissed", {
      page,
      ...(slug ? { slug } : {}),
      days_since_dismiss: daysSinceDismiss,
    });
  }, [page, slug]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusables = dialog ? getFocusable(dialog) : [];
    (focusables[0] ?? dialog)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const items = getFocusable(dialog);
      if (items.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
    // dismiss is stable enough via closure over current isReprompt/page/slug
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isReprompt, page, slug]);

  function dismiss() {
    writeDismissedAt();
    setOpen(false);
    capture("chords_deprecation_dismissed", {
      page,
      ...(slug ? { slug } : {}),
      is_reprompt: isReprompt,
    });
  }

  function onCtaClick() {
    capture("chords_deprecation_cta_clicked", {
      ...baseProps,
      destination_url: destinationUrl,
    });
  }

  function onContributeClick() {
    capture("chords_deprecation_contribute_clicked", baseProps);
  }

  if (!open) return null;

  const songLabel = title ? `“${title}”` : "this song";
  const primaryLabel =
    page === "index"
      ? "Browse songs on Talaawitan"
      : `Open ${songLabel} on Talaawitan`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss deprecation notice"
        className="absolute inset-0 bg-gray-900/50"
        onClick={dismiss}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl outline-none ring-1 ring-black/5"
      >
        <h2 id={titleId} className="text-lg font-semibold text-gray-900">
          These charts are moving to Talaawitan
        </h2>
        <p id={descriptionId} className="mt-3 text-sm leading-relaxed text-gray-600">
          {page === "index"
            ? "Thanks for reading chords here. The collection now lives on Talaawitan — a better home for these songs."
            : `Thanks for reading here. ${songLabel} (and the rest of these charts) now live on Talaawitan.`}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCtaClick}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {primaryLabel}
          </a>

          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Continue reading here
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Want to help make Talaawitan better?{" "}
          <a
            href="/contact"
            onClick={onContributeClick}
            className="font-medium text-indigo-600 underline-offset-2 hover:underline"
          >
            Get in touch
          </a>
        </p>
      </div>
    </div>
  );
}
