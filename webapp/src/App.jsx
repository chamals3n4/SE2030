import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Layout from "@/components/Layout"
import Projects from "@/pages/Projects"
import Workforce from "@/pages/Workforce"
import MaterialsEquipment from "@/pages/MaterialsEquipment"
import SuppliersProcurement from "@/pages/SuppliersProcurement"
import TaskManagement from "@/pages/TaskManagement"
import IssuesDefects from "@/pages/IssuesDefects"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<Projects />} />
          <Route path="workforce" element={<Workforce />} />
          <Route path="materials-equipment" element={<MaterialsEquipment />} />
          <Route path="suppliers-procurement" element={<SuppliersProcurement />} />
          <Route path="task-management" element={<TaskManagement />} />
          <Route path="issues-defects" element={<IssuesDefects />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
