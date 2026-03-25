import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { CreditsProvider } from "@/contexts/credits-context";
import { readProfileFromStorage } from "@/hooks/use-profile";
import Home from "./pages/home";
import Premium from "./pages/premium";
import History from "./pages/history";
import Login from "./pages/login";
import Onboarding from "./pages/onboarding";
import Profile from "./pages/profile";
import Tarot from "./pages/tarot";
import Palm from "./pages/palm";
import Horoscope from "./pages/horoscope";
import NotFound from "./pages/not-found";
import Privacy from "./pages/privacy";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "configure-me";

function ProtectedRoute({
  component: Component,
  skipProfileCheck = false,
}: {
  component: React.ComponentType;
  skipProfileCheck?: boolean;
}) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  if (!skipProfileCheck && !readProfileFromStorage()) {
    navigate("/onboarding", { replace: true });
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login"      component={Login} />
      <Route path="/onboarding" component={() => <ProtectedRoute component={Onboarding} skipProfileCheck />} />
      <Route path="/"           component={() => <ProtectedRoute component={Home} />} />
      <Route path="/premium"    component={() => <ProtectedRoute component={Premium} />} />
      <Route path="/gecmis"     component={() => <ProtectedRoute component={History} />} />
      <Route path="/profil"     component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/tarot"      component={() => <ProtectedRoute component={Tarot} />} />
      <Route path="/el-fali"    component={() => <ProtectedRoute component={Palm} />} />
      <Route path="/burc"       component={() => <ProtectedRoute component={Horoscope} />} />
      <Route path="/privacy"    component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CreditsProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
            </CreditsProvider>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
