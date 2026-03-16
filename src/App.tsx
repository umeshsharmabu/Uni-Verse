import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Login from "@/pages/Login";
import MainApp from "@/pages/MainApp";
import OrgDashboard from "@/pages/OrgDashboard";
import PreferencePopup from "@/components/PreferencePopup";

const queryClient = new QueryClient();

function AppContent() {
  const { isLoggedIn, isLoading, profile } = useApp();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isLoggedIn) return <Login />;

  if (profile?.role === "organisation") return <OrgDashboard />;

  const needsPreferences = profile?.role === "student" && (!profile.preferences || profile.preferences.length === 0);

  return (
    <>
      <MainApp />
      {needsPreferences && <PreferencePopup />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
