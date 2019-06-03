import { google } from "googleapis";
import { Arg, Query } from "type-graphql";
import { getAuthClient } from "../../endpoints/index";
import { Spreadsheet } from "./spreadsheet.type";

export class SpreadsheetResolver {
  @Query(_returns => Spreadsheet)
  async spreadsheet(@Arg("spreadsheetId") spreadsheetId: string) {
    const authClient = await getAuthClient();
    const sheets = google.sheets("v4");

    const request: any = {
      // The spreadsheet to request.
      spreadsheetId, // TODO: Update placeholder value.
      // The ranges to retrieve from the spreadsheet.
      ranges: [], // TODO: Update placeholder value.
      // True if grid data should be returned.
      // This parameter is ignored if a field mask was set in the request.
      includeGridData: false, // TODO: Update placeholder value.
      auth: authClient
    };

    const spreadsheets = await sheets.spreadsheets.get(request)
    return spreadsheets
  }
}
