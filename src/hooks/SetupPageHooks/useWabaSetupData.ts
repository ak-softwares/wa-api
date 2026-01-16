import { useEffect, useState } from "react"
import { toast } from "@/components/ui/sonner"
import { ApiResponse } from "@/types/apiResponse"
import { WabaAccount, WaSetupStatus } from "@/types/WabaAccount"

export function useWaSetupData() {
  const [loadingWaba, setLoadingWaba] = useState(true);
  const [loadingSetupData, setLoadingSetupData] = useState(true);
  const [waSetupStatus, setWaSetupStatus] = useState<WaSetupStatus | null>(null);
  const [wabaAccount, setWabaAccount] = useState<WabaAccount | null>(null);

  const fetchStatus = async () => {
    try {
      setLoadingWaba(true);
      const res = await fetch("/api/wa-accounts/check-status")
      const result: ApiResponse = await res.json()
      if (result.success) setWaSetupStatus(result.data)
    } catch (err: any) {
      toast.error("Error loading setup status: " + err.message)
    } finally{
      setLoadingWaba(false);
    }
  }

  const fetchWaba = async () => {
    try {
      setLoadingSetupData(true)
      const res = await fetch("/api/facebook/waba")
      const result: ApiResponse = await res.json()
      if (result.success) setWabaAccount(result.data)
    } catch {
      // ignore silently
    } finally{
      setLoadingSetupData(false);
    }
  }

  useEffect(() => {
    Promise.all([fetchStatus(), fetchWaba()])
  }, [])

  return { loadingWaba, loadingSetupData, waSetupStatus, wabaAccount, fetchStatus, fetchWaba }
}
