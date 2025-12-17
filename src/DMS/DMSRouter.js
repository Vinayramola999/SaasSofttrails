import { Routes, Route, Navigate } from "react-router-dom";
import DmsSetup from "./Setup/DMSSetup";
import DmsUpload from "./Upload/DMSUpload";

const DMSRouter = () => (
  <Routes>
    <Route path="setup" element={<DmsSetup />} />
    <Route path="upload" element={<DmsUpload />} />
    <Route path="" element={<Navigate to="setup" replace />} />
  </Routes>
);

export default DMSRouter;
