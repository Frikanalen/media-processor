import { randomBytes } from "crypto"

export const getVideoKey = () => randomBytes(16).toString("hex")
