import Koa from "koa"
import bodyParser from "koa-bodyparser"
import { handleError } from "./middleware/handleError"

const app = new Koa()

app.use(handleError())
app.use(bodyParser())

export { app }
