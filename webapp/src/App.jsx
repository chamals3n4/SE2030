import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@asgardeo/auth-react";

import Layout from "@/components/Layout";
import ProjectList from "@/pages/ProjectList";
import CreateProject from "@/pages/CreateProject";
import Projects from "@/pages/Projects";
import Workforce from "@/pages/Workforce";
import MaterialsEquipment from "@/pages/MaterialsEquipment";
import SuppliersProcurement from "@/pages/SuppliersProcurement";
import TaskManagement from "@/pages/TaskManagement";
import IssuesDefects from "@/pages/IssuesDefects";

import ProtectedRoute from "./components/protected-route";
import Hero from "./pages/Hero";

const config = {
  signInRedirectURL: "http://localhost:5173",
  signOutRedirectURL: "http://localhost:5173",
  clientID: "Spm02GPGHLMTNq4OP_kl6OXeAzQa",
  baseUrl: "https://api.asgardeo.io/t/s3n4",
  scope: ["openid", "profile"],
};

function App() {
  return (
    <AuthProvider config={config}>
      <Router>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/projects-list" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
          <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>} />
          <Route path="/workforce" element={<ProtectedRoute><Layout><Workforce /></Layout></ProtectedRoute>} />
          <Route path="/materials-equipment" element={<ProtectedRoute><Layout><MaterialsEquipment /></Layout></ProtectedRoute>} />
          <Route path="/suppliers-procurement" element={<ProtectedRoute><Layout><SuppliersProcurement /></Layout></ProtectedRoute>} />
          <Route path="/task-management" element={<ProtectedRoute><Layout><TaskManagement /></Layout></ProtectedRoute>} />
          <Route path="/issues-defects" element={<ProtectedRoute><Layout><IssuesDefects /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
