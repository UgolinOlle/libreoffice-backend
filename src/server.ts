import app from "~/app";

import { LAUNCH, loadEnv } from "~/lib";

// --- Load environment variables
loadEnv();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`${LAUNCH}${PORT}`);
});
