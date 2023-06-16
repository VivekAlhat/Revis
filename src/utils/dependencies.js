import * as fs from "fs";
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
import { resolve, extname } from "path";

const traverse = _traverse.default;

const extractComponentDependencies = (filepath) => {
  let dependencies = [];
  const code = fs.readFileSync(filepath, "utf-8");

  const PARSER_OPTIONS = {
    sourceType: "module",
    plugins: ["jsx"],
  };

  const AST = parser.parse(code, PARSER_OPTIONS);

  traverse(AST, {
    ImportDeclaration: ({ node }) => {
      const dependency = node.source.value;
      const component = getComponentName(dependency);

      if (extname(dependency) === ".css") {
        return;
      }

      dependencies.push({
        component,
        path: dependency,
      });
    },
  });

  return dependencies;
};

const getComponentName = (dependency) => {
  return dependency.split("/").pop();
};

const filepath = resolve("src/App.jsx");
const dependencies = extractComponentDependencies(filepath);
console.log(dependencies);
