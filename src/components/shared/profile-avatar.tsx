"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { User } from "lucide-react";
import { DEFAULT_PROFILE_PICTURE_URL } from "@/lib/profile-picture-constants";

export default function ProfileAvatar({
  src,
  alt,
  initials = "AM",
  className = "",
  iconClassName = "h-4 w-4",
}: {
  src?: string | null;
  alt: string;
  initials?: string;
  className?: string;
  iconClassName?: string;
}) {
  const [failedState, setFailedState] = useState<{
    source: string | null;
    defaultFailed: boolean;
  } | null>(null);

  const activeFailure = useMemo(() => {
    if (!failedState) {
      return null;
    }

    return failedState.source === (src ?? null) ? failedState : null;
  }, [failedState, src]);

  const resolvedSrc = useMemo(() => {
    if (!src || activeFailure) {
      return DEFAULT_PROFILE_PICTURE_URL;
    }

    return src;
  }, [activeFailure, src]);

  const showFallbackIcon = activeFailure?.defaultFailed ?? false;

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-white text-slate-500 ${className}`}
    >
      {showFallbackIcon ? (
        <User className={iconClassName} aria-hidden="true" />
      ) : (
        // Avatar files are tiny local assets, so a plain img avoids next/image
        // local-pattern restrictions while keeping cache-busted URLs valid.
        <img
          src={resolvedSrc}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => {
            if (resolvedSrc === DEFAULT_PROFILE_PICTURE_URL) {
              setFailedState({
                source: src ?? null,
                defaultFailed: true,
              });
              return;
            }

            setFailedState({
              source: src ?? null,
              defaultFailed: false,
            });
          }}
        />
      )}
      <span className="sr-only">{initials}</span>
    </span>
  );
}
