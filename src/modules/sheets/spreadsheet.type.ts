import get from "lodash.get";
import { Field, ObjectType, Root } from "type-graphql";
import { Sheet } from "./sheet.type";
import { SpreadsheetProperties } from "./spreadsheet.properties.type";

@ObjectType({ description: "The sheet model" })
export class Spreadsheet {
  @Field(_type => SpreadsheetProperties, {
    description: "The properties of the sheet. ",
    nullable: true
  })
  properties(@Root() root: any): SpreadsheetProperties {
    return get(root, "data.properties");
  }

  @Field(_type => [Sheet], {
    description: "The properties of the sheet.",
    nullable: true
  })
  sheets(@Root() root: any): Sheet[] {
    const spreadsheetId = get(root, "data.spreadsheetId");
    const sheets = get(root, "data.sheets", []).map((sheet: any) => ({
      ...sheet,
      spreadsheetId
    }));
    console.log("sheets", sheets);
    return sheets;
  }

  @Field(_type => String, {
    description: "The ID of the spreadsheet. This field is read-only. ",
    nullable: true
  })
  spreadsheetId(@Root() root: any): string | null {
    return get(root, "data.spreadsheetId");
  }

  @Field(_type => String, {
    description: "The url of the spreadsheet. This field is read-only. ",
    nullable: true
  })
  spreadsheetUrl(@Root() root: any): string | null {
    return get(root, "data.spreadsheetUrl");
  }
}
