import "dotenv/config"
import { app } from "./modules/core/app"
import { redis } from "./modules/redis/redis"

const port = Number(process.env.PORT) || 8001

async function main() {
  await redis.connect()
  app.listen(port, () => console.info(`App listening on port ${port}`))
}

main().catch(console.error)
