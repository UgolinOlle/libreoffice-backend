import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import { Logger } from "~/lib";

// Fonction pour générer le XML du tableau
const generateTableXML = (headers: string[], tableData: { values: any[] }[]): string => {
  let xml = '<w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">';
  
  // Propriétés du tableau
  xml += '<w:tblPr>';
  xml += '<w:jc w:val="center"/>'; // Centrer le tableau
  xml += '<w:tblBorders>';
  xml += '<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>'; // Bord supérieur
  xml += '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>'; // Bord inférieur
  xml += '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>'; // Bordures intérieures horizontales
  xml += '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>'; // Bordures intérieures verticales
  xml += '</w:tblBorders>';
  xml += '</w:tblPr>';
  
  // Définir la grille du tableau
  xml += '<w:tblGrid>';
  headers.forEach(() => {
    xml += '<w:gridCol w:w="0"/> '; // Largeur de colonne ajustée pour remplir l'espace
  });
  xml += '</w:tblGrid>';

  // Ajouter les lignes de données
  // Ligne d'en-tête avec fond bleu
  xml += '<w:tr>';
  headers.forEach(header => {
    xml += '<w:tc>';
    xml += '<w:tcPr>';
    xml += '<w:shd w:fill="0070C0"/> '; // Couleur de fond bleu
    xml += '<w:tcBorders>';
    xml += '<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>'; // Bord supérieur
    xml += '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>'; // Bord inférieur
    xml += '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>'; // Bordures intérieures horizontales
    xml += '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>'; // Bordures intérieures verticales
    xml += '</w:tcBorders>';
    xml += '</w:tcPr>';
    xml += `<w:p><w:r><w:t style="color:#FF0000; font-weight:bold;">${header}</w:t></w:r></w:p>`; // Texte en blanc
    xml += '</w:tc>';
  });
  xml += '</w:tr>';

  // Ajouter les données
  const maxRows = Math.max(...tableData.map(row => row.values.length));
  for (let i = 0; i < maxRows; i++) {
    xml += '<w:tr>';
    headers.forEach((_, index) => {
      const value = tableData[index]?.values[i] || ""; // Récupérer la valeur ou une chaîne vide
      xml += `<w:tc><w:p><w:r><w:t>${value}</w:t></w:r></w:p></w:tc>`;
    });
    xml += '</w:tr>';
  }

  xml += '</w:tbl>';
  return xml;
};

export const generateDocumentFromTemplate = async (
  templatePath: string,
  client: any,
  formattedTableData: { list_name: string; values: any[] }[],
): Promise<Buffer> => {
  const templateContent = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(templateContent);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "$", end: "$" },
    nullGetter: () => "",
  });
  const tableXML = generateTableXML(formattedTableData.map(row => row.list_name), formattedTableData);
  const data = {
    ...client,
    tableXml: tableXML,
  };

  doc.setData(data);

  try {
    doc.render();
  } catch (error: any) {
    Logger.send("ERROR", `Error rendering document: ${error}`);
    if (error.properties && error.properties.errors) {
      Logger.send(
        "ERROR",
        `Details of the errors: ${JSON.stringify(error.properties.errors)}`,
      );
    }
    throw error;
  }

  return doc.getZip().generate({ type: "nodebuffer" });
};
