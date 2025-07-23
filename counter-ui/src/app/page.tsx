"use client";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { TonConnectButton, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { TacSdk, SenderFactory, Network } from "@tonappchain/sdk";
import type { SenderAbstraction } from "@tonappchain/sdk";
import { ethers } from "ethers";

const COUNTER_PROXY_CONTRACT_ADDRESS = "0xb0156E63054A4422D10479EaF2945b1bd857F650";
const COUNTER_CONTRACT_ADDRESS = "0xfd02866AB9F98e5fCb867746c65E2C4B83fC2Beb";
const TAC_EVM_RPC_URL = "https://spb.rpc.tac.build";
const NETWORK = Network.TESTNET; // or Network.MAINNET

// Counter ABI (from Counter.sol)
const COUNTER_ABI = [
  "function getNumber() view returns (uint256)",
  "function increment()",
  "function decrement()",
  "function setNumber(uint256)"
];

function CounterApp() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [tacSdk, setTacSdk] = useState<TacSdk | null>(null);
  const [sender, setSender] = useState<SenderAbstraction | null>(null);
  const [counter, setCounter] = useState<number | null>(null);
  const [setValue, setSetValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize TAC SDK and sender
  useEffect(() => {
    (async () => {
      try {
        const sdk = await TacSdk.create({ network: NETWORK });
        setTacSdk(sdk);
        if (wallet) {
          const s = await SenderFactory.getSender({ tonConnect: tonConnectUI });
          setSender(s);
        } else {
          setSender(null);
        }
      } catch {
        setError("Failed to initialize TAC SDK");
      }
    })();
    // Only rerun when wallet changes
  }, [tonConnectUI, wallet]);

  // Fetch counter value
  const fetchCounter = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.JsonRpcProvider(TAC_EVM_RPC_URL);
      const contract = new ethers.Contract(COUNTER_PROXY_CONTRACT_ADDRESS, COUNTER_ABI, provider);
      const value = await contract.getNumber();
      setCounter(Number(value));
    } catch {
      setError("Failed to fetch counter value");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounter();
  }, [tacSdk]);

  // Send transaction helper
  const sendTx = async (method: "increment" | "decrement" | "setNumber", value?: number) => {
    if (!tacSdk || !sender) return;
    setLoading(true);
    setError(null);
    try {
      const iface = new ethers.Interface(COUNTER_ABI);
      let data;
      if (method === "setNumber") {
        data = iface.encodeFunctionData(method, [value]);
      } else {
        data = iface.encodeFunctionData(method);
      }
      const evmProxyMsg = {
        evmTargetAddress: COUNTER_PROXY_CONTRACT_ADDRESS,
        methodName: method === "setNumber" ? "setNumber(uint256)" : method,
        encodedParameters: data,
      };
      await tacSdk.sendCrossChainTransaction(evmProxyMsg, sender, []);
      await fetchCounter();
    } catch (err) {
      console.error("Transaction error:", err);
      // Se err è un oggetto Error, puoi mostrare il messaggio
      if (err instanceof Error) {
        setError(`Transaction failed: ${err.message}`);
      } else {
        setError("Transaction failed: " + JSON.stringify(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md p-8 flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-bold mb-2">TAC Counter</h1>
        <div className="mb-4 w-full flex justify-end">
          <TonConnectButton />
        </div>
        <div className="mb-4">
          <Button onClick={fetchCounter} disabled={loading} variant="outline">
            {loading ? "Loading..." : "Refresh Counter"}
          </Button>
        </div>
        <div className="text-4xl font-mono mb-4">
          {counter !== null ? counter : "-"}
        </div>
        <div className="flex gap-4 mb-4">
          <Button onClick={() => sendTx("increment") } disabled={!wallet || loading}>
            +1
          </Button>
          <Button onClick={() => sendTx("decrement") } disabled={!wallet || loading}>
            -1
          </Button>
        </div>
        <div className="flex gap-2 items-center mb-4 w-full">
          <Input
            type="number"
            value={setValue}
            onChange={e => setSetValue(Number(e.target.value))}
            className="flex-1"
            min={0}
            disabled={!wallet || loading}
          />
          <Button onClick={() => sendTx("setNumber", setValue)} disabled={!wallet || loading}>
            Set
          </Button>
        </div>
        <div className="w-full flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {wallet ? "Wallet connected" : "Connect your TON wallet to interact"}
          </span>
          {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>
      </Card>
    </div>
  );
}

export default CounterApp;
