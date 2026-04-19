import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
const pinoHttp = require("pino-http"); // Use 'require' to bypass the ESM/TS callable error
import router from "./routes/index";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) { // Keep :any to stop the "Implicit Any" scream
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0]
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
