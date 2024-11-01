import dotenv from "dotenv";
import path from "path";
import Logger from "./logger";

export const loadEnv = (): void => {
  const envPath = path.join(__dirname, "../../.env");

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    Logger.send("ERROR", "Error while loading environment variables.");
    process.exit(1);
  }

  Logger.send("SUCCESS", "Environment variables loaded.");
};
