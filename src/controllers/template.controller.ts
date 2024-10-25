import { Request, Response } from "express";
import path from "path";
import fs from "fs";

import { fillTemplate } from "~/services/docx.service";

export const generateDocument = (req: Request, res: Response): void => {
  try {
    const { data, templateName } = req.body;

    const templatePath = path.join(
      __dirname,
      `../../templates/${templateName}.docx`,
    );
    const outputPath = path.join(
      __dirname,
      `../../filled-${templateName}.docx`,
    );

    const filledBuffer = fillTemplate(templatePath, data);

    fs.writeFileSync(outputPath, filledBuffer);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=filled-${templateName}.docx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.send(filledBuffer);
  } catch (error) {
    console.error("Erreur lors de la création du document :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création du document", error });
  }
};
