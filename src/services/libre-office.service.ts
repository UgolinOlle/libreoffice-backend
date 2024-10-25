import { exec } from "child_process";

export const convertToFormat = (
  inputPath: string,
  outputPath: string,
  format: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(
      `libreoffice --headless --convert-to ${format} "${inputPath}" --outdir "${outputPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Erreur lors de la conversion :", stderr);
          reject(stderr);
        } else {
          resolve();
        }
      },
    );
  });
};
