import { Response } from "express";
import { Logger } from "~/lib";

class ErrorHandler {
  static handleError(error: any, res: Response, statusCode = 500): void {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    const stack = error instanceof Error ? error.stack : null;

    Logger.send("ERROR", message);

    res.status(statusCode).json({
      status: "error",
      message,
      ...(process.env.NODE_ENV === "development" && { stack }), // Envoyer le stack trace uniquement en développement
    });
  }

  static handleValidationError(
    error: any,
    res: Response,
    customMessage: string = "Erreur de validation",
  ): void {
    Logger.send("ERROR", `${customMessage}: ${error.message}`);
    res.status(400).json({
      status: "fail",
      message: customMessage,
      details: error.message,
    });
  }

  static handleNotFoundError(res: Response, resource: string): void {
    const message = `${resource} non trouvé.`;
    Logger.send("WARN", message);
    res.status(404).json({
      status: "fail",
      message,
    });
  }

  static handleDatabaseError(
    error: any,
    res: Response,
    customMessage: string = "Erreur de la base de données",
  ): void {
    Logger.send("ERROR", `${customMessage}: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: customMessage,
      details: error.message,
    });
  }
}

export default ErrorHandler;
