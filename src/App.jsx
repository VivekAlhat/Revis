import Hello from "./components/Hello";
import Dummy from "./components/Dummy";
import Test from "./components/Test";
import Graph from "./Graph";
// eslint-disable-next-line no-unused-vars
import { Export1, Export2 } from "./components/MultiExports";
import "./App.css";

function App() {
  return (
    <>
      <Hello />
      <Dummy />
      <Test />
      <Graph />
    </>
  );
}

export default App;
