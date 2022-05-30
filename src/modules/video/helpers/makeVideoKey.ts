import { randomBytes } from "crypto"

export const makeVideoKey = () => randomBytes(16).toString("hex")
