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

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path={"/student/dashboard"} component={StudentDashboard} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/students"} component={StudentsPage} />
      <Route path={"/admin/classes"} component={ClassesPage} />
      <Route path={"/admin/payments"} component={PaymentsPage} />
      <Route path={"/admin/results"} component={ResultsPage} />
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
