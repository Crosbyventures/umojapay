// src/App.tsx
import { Navigate, Route, Routes } from "react-router-dom";
import Pay from "./Pay";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/pay" replace />} />
      <Route path="/pay" element={<Pay />} />
      <Route path="*" element={<Navigate to="/pay" replace />} />
    </Routes>
  );
}