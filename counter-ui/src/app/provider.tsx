"use client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl="../public/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}