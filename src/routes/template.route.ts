import express from "express";

import { generateDocument } from "~/controllers";

const templateRouter = express.Router();

templateRouter.post("/generate-dynamic-document", generateDocument);

export { templateRouter };
