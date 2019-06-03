import { registerEnumType } from "type-graphql";
export enum Dimension {
  DIMENSION_UNSPECIFIED = "DIMENSION_UNSPECIFIED",
  ROWS = "ROWS",
  COLUMNS = "COLUMNS"
}

registerEnumType(Dimension, {
  name: "Dimension", // this one is mandatory
  description: "Indicates which dimension an operation should apply to.", // this one is optional
});