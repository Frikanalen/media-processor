import Koa from "koa"
import bodyParser from "koa-bodyparser"
import { handleError } from "./middleware/handleError"
import { logRequest } from "./middleware/logRequest"

const app = new Koa()

app.use(logRequest())
app.use(handleError())
app.use(bodyParser())

export { app }
