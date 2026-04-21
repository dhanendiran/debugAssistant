import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import DebugView from "./DebugView";
import History from "./History";
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/debug/:id" element={<DebugView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
