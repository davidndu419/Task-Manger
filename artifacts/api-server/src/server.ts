// Final deploy attempt
import serverless from "serverless-http";
import app from "./app";
import { logger } from "./lib/logger";

// 1. Export the serverless handler for Netlify
export const handler = serverless(app);

// 2. Only run the listener if we are NOT on Netlify/Serverless
// Netlify defines certain variables like 'NETLIFY' or we can check NODE_ENV
if (!process.env.NETLIFY && process.env.NODE_ENV !== "production") {
  const port = Number(process.env.PORT) || 3000;
  
  app.listen(port, (err?: any) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening locally");
  });
}