import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Tutor from "./pages/Tutor";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<Tutor />} />
    </Routes>
  );
}
