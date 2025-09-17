import { connectDB } from "@/lib/mongoose"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/authOptions"
import { User } from "@/models/User"
import { ApiResponse } from "@/types/apiResponse"

export async function DELETE(req: Request) {
  try {

    // get logged in user
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" }
      return NextResponse.json(response, { status: 401 })
    }

    await connectDB()

    // find user by email
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      const response: ApiResponse = { success: false, message: "User not found" }
      return NextResponse.json(response, { status: 404 })
    }

    // remove waAccount field/value
    user.waAccounts = undefined // or null if you prefer
    await user.save()

    const response: ApiResponse = { success: true, message: "WA Account deleted successfully" }
    return NextResponse.json(response)
  } catch (err: any) {
    const response: ApiResponse = { success: false, message: err.message }
    return NextResponse.json(response, { status: 500 })
  }
}
