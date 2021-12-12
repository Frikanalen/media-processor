import { app } from "./modules/core/app"

if (typeof process.env.FK_API === "undefined") {
  throw new Error("FK_API is undefined!")
}

const port = Number(process.env.PORT) || 8001

async function main() {
  app.listen(port, () => console.info(`App listening on port ${port}`))
}

main().catch(console.error)
