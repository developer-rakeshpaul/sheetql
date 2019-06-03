import { registerEnumType } from "type-graphql";
export enum SheetType {
  SHEET_TYPE_UNSPECIFIED = "SHEET_TYPE_UNSPECIFIED",
  GRID = "GRID",
  OBJECT = "OBJECT"
}

registerEnumType(SheetType, {
  name: "SheetType", // this one is mandatory
  description: "The kind of sheet. ", // this one is optional
});