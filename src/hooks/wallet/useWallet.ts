import { WalletAnalytics } from "@/types/Wallet";
import { useEffect, useState } from "react";

interface UseWalletResult {
  data: WalletAnalytics | null;
  loading: boolean;
  error: string | null;
  setData: React.Dispatch<React.SetStateAction<WalletAnalytics | null>>;
  refetch: () => Promise<void>;
}

export function useWallet(): UseWalletResult {
  const [data, setData] = useState<WalletAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch wallet");
      }

      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return {
    data,
    loading,
    error,
    setData,
    refetch: fetchWallet,
  };
}
