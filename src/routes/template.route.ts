import express from "express";
import multer from "multer";

import { generateDocument } from "~/controllers";

const templateRouter = express.Router();
const upload = multer({ dest: "uploads/" });

templateRouter.post(
  "/generate-dynamic-document",
  upload.single("file"),
  generateDocument
);

export { templateRouter };
