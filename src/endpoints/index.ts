import fs from "fs";
import { google } from "googleapis";
import { join } from "path";
import readline from "readline";
import util from "util";


const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = join(__dirname, "token.json");

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export const getAuthClient = async () => {
  try {
    const credentials: any = await readFile(
      join(__dirname, "credentials.json")
    );
    const { client_secret, client_id, redirect_uris } = JSON.parse(
      credentials
    ).installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
    let token: any;
    try {
      token = await readFile(TOKEN_PATH);
    } catch (error) {
      token = await getNewToken(oAuth2Client);
      await writeFile(TOKEN_PATH, JSON.stringify(token));
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (error) {
    console.log("Error loading client secret file:", error);
  }
  return null;
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
const getNewToken = async (oAuth2Client: any) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", async code => {
    rl.close();
    const token = await oAuth2Client.getToken(code);
    return token;
  });
  return null;
};

