import { LAUNCH, loadEnv, Logger } from "~/lib";

// --- Load environment variables
loadEnv();

import db from "~/lib/database";
import app from "~/app";

// --- Variables
const PORT = process.env.PORT || 3000;

// --- Launch server
const launch = async () => {
  try {
    await db.connect();
    app.listen(PORT);

    Logger.send("INFO", `${LAUNCH}:${PORT}`);
  } catch (error: any) {
    Logger.send("ERROR", `${error.message}`);
  }
};

launch();
