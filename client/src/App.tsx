import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentsPage from "./pages/admin/StudentsPage";
import ClassesPage from "./pages/admin/ClassesPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import ResultsPage from "./pages/admin/ResultsPage";
import StudentHome from "./pages/student/StudentHome";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import StudentPaymentsPage from "./pages/student/StudentPaymentsPage";
import StudentResultsPage from "./pages/student/StudentResultsPage";
import StudentAnnouncementsPage from "./pages/student/StudentAnnouncementsPage";
import AdminHome from "./pages/admin/AdminHome";
import AnnouncementsPage from "./pages/admin/AnnouncementsPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path={"/student/home"} component={StudentHome} />
      <Route path={"/student/dashboard"} component={StudentDashboardPage} />
      <Route path={"/student/payments"} component={StudentPaymentsPage} />
      <Route path={"/student/results"} component={StudentResultsPage} />
      <Route path={"/student/announcements"} component={StudentAnnouncementsPage} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/home"} component={AdminHome} />
      <Route path={"/admin/students"} component={StudentsPage} />
      <Route path={"/admin/classes"} component={ClassesPage} />
      <Route path={"/admin/payments"} component={PaymentsPage} />
      <Route path={"/admin/results"} component={ResultsPage} />
      <Route path={"/admin/announcements"} component={AnnouncementsPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
