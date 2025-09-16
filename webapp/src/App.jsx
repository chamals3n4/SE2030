import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import ProjectList from "@/pages/ProjectList"
import CreateProject from "@/pages/CreateProject"
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
        {/* isolate project list page ( CRUD ) */}
        <Route path="/" element={<ProjectList />} />
        <Route path="/projects-list" element={<ProjectList />} />
        <Route path="/create-project" element={<CreateProject />} />

        {/* dashboard */}
        <Route path="/" element={<Layout />}>
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
