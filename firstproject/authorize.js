import {authenticate} from "@google-cloud/local-auth";
import path from "path";
import fs from "fs/promises";
import {google} from "googleapis";

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");

async function authorize() {
  const client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  // Save refresh token
  const keys = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
  console.log("Token gespeichert nach", TOKEN_PATH);
}

authorize().catch(console.error);