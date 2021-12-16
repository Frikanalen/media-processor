import "dotenv/config"
import { app } from "./modules/core/app"

const port = Number(process.env.PORT) || 8001

async function main() {
  app.listen(port, () => console.info(`App listening on port ${port}`))
}

main().catch(console.error)
