import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/convert", async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, format } = req.body;
    const inputPath = path.join(__dirname, "input.docx");
    const outputPath = path.join(__dirname, `output.${format || "pdf"}`);

    fs.writeFileSync(inputPath, content);

    exec(
      `libreoffice --headless --convert-to ${format} "${inputPath}" --outdir "${__dirname}"`,
      (error, _, stderr) => {
        if (error) {
          console.error("Erreur lors de la conversion :", stderr);
          return res
            .status(500)
            .json({ message: "Erreur de conversion", error: stderr });
        }

        const fileData = fs.readFileSync(outputPath);

        res.setHeader("Content-Type", `application/${format}`);
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=output.${format}`,
        );
        res.send(fileData);

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      },
    );
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ message: "Erreur lors de la conversion", error });
  }
});

app.post("/fill-template", (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    const templatePath = path.join(__dirname, "template.docx");
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.setData(data);

    try {
      doc.render();
    } catch (error) {
      console.error("Erreur lors du rendu du document :", error);
      return res
        .status(500)
        .json({ message: "Erreur lors du rendu du document", error });
    }

    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    const outputPath = path.join(__dirname, "filled-template.docx");
    fs.writeFileSync(outputPath, buffer);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=filled-template.docx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.send(buffer);
  } catch (error) {
    console.error("Erreur lors de la création du document :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création du document", error });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
