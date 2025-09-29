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
import Stock from "@/pages/Stock";
import Construction from "@/pages/Construction";
import ConstructionLayout from "@/components/sections/ConstructionLayout";
import SuppliersLayout from "@/components/sections/SuppliersLayout";
import TaskManagement from "@/pages/TaskManagement";
import IssuesDefects from "@/pages/IssuesDefects";
import ProjectFinance from "@/pages/ProjectFinance";
import Marketplace from "@/pages/Marketplace";

import ProtectedRoute from "./components/protected-route";
import Hero from "./pages/Hero";
import { ThemeProvider } from "@/components/theme-provider";

const config = {
  signInRedirectURL: import.meta.env.VITE_SIGN_IN_REDIRECT_URL || "http://localhost:5173",
  signOutRedirectURL: import.meta.env.VITE_SIGN_OUT_REDIRECT_URL || "http://localhost:5173",
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID || "Spm02GPGHLMTNq4OP_kl6OXeAzQa",
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL || "https://api.asgardeo.io/t/s3n4",
  scope: ["openid", "profile"],
};

function App() {
  return (
    <AuthProvider config={config}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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

            {/* Workforce - moved to Construction section */}
            <Route path="/workforce" element={<ProtectedRoute><ConstructionLayout><Workforce /></ConstructionLayout></ProtectedRoute>} />
            <Route path="/construction/employees" element={<ProtectedRoute><ConstructionLayout><Workforce /></ConstructionLayout></ProtectedRoute>} />
            <Route path="/materials-equipment" element={<ProtectedRoute><Layout><MaterialsEquipment /></Layout></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><SuppliersLayout><Suppliers /></SuppliersLayout></ProtectedRoute>} />
            <Route path="/suppliers/create" element={<ProtectedRoute><SuppliersLayout><CreateSupplier /></SuppliersLayout></ProtectedRoute>} />
            <Route path="/suppliers/:id/admin" element={<ProtectedRoute><SuppliersLayout><SupplierAdmin /></SuppliersLayout></ProtectedRoute>} />
            <Route path="/construction/marketplace" element={<ProtectedRoute><ConstructionLayout><Marketplace /></ConstructionLayout></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute><ConstructionLayout><Stock /></ConstructionLayout></ProtectedRoute>} />
            <Route path="/construction" element={<ProtectedRoute><ConstructionLayout><Construction /></ConstructionLayout></ProtectedRoute>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
