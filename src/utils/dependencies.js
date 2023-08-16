import * as fs from "fs";
import * as os from "os";
import * as parser from "@babel/parser";
import _traverse from "@babel/traverse";
import { resolve, extname, dirname, relative } from "path";

const traverse = _traverse.default;

const getComponentDependencies = (filepath) => {
  const dependencies = [];
  const used = new Set();
  const code = fs.readFileSync(filepath, "utf-8");

  const PARSER_OPTIONS = {
    sourceType: "module",
    plugins: ["jsx"],
  };

  const AST = parser.parse(code, PARSER_OPTIONS);

  traverse(AST, {
    ImportDeclaration: ({ node }) => {
      const dependency = node.source.value;
      const specifiers = node.specifiers;

      getDependencies(dependency, specifiers, dependencies);
    },
    JSXIdentifier: ({ node }) => {
      used.add(node.name);
    },
    CallExpression: ({ node }) => {
      used.add(node.callee.name);
    },
    MemberExpression: ({ node }) => {
      used.add(node.object.name);
    },
  });

  const updatedDependencies = dependencies.map((dependency) => {
    const isUsed = used.has(dependency.component);

    if (dependency.type === "CSS" || dependency.type === "JSON") {
      return {
        ...dependency,
        isUsed: true,
      };
    }

    return {
      ...dependency,
      isUsed,
    };
  });

  return updatedDependencies;
};

const getComponentType = (dependency) => {
  if (extname(dependency) === ".css") {
    return "CSS";
  } else if (extname(dependency) === ".json") {
    return "JSON";
  }
  return "Component";
};

const getImportType = (type) => {
  if (type === "ImportSpecifier") {
    return "Named";
  }
  return "Default";
};

const getDependencies = (dependency, specifiers, dependencies) => {
  const type = getComponentType(dependency);

  if (specifiers.length > 0) {
    if (extname(dependency) === ".json") {
      dependencies.push({
        component: dependency,
        type,
        path: dependency,
        import: "JSON",
      });
      return;
    }

    specifiers.map((specifier) => {
      const specifierType = specifier.type;
      const component = specifier.local.name;
      const importType = getImportType(specifierType);

      dependencies.push({
        component,
        type,
        path: dependency,
        import: importType,
      });
    });
  } else {
    if (extname(dependency) === ".css") {
      dependencies.push({
        component: dependency,
        type,
        path: dependency,
        import: "Stylesheet",
      });
    }
  }
};

const getComponentDependenciesRecursive = (folder, componentDependencies) => {
  const files = fs.readdirSync(folder);

  files.forEach((file) => {
    const filePath = resolve(folder, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      getComponentDependenciesRecursive(filePath, componentDependencies);
    } else {
      if (extname(filePath) === ".jsx") {
        const directory = relative(".", dirname(filePath)).replace(/\\/g, "/");
        const dependencies = getComponentDependencies(filePath);
        let name = null;
        if (os.platform() === "win32") {
          name = filePath.split("\\").pop();
        } else {
          name = filePath.split("/").pop();
        }
        componentDependencies.push({ directory, name, dependencies });
      }
    }
  });
  return componentDependencies;
};

const folder = resolve("src");
const componentDependencies = [];
const deps = getComponentDependenciesRecursive(folder, componentDependencies);

fs.writeFile("./dependencies.json", JSON.stringify(deps), "utf-8", (err) => {
  if (err) {
    console.error("Error writing JSON file:", err);
    return;
  }
  console.log("JSON file has been saved.");
});

export { deps };
