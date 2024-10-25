import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export const fillTemplate = (templatePath: string, data: any): Buffer => {
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
    throw error;
  }

  return doc.getZip().generate({ type: "nodebuffer" });
};
