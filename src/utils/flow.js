import * as fs from "fs";
import { deps as data } from "./dependencies.js";

const prepareFlowData = () => {
  const flow = {
    nodes: [],
    edges: [],
  };

  data.forEach((item) => {
    const { name, dependencies, directory } = item;

    const node = {
      id: name,
      type: "default",
      data: { label: name },
      position: { x: 0, y: 0 },
    };

    const directoryNode = {
      id: directory,
      type: "default",
      data: { label: directory },
      style: { backgroundColor: "#D5FFD0" },
      position: { x: 0, y: 0 },
    };

    flow.nodes.push(node);
    flow.nodes.push(directoryNode);

    const sourceNodeId = directory;
    const targetNodeId = name;
    const edge = {
      id: `${sourceNodeId}-${targetNodeId}`,
      source: sourceNodeId,
      target: targetNodeId,
      type: "default",
    };

    flow.edges.push(edge);

    dependencies.forEach((dependency) => {
      const { component, isUsed, type } = dependency;
      const isNotAComponent = type === "CSS" || type === "JSON";
      const depNode = {
        id: component,
        type: "default",
        data: { label: component },
        position: { x: 0, y: 0 },
        style: { backgroundColor: isNotAComponent && "#FDE5EC" },
      };

      flow.nodes.push(depNode);

      const sourceNodeId = name;
      const targetNodeId = component;
      const edge = {
        id: `${sourceNodeId}-${targetNodeId}`,
        source: sourceNodeId,
        target: targetNodeId,
        animated: isUsed ? false : true,
        style: {
          stroke: isUsed ? (isNotAComponent ? "#F86F03" : "#000") : "#ff0505",
        },
        type: "default",
      };

      flow.edges.push(edge);
    });
  });

  fs.writeFile("./data.json", JSON.stringify(flow), "utf-8", (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
      return;
    }
    console.log("JSON file has been saved.");
  });
};

prepareFlowData();
