import { google } from "googleapis";
import get from "lodash.get";
import { Arg, Field, ObjectType, Root } from "type-graphql";
import { getAuthClient } from "../../endpoints/index";
import { Dimension } from './sheet.dimension.enum';
import { SheetProperties } from "./sheet.properties.type";
import { ValueRange } from "./value.range.type";

@ObjectType({ description: "The sheet model" })
export class Sheet {
  @Field(_type => SheetProperties, {
    description: "The properties of the sheet. "
  })
  properties(@Root() root: any): SheetProperties {
    return get(root, "properties");
  }

  @Field(_type => ValueRange, { description: "The properties of the sheet. ", nullable: true })
  async valueRange(
    @Root() root: any,
    @Arg("range", {
      description: `The range the values cover, in A1 notation. For output, this range indicates the entire requested range, even though the values will exclude trailing rows and columns. When appending values, this field represents the range to search for a table, after which values will be appended. `
    })
    range: string,
    @Arg("majorDimension", {
      description: `The major dimension of the values.

      For output, if the spreadsheet data is: A1=1,B1=2,A2=3,B2=4, then requesting range=A1:B2,majorDimension=ROWS will return [[1,2],[3,4]], whereas requesting range=A1:B2,majorDimension=COLUMNS will return [[1,3],[2,4]].
      
      For input, with range=A1:B2,majorDimension=ROWS then [[1,2],[3,4]] will set A1=1,B1=2,A2=3,B2=4. With range=A1:B2,majorDimension=COLUMNS then [[1,2],[3,4]] will set A1=1,B1=3,A2=2,B2=4.
      
      When writing, if this field is not set, it defaults to ROWS.`,
      nullable: true
    })
    majorDimension: Dimension = Dimension.ROWS
  ) {
    const authClient = await getAuthClient();
    const sheets = google.sheets("v4");
    const title = get(root, "properties.title")
    const spreadsheetId = get(root, 'spreadsheetId')
    const request: any = {
      // The ID of the spreadsheet to retrieve data from.
      spreadsheetId, // TODO: Update placeholder value.

      // The A1 notation of the values to retrieve.
      range: `${title}!${range}`, // TODO: Update placeholder value.

      majorDimension,
      // How values should be represented in the output.
      // The default render option is ValueRenderOption.FORMATTED_VALUE.
      // valueRenderOption: "", // TODO: Update placeholder value.

      // How dates, times, and durations should be represented in the output.
      // This is ignored if value_render_option is
      // FORMATTED_VALUE.
      // The default dateTime render option is [DateTimeRenderOption.SERIAL_NUMBER].
      // dateTimeRenderOption: "", // TODO: Update placeholder value.

      auth: authClient
    };
    try {
      const valueRange = await sheets.spreadsheets.values.get(request);
      return valueRange;
    } catch (error) {
      return null
    }
  }
}
