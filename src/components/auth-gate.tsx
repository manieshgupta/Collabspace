"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

import { FullscreenLoader } from "./fullscreen-loader";

function RedirectToSignIn() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sign-in");
  }, [router]);

  return <FullscreenLoader label="Redirecting to sign in..." />;
}

export function AuthGate({ children }: { children: ReactNode }) {
  return (
    <>
      <Authenticated>
        {children}
      </Authenticated>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
      <AuthLoading>
        <FullscreenLoader label="Auth loading..." />
      </AuthLoading>
    </>
  );
}
