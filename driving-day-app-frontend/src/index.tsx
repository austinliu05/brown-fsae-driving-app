import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RunSummaryPage from "./pages/run-summary-page/RunSummaryPage";
import RunDetailPage from "./pages/run-detail-page/RunDetailPage";
import Layout from "./pages/layout/Layout";
import DriversPage from "./pages/drivers-page/DriversPage";
import UploadFilesPage from "./pages/upload-page/UploadFilesPage";
import HomePage from "./pages/home-page/HomePage";
import DevPage from "./pages/dev-page/DevPage";
import IssuesPage from "./pages/issues-page/IssuesPage";
import MyAccountPage from "./pages/account-page/MyAccountPage";
import FeedbackPage from "./pages/driver-feedback-page/FeedbackPage";

/**
 * Creates an object that handles routing for all webpages:
 *    EX: /home --> presents the <App/> page
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/run-data",
        element: <RunSummaryPage />,
      },
      {
        path: "/run/:runTitle",
        element: <RunDetailPage />,
      },
      {
        path: "/drivers",
        element: <DriversPage />,
      },
      {
        path: "/my-account",
        element: <MyAccountPage />,
      },
      {
        path: "/upload-files",
        element: <UploadFilesPage />,
      },
      {
        path: "/issues",
        element: <IssuesPage />,
      },
      {
        path: "/feedback",
        element: <FeedbackPage />,
      }
    ],
  },
  {
    path: "/dev-page",
    element: <DevPage />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<RouterProvider router={router} />);
