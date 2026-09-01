import { useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_black" | "filled_blue";
              size?: "small" | "medium" | "large";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              logo_alignment?: "left" | "center";
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let gsiScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiScriptPromise) {
    gsiScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GSI_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Google sign in script failed to load."));
      document.head.appendChild(script);
    });
  }
  return gsiScriptPromise;
}

type GoogleSignInButtonProps = {
  /** Called once a real Supabase session exists. */
  onSuccess: () => void;
  onError: (message: string) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Renders Google's own "Sign in with Google" widget. Google runs the entire
 * OAuth handshake itself (popup or One Tap); this only ever sees the
 * resulting ID token, which Supabase verifies via signInWithIdToken.
 */
export function GoogleSignInButton({
  onSuccess,
  onError,
  disabled,
  className,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;
    if (!clientId) {
      onError("Google sign in is not configured yet.");
      return;
    }

    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
            });
            if (error) {
              onError("Google sign in did not complete. Try again or use your email and password.");
              return;
            }
            onSuccess();
          },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width: 336,
        });
      })
      .catch(() => onError("Google sign in is unavailable right now."));

    return () => {
      cancelled = true;
    };
  }, [onSuccess, onError]);

  return (
    <div
      ref={containerRef}
      aria-disabled={disabled}
      className={disabled ? `pointer-events-none opacity-50 ${className ?? ""}` : className}
    />
  );
}
