import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { MainDashboard } from "./pages/MainDashboard";
import { DataUploadPage } from "./pages/DataUploadPage";
import { DataCleaningPage } from "./pages/DataCleaningPage";
import { LaneClusteringPage } from "./pages/LaneClusteringPage";
import { RFQGeneratorPage } from "./pages/RFQGeneratorPage";
import { DataQualityPage } from "./pages/DataQualityPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: MainDashboard },
      { path: "upload", Component: DataUploadPage },
      { path: "cleaning", Component: DataCleaningPage },
      { path: "lanes", Component: LaneClusteringPage },
      { path: "rfq", Component: RFQGeneratorPage },
      { path: "quality", Component: DataQualityPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
