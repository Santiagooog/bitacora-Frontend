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
import { UsuariosPage } from "../pages/usuarios/UsuariosPage";
import { CategoriasPage } from "../pages/categorias/CategoriasPage";
import { AnsPage } from "../pages/ans/AnsPage";
import { CanalesPage } from "../pages/canales/CanalesPage";
import { ActivosPage } from "../pages/activos/ActivosPage";
import { SedesPage } from "../pages/sedes/SedesPage";
import { ServiciosPage } from "../pages/servicios/ServiciosPage";

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
            
            {/* Casos: Todos pueden ver la lista y el detalle */}
            <Route path="/casos" element={<CasosPage />} />
            <Route path="/casos/:id" element={<CasoDetailPage />} />

            {/* ✅ Crear y Editar Caso: Solo ADMIN y AGENTE */}
            <Route
              path="/casos/crear"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "AGENTE"]}>
                  <CreateCasoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/casos/:id/editar"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "AGENTE"]}>
                  <EditCasoPage />
                </ProtectedRoute>
              }
            />

            {/* ✅ Categorías: Todos pueden entrar (la lógica de crear/editar va dentro de la página) */}
            <Route path="/categorias" element={<CategoriasPage />} />

            {/* ✅ Módulos de Administración: Dejamos solo ADMIN por ahora. 
                Si los Agentes también deben entrar aquí, añade "AGENTE" al array. */}
            <Route
              path="/ans"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AnsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/canales"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <CanalesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activos"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <ActivosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sedes"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <SedesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <ServiciosPage />
                </ProtectedRoute>
              }
            />
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
