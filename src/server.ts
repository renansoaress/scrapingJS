import axios from "axios";
import * as cheerio from "cheerio";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { sendMyBot } from "./api";
import path from "path";
import bodyParser from "body-parser";
import storage from "node-persist";

interface dataProps {
  url: string;
  path: string;
  message: string;
  isAvailable: boolean; // "Disponível" | "Indisponível"
  ["value"]: string;
}

dotenv.config();

const app: Express = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const port = process.env.PORT || 3000;
const pw = process.env.PW || 123;
const api = process.env.API || "";
// let interval: NodeJS.Timer | null = null;

const getInfo = async () => {
  await storage.forEach(async (store) => {
    const dataValue: dataProps = store.value;
    try {
      const { data } = await axios.get(dataValue.url, { timeout: 30000 });
      const $ = cheerio.load(data);
      const element = $(dataValue.path);
      if (element.length && !element.attr("disabled")) {
        sendMyBot(api, `${dataValue.message} => ${dataValue.url}`);
        dataValue.isAvailable = true;
      } else {
        dataValue.isAvailable = false;
      }
      await storage.updateItem(store.key, dataValue);
    } catch (error) {
      throw error;
    }
  });
};

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "/view/index.html"));
});

app.get("/store", async (req: Request, res: Response) => {
  const listStore: dataProps[] = [];
  try {
    await storage.forEach(async (store) => {
      listStore.push({ ...store.value, key: store.key });
    });
    res.send(listStore);
  } catch (e) {
    res.send(listStore);
  }
});

app.get("/add", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "/view/add.html"));
});

app.get("/clear", async (req: Request, res: Response) => {
  await storage.clear();
  res.redirect("/");
});

app.post("/add", urlencodedParser, async (req, res) => {
  const { url, path, message, password } = req.body;
  if (url && path && message && password === pw) {
    await storage.setItem(`${new Date().getTime()}`, {
      url,
      path,
      message,
    });
  }
  res.redirect("/");
});

app.listen(port, async () => {
  await storage.init();
  setInterval(async () => {
    // console.log("RODANDO...");
    getInfo()
      .then(() => console.log("getInfo - ok"))
      .catch((e) => console.log("error>> ", e));
  }, 40000);
  console.log(`[server start - PORT(${port})]`);
});
