import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PatientDashboard from "@/pages/PatientDashboard";
import TherapistDashboard from "@/pages/TherapistDashboard";
import RecordingSession from "@/pages/RecordingSession";
import Results from "@/pages/Results";
import SessionDetails from "@/pages/SessionDetails";
import PatientProfile from "@/pages/PatientProfile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard/patient" component={PatientDashboard} />
      <Route path="/dashboard/therapist" component={TherapistDashboard} />
      <Route path="/session" component={RecordingSession} />
      <Route path="/results" component={Results} />
      <Route path="/session-details/:role" component={SessionDetails} />
      <Route path="/patient-profile/:role" component={PatientProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
