import get from "axios";
import * as cheerio from "cheerio";
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { oi } from "../src/oi";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const getPostTitles = async () => {
  try {
    const { data } = await get("https://old.reddit.com/r/programming/");
    const $ = cheerio.load(data);
    const postTitles: any[] = [];

    $("div > p.title > a").each((_idx, el) => {
      const postTitle = $(el).text();
      postTitles.push(postTitle);
    });

    return postTitles;
  } catch (error) {
    throw error;
  }
};

app.get("/", (req: Request, res: Response) => {
  oi();
  getPostTitles()
    .then((postTitles) => res.send(postTitles))
    .catch(res.send);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
