import express from "express";

import { convertDocument } from "~/controllers";

const conversionRouter = express.Router();

conversionRouter.post("/convert", convertDocument);

export { conversionRouter };
