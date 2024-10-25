import { Request, Response } from "express";
import path from "path";
import fs from "fs";

import { convertToFormat } from "~/services/libre-office.service";

export const convertDocument = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { content, format } = req.body;
    const inputPath = path.join(__dirname, "../../input.docx");
    const outputPath = path.join(__dirname, `../../output.${format || "pdf"}`);

    fs.writeFileSync(inputPath, content);

    await convertToFormat(inputPath, outputPath, format);

    const fileData = fs.readFileSync(outputPath);

    res.setHeader("Content-Type", `application/${format}`);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=output.${format}`,
    );
    res.send(fileData);

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: "Erreur lors de la conversion", error });
  }
};
