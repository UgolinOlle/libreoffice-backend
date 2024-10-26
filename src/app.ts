import express from "express";
import bodyParser from "body-parser";

import { conversionRouter, templateRouter } from "~/routes";
import { BASE_API_URL } from "~/lib";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(BASE_API_URL, conversionRouter);
app.use(BASE_API_URL, templateRouter);

export default app;
