import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@asgardeo/auth-react";

import Layout from "@/components/Layout";
import ProjectList from "@/pages/ProjectList";
import CreateProject from "@/pages/CreateProject";
import Projects from "@/pages/Projects";
import Workforce from "@/pages/Workforce";
import MaterialsEquipment from "@/pages/MaterialsEquipment";
import SuppliersProcurement from "@/pages/SuppliersProcurement";
import Suppliers from "@/pages/Suppliers";
import CreateSupplier from "@/pages/CreateSupplier";
import SupplierAdmin from "@/pages/SupplierAdmin";
import SupplierStore from "@/pages/SupplierStore";
import Stock from "@/pages/Stock";
import Marketplace from "@/pages/Marketplace";
import Construction from "@/pages/Construction";
import ConstructionLayout from "@/components/sections/ConstructionLayout";
import SuppliersLayout from "@/components/sections/SuppliersLayout";
import TaskManagement from "@/pages/TaskManagement";
import IssuesDefects from "@/pages/IssuesDefects";
import ProjectFinance from "@/pages/ProjectFinance";

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
          {/* Projects - standardized routes */}
          <Route path="/projects" element={<ProtectedRoute><ConstructionLayout><ProjectList /></ConstructionLayout></ProtectedRoute>} />
          <Route path="/projects/create" element={<ProtectedRoute><ConstructionLayout><CreateProject /></ConstructionLayout></ProtectedRoute>} />

          {/* Project dashboard routes (overview, tasks, issues, finance, materials) */}
          <Route path="/projects/:projectId/overview" element={<ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>} />
          <Route path="/projects/:projectId/tasks" element={<ProtectedRoute><Layout><TaskManagement /></Layout></ProtectedRoute>} />
          <Route path="/projects/:projectId/issues" element={<ProtectedRoute><Layout><IssuesDefects /></Layout></ProtectedRoute>} />
          <Route path="/projects/:projectId/finance" element={<ProtectedRoute><Layout><ProjectFinance /></Layout></ProtectedRoute>} />
          <Route path="/projects/:projectId/materials" element={<ProtectedRoute><Layout><MaterialsEquipment /></Layout></ProtectedRoute>} />

          {/* Workforce - global and per-project */}
          <Route path="/workforce" element={<ProtectedRoute><Layout><Workforce /></Layout></ProtectedRoute>} />
          <Route path="/projects/:projectId/workforce" element={<ProtectedRoute><Layout><Workforce /></Layout></ProtectedRoute>} />
          <Route path="/materials-equipment" element={<ProtectedRoute><Layout><MaterialsEquipment /></Layout></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><SuppliersLayout><Suppliers /></SuppliersLayout></ProtectedRoute>} />
          <Route path="/suppliers/create" element={<ProtectedRoute><SuppliersLayout><CreateSupplier /></SuppliersLayout></ProtectedRoute>} />
          <Route path="/suppliers/:id/admin" element={<ProtectedRoute><SuppliersLayout><SupplierAdmin /></SuppliersLayout></ProtectedRoute>} />
          <Route path="/suppliers/:id/store" element={<ProtectedRoute><ConstructionLayout><SupplierStore /></ConstructionLayout></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><ConstructionLayout><Marketplace /></ConstructionLayout></ProtectedRoute>} />
          <Route path="/stock" element={<ProtectedRoute><ConstructionLayout><Stock /></ConstructionLayout></ProtectedRoute>} />
          <Route path="/construction" element={<ProtectedRoute><ConstructionLayout><Construction /></ConstructionLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
