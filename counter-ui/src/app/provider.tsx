"use client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl="https://tac-counter-contract.vercel.app//tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}