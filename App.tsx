import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Timetable from "./pages/Timetable";
import Classrooms from "./pages/Classrooms";
import Courses from "./pages/Courses";
import ManageTimetable from "./pages/ManageTimetable";
import SwapClasses from "./pages/SwapClasses";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Role-based landing: students go to timetable, others to dashboard */}
              <Route index element={<Home />} />
              {/* Dashboard for instructors/admins */}
              <Route path="dashboard" element={
                <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="timetable" element={
                <ProtectedRoute allowedRoles={["admin", "instructor", "student"]}>
                  <Timetable />
                </ProtectedRoute>
              } />
              <Route path="manage-timetable" element={
                <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                  <ManageTimetable />
                </ProtectedRoute>
              } />
              <Route path="swap-classes" element={
                <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                  <SwapClasses />
                </ProtectedRoute>
              } />
              <Route path="classrooms" element={
                <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                  <Classrooms />
                </ProtectedRoute>
              } />
              <Route path="courses" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Courses />
                </ProtectedRoute>
              } />
              <Route path="users" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={["admin", "instructor", "student"]}>
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
