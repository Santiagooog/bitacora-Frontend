import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardPage } from "../pages/dashboard/DashoardPage";
import { CasosPage } from "../pages/casos/CasosPage";
// import { CreateCasoPage } from "../pages/casos/CreateCasoPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/casos" element={<CasosPage />} />
          {/* <Route path="/casos/crear" element={<CreateCasoPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};