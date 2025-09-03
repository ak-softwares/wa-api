import { Connection } from "mongoose"

declare global {
    var mongoose: {
        conn: Connection | null
        promise: Promise<Connection> | null
    }

    // extend globalThis with otpStore
    var otpStore: Record<string, { code: string; expiresAt: number }>;}

export {}

