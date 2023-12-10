/* eslint-disable @typescript-eslint/no-unused-vars */
const types: { [key: string]: { gql: string; ts: string } | undefined } = {
  string: {
    gql: "String",
    ts: "string",
  },
  number: {
    gql: "Float",
    ts: "number",
  },
  integer: {
    gql: "Int",
    ts: "number",
  },
  array: {
    gql: "[TODOModel]",
    ts: "TODOModel[]",
  },
};

function render(name: string, json: string) {
  const properties = JSON.parse(json);

  const keys = Object.keys(properties);
  const rows = [];
  for (const key of keys) {
    const item = properties[key];

    const nullableArgs = item.nullable ? `, { nullable: true }` : "";
    const row = `
          ${!types[item.type] ? "    // TODO: another type" : ""}
              @Field(() => ${types[item.type]?.gql}${nullableArgs})
              ${key}: ${types[item.type]?.ts};`;

    rows.push(row);
  }

  return `
        import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
      
        @ObjectType()
        export class ${name} {
      
          ${rows.join("\n")}
          
        }
        `;
}
