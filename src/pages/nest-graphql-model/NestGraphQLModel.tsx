/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import "./NestGraphQLModel.css";

type Records = { [key: string]: string | undefined };

export const NestGraphQLModel = () => {
  const [swagger, setSwagger] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);

  return (
    <div>
      <form>
        <div className="row">
          <textarea
            name="fancy-textarea"
            id="fancy-textarea"
            value={swagger}
            onChange={({ target: { value } }) => setSwagger(value)}
          ></textarea>
          <label htmlFor="fancy-textarea">Swagger.json</label>
        </div>
        <div className="row">
          <input
            type="text"
            name="fancy-text"
            id="fancy-text"
            value={name}
            onChange={({ target: { value } }) => setName(value)}
          />
          <label htmlFor="fancy-text">Name</label>
        </div>
      </form>
      <div>NestGraphQLModel</div>
      <button
        onClick={() => {
          var range = document.createRange();
          var node = document.getElementById("code_div");
          range.selectNode(node!); //changed here
          window!.getSelection()!.removeAllRanges();
          window!.getSelection()!.addRange(range);
          document.execCommand("copy");
          window!.getSelection()!.removeAllRanges();
        }}
      >
        Copy
      </button>
      <pre id="code_div" className="code">
        {convert(name, swagger)}
      </pre>
    </div>
  );
};

function convert(
  name: string | undefined,
  swagger: string | undefined
): string {
  if (!name) {
    return "";
  }
  if (!swagger) {
    return "";
  }
  const rendered: string[] = [];
  const swaggerJson = JSON.parse(swagger);
  return `
/* eslint-disable max-classes-per-file */
import { Field, Float, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
  
${render(name, swaggerJson, rendered)}  
  `;
}

function render(name: string, swaggerJson: any, rendered: string[]): string {
  const schemas = swaggerJson.components.schemas;
  // find target schema
  const CLASS = (schemas as any)[name];

  if (CLASS.type === "object") {
    return renderObject(name, CLASS.properties, swaggerJson, rendered);
  }
  if (CLASS.enum) {
    return renderEnum(name, CLASS, rendered);
  }
  console.log("error on type");
  console.log(CLASS);
  throw "Unsupported type: " + CLASS;
}

function renderObject(
  name: string,
  properties: any,
  swaggerJson: any,
  rendered: string[]
): string {
  const keys = Object.keys(properties);
  const otherClasses: string[] = [];
  const rows: string[] = [];
  for (const key of keys) {
    const def = properties[key];
    if (def.type === "array") {
      // render array
      // find def name
      const parts = def.items.$ref.split("/");
      const defName = parts[parts.length - 1];
      otherClasses.push(render(defName, swaggerJson, rendered));
      rows.push(renderPropertyArray(key, defName, def.nullable));
    } else if (def.type) {
      // render property
      rows.push(renderProperty(key, def));
    } else {
      // render another object
      // find def name
      const parts = def.allOf[0].$ref.split("/");
      const defName = parts[parts.length - 1];
      otherClasses.push(render(defName, swaggerJson, rendered));
      rows.push(renderPropertyClass(key, defName, def.nullable));
    }
  }

  const template = `
        @ObjectType()
        export class ${getRenderName(name)} {

          ${rows.join("\n")}
          
        }
        `;

  return [template, ...otherClasses].join("\n");
}

function renderEnum(name: string, ref: any, rendered: string[]) {
  if (rendered.indexOf(name) !== -1) {
    return "";
  } else {
    rendered.push(name);
  }
  // render enum
  return `
    export enum ${getRenderName(name)} {
        ${ref.enum
          .map((item: string) => item + " = " + `"${item}",`)
          .join("\n")}
    }

    registerEnumType(${getRenderName(name)}, { name: "${getRenderName(
      name
    )}" });
    `;
}

function renderProperty(key: string, property: any): string {
  const ts: Records = {
    string: "string",
    number: "number",
    integer: "number",
  };
  const gql: Records = {
    string: "String",
    number: "Float",
    integer: "Int",
  };

  const nullable = property.nullable ? `, { nullable: true }` : "";

  let gqlType = gql[property.type];

  if (property.type === "integer" && property.format === "int64") {
    gqlType = "Float";
  }

  return `
                @Field(() => ${gqlType}${nullable})
                ${key}: ${ts[property.type]};`;
}

function renderPropertyArray(
  key: string,
  type: string,
  isNullable: boolean
): string {
  const nullable = isNullable ? `, { nullable: true }` : "";
  return `
                @Field(() => [${getRenderName(type)}]${nullable})
                ${key}: ${getRenderName(type)}[];`;
}

function renderPropertyClass(key: string, type: string, isNullable: boolean) {
  const nullable = isNullable ? `, { nullable: true }` : "";
  return `
                @Field(() => ${getRenderName(type)}${nullable})
                ${key}: ${getRenderName(type)};`;
}

function getRenderName(name: string): string {
  const regex = /\w+\d/;
  let renderName = name;
  if (regex.test(name)) {
    renderName = name.slice(0, name.length - 1);
  }
  return renderName;
}
