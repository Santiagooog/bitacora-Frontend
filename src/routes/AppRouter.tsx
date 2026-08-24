import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { LoginPage } from "../pages/LoginPage";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { CasosPage } from "../pages/casos/CasosPage";
import { CreateCasoPage } from "../pages/casos/CreateCasoPage";
import { CasoDetailPage } from "../pages/casos/CasoDetailPage";
import { EditCasoPage } from "../pages/casos/EditCasoPage";
import  { UsuariosPage }  from "../pages/usuarios/UsuariosPage"; // ✅ nuevo import

export const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/casos" element={<CasosPage />} />
            <Route path="/casos/crear" element={<CreateCasoPage />} />
            <Route path="/casos/:id" element={<CasoDetailPage />} />
            <Route path="/casos/:id/editar" element={<EditCasoPage />} />

            {/* ✅ Ruta solo para administradores */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};