import get from "lodash.get";
import { Field, ObjectType, Root } from "type-graphql";
import { ListValue } from "./list.value.type";
import { Dimension } from "./sheet.dimension.enum";

@ObjectType({ description: `Data within a range of the spreadsheet.` })
export class ValueRange {
  @Field(_type => String, {
    description: `The range the values cover, in A1 notation. For output, this range indicates the entire requested range, even though the values will exclude trailing rows and columns. When appending values, this field represents the range to search for a table, after which values will be appended. `
  }) // it's very important
  range(@Root() root: any): string {
    return get(root, "data.range");
  }

  @Field(_type => Dimension) // it's very important
  majorDimension(@Root() root: any): string {
    const type = get(root, "data.majorDimension");
    return type ? Dimension[type] : Dimension.DIMENSION_UNSPECIFIED;
  }

  @Field(_type => [ListValue]) // it's very important
  values(@Root() root: any): string {
    const values = get(root, "data.values", []).map(
      (data: [string], index: number) => {
        return {
          data,
          index
        };
      }
    );
    return values;
  }
}
