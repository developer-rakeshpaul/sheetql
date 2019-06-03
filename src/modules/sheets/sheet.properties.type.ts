import get from "lodash.get";
import { Field, Int, ObjectType, Root } from "type-graphql";
import { SheetType } from "./sheet.type.enum";

@ObjectType({ description: "The sheet properties model" })
export class SheetProperties {
  @Field(_type => SheetType) // it's very important
  sheetType(@Root() root: any): string {
    const type = get(root, "sheetType")
    return type ? SheetType[type] : SheetType.SHEET_TYPE_UNSPECIFIED;
  }

  @Field(_type => Boolean, {
    description:
      "True if the sheet is hidden in the UI, false if it's visible. "
  })
  hidden(@Root() root: any): boolean {
    return get(root, "hidden", false);
  }

  @Field(_type => Boolean, {
    description: "True if the sheet is an RTL sheet instead of an LTR sheet."
  })
  rightToLeft(@Root() root: any): boolean {
    return get(root, "rightToLeft", false);
  }

  @Field(_type => Int, {
    description:
      "The ID of the sheet. Must be non-negative. This field cannot be changed once set. ",
    nullable: true
  })
  sheetId(@Root() root: any): number | 0 {
    return get(root, "sheetId");
  }

  @Field(_type => String, {
    description: "The name of the sheet.",
    nullable: true
  })
  title(@Root() root: any): string | null {
    return get(root, "title");
  }

  @Field(_type => Int, {
    description: `The index of the sheet within the spreadsheet. When adding or updating sheet properties, if this field is excluded then the sheet is added or moved to the end of the sheet list. When updating sheet indices or inserting sheets, movement is considered in "before the move" indexes. For example, if there were 3 sheets (S1, S2, S3) in order to move S1 ahead of S2 the index would have to be set to 2. A sheet index update request is ignored if the requested index is identical to the sheets current index or if the requested new index is equal to the current sheet index + 1. `,
    nullable: true
  })
  index(@Root() root: any): number | 0 {
    return get(root, "indnex");
  }

  //   "gridProperties": {
  //     object(GridProperties)
  //   },
  //   "tabColor": {
  //     object(Color)
  //   },
}
