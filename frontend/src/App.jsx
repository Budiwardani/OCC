import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";
import "./index.css";

// Lazy Loading Pages
const Portal = lazy(() => import("./pages/Portal"));
// const PublicSubmit = lazy(() => import("./pages/PublicSubmit")); // Replaced by Portal
// const TrackComplaint = lazy(() => import("./pages/TrackComplaint")); // Replaced by Portal
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Complaints = lazy(() => import("./pages/Complaints"));
const ComplaintDetail = lazy(() => import("./pages/ComplaintDetail"));
const Agents = lazy(() => import("./pages/Agents"));
const Branding = lazy(() => import("./pages/Branding"));
const Categories = lazy(() => import("./pages/Categories"));
const Companies = lazy(() => import("./pages/Companies"));
const Login = lazy(() => import("./pages/Login"));
const DraftSuratKuasa = lazy(() => import("./pages/DraftSuratKuasa"));
const OfficialEmails = lazy(() => import("./pages/OfficialEmails"));
const MasterTemplates = lazy(() => import("./pages/MasterTemplates"));
const PublicUploadSuratKuasa = lazy(() => import("./pages/PublicUploadSuratKuasa"));
const ApprovedSuratKuasa = lazy(() => import("./pages/ApprovedSuratKuasa"));

// Loading Component
const Loading = () => (
  <div className="flex justify-center items-center py-20">
    <svg className="animate-spin h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Public Routes with Layout */}
          {/* Note: Portal now handles the main public experience */}
          <Route path="/" element={<Portal />} />
          <Route element={<Layout />}>
            {/* Keep these if specific direct links are needed, otherwise Portal handles it */}
            {/* <Route path="/submit" element={<PublicSubmit />} /> */}
            {/* <Route path="/track" element={<TrackComplaint />} /> */}
            <Route path="/upload-surat/:ticket" element={<PublicUploadSuratKuasa />} />
          </Route>

          {/* Admin Routes (Sidebar included in components) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/complaints" element={<Complaints />} />
          <Route path="/dashboard/complaints/:id" element={<ComplaintDetail />} />
          <Route path="/dashboard/surat-kuasa" element={<DraftSuratKuasa />} />
          <Route path="/dashboard/surat-kuasa/approved" element={<ApprovedSuratKuasa />} />
          <Route path="/dashboard/agents" element={<Agents />} />
          <Route path="/dashboard/branding" element={<Branding />} />
          <Route path="/dashboard/categories" element={<Categories />} />
          <Route path="/dashboard/companies" element={<Companies />} />
          <Route path="/dashboard/official-emails" element={<OfficialEmails />} />
          <Route path="/dashboard/master-templates" element={<MasterTemplates />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
