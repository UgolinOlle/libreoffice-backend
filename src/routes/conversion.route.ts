import express from "express";
import multer from "multer";
import { convertDocument } from "~/controllers";

const conversionRouter = express.Router();
const upload = multer({ dest: "uploads/" });

conversionRouter.post("/convert", upload.single("file"), convertDocument);

export { conversionRouter };
