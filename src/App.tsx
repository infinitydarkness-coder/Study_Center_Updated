import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import StudentUpload from "./pages/StudentUpload";
import StudentMaterials from "./pages/StudentMaterials";
import StudentCourses from "./pages/StudentCourses";
import StudentAIRoadmap from "./pages/StudentAIRoadmap";
import StudentProfile from "./pages/StudentProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPending from "./pages/AdminPending";
import AdminUsers from "./pages/AdminUsers";
import AdminCourses from "./pages/AdminCourses";
import AdminSubjects from "./pages/AdminSubjects";
import AdminCategories from "./pages/AdminCategories";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Student routes */}
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/upload" element={<ProtectedRoute requiredRole="student"><StudentUpload /></ProtectedRoute>} />
            <Route path="/dashboard/materials" element={<ProtectedRoute requiredRole="student"><StudentMaterials /></ProtectedRoute>} />
            <Route path="/dashboard/courses" element={<ProtectedRoute requiredRole="student"><StudentCourses /></ProtectedRoute>} />
            <Route path="/dashboard/roadmap" element={<ProtectedRoute requiredRole="student"><StudentAIRoadmap /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute requiredRole="student"><StudentProfile /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/pending" element={<ProtectedRoute requiredRole="admin"><AdminPending /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute requiredRole="admin"><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/subjects" element={<ProtectedRoute requiredRole="admin"><AdminSubjects /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute requiredRole="admin"><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
