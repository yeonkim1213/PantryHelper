import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

// Components
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Inventory from "./pages/Inventory/Inventory";
import Finance from "./pages/Finance/Finance";
import Recipe from "./pages/Recipe/Recipe";
import Event from "./pages/Event/Event";
import Report from "./pages/Report/Report";
import ReportExpired from "./pages/ReportExpired/ReportExpired";
import Map from "./pages/Map/Map";
import Member from "./pages/Member/Member";
import Help from "./pages/Help/Help";
import Login from "./pages/Login/Login";
import Pantry from "./pages/Pantry/Pantry";
import Request from "./pages/Request/Request";
import ReportRequested from "./pages/ReportRequested/ReportRequested";
import ReportPopular from "./pages/ReportPopular/ReportPopular";
import ReportFinance from "./pages/ReportFinance/ReportFinance";
import ContactPantry from "./pages/ContactPantry/ContactPantry";

// About pages
import About from "./aboutpages/About/About";
import TeamMember from "./aboutpages/Team/Team";
import Tutorial from "./aboutpages/Tutorial/Tutorial";
import TutorialStaff from "./aboutpages/Tutorial/Staff/TutorialStaff";
import TutorialRecipient from "./aboutpages/Tutorial/Recipient/TutorialRecipient";
import TutorialAdmin from "./aboutpages/Tutorial/Admin/TutorialAdmin";

// Context
import { ProfileProvider } from "./context/ProfileContext";
import { EmailProvider } from "./context/EmailContext";

function App() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProfileProvider>
      <EmailProvider>
        <Router>
          <div
            className="App"
            style={{ "--sidebar-width": isSidebarCollapsed ? "80px" : "260px" }}
          >
            <Navbar />

            <div className="content-container">
              <Sidebar setSidebarCollapsed={setSidebarCollapsed} />

              <div className="page-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/recipe" element={<Recipe />} />
                  <Route path="/event" element={<Event />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/reportpopular" element={<ReportPopular />} />
                  <Route path="/reportexpired" element={<ReportExpired />} />
                  <Route
                    path="/reportrequested"
                    element={<ReportRequested />}
                  />
                  <Route path="/reportfinance" element={<ReportFinance />} />
                  <Route path="/request" element={<Request />} />
                  <Route path="/member" element={<Member />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/pantry" element={<Pantry />} />
                  <Route path="/contact" element={<ContactPantry />} />
                  <Route path="/login" element={<Login />} />

                  {/* About pages */}
                  <Route path="/about" element={<About />} />
                  <Route path="/team" element={<TeamMember />} />
                  <Route path="/tutorial" element={<Tutorial />} />
                  <Route path="/tutorial/recipient" element={<TutorialRecipient />} />
                  <Route path="/tutorial/staff" element={<TutorialStaff />} />
                  <Route path="/tutorial/admin" element={<TutorialAdmin />} />
                </Routes>
              </div>
            </div>
          </div>
        </Router>
      </EmailProvider>
    </ProfileProvider>
  );
}

export default App;
