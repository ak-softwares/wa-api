import { useState } from "react"
import { showToast } from "@/components/ui/sonner"
import { useRouter } from "next/navigation"
import { ApiResponse } from "@/types/apiResponse"

export function useDeleteWabaAccount(onSuccess?: () => void) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const deleteAccount = async () => {
    setDeleting(true)
    try {
      const res = await fetch("/api/facebook/accounts", { method: "DELETE" })
      const result: ApiResponse = await res.json()

      if (!result.success) {
        showToast.error(result.message || "Failed to delete waba account")
        return false
      }

      showToast.success("Waba account deleted successfully")
      onSuccess?.()
      router.refresh()
      return true
    } catch (err: any) {
      showToast.error("Failed to delete waba account: " + err.message)
      return false
    } finally {
      setDeleting(false)
    }
  }

  return { deleting, deleteAccount }
}
