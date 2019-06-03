import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class ListValue {
    @Field(_type => Int)
    index: number

    @Field(_type => [String])
    data: string[]
}