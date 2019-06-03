import get from "lodash.get";
import { Field, ObjectType, Root } from "type-graphql";

@ObjectType({ description: "The sheet properties model" })
export class SpreadsheetProperties {
  @Field(_type => String, {
    description: `
    The locale of the spreadsheet in one of the following formats:
        an ISO 639-1 language code such as en
        an ISO 639-2 language code such as fil, if no 639-1 code exists
        a combination of the ISO language code and country code, such as en_US
    Note: when updating this field, not all locales/languages are supported.
`
  }) // it's very important
  locale(@Root() root: any): string {
    return get(root, "locale");
  }

  @Field(_type => String, {
    description: `The time zone of the spreadsheet, in CLDR format such as America/New_York. 
      If the time zone isn't recognized, this may be a custom time zone such as GMT-07:00.`
  }) // it's very important
  timeZone(@Root() root: any): string {
    return get(root, "timeZone");
  }

  @Field(_type => String, { description: "The title of the spreadsheet. " }) // it's very important
  title(@Root() root: any): string {
    return get(root, "title");
  }

  //   "title": string,
  //   "locale": string,
  //   "autoRecalc": enum(RecalculationInterval),
  //   "timeZone": string,
  //   "defaultFormat": {
  //     object(CellFormat)
  //   },
  //   "iterativeCalculationSettings": {
  //     object(IterativeCalculationSettings)
  //   }
}
