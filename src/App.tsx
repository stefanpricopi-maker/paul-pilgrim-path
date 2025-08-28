import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, Component, ReactNode } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/admin/AdminRoute";
import OnlineGameBoardWrapper from "@/pages/OnlineGameBoardWrapper";
import ResumeOnlineGame from "./components/game/ResumeOnlineGame";
import { useReconnect } from "@/hooks/useReconnect";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Error Boundary
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: any }> {
  state = { hasError: false, error: undefined };
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-center p-4">
          <h1 className="text-2xl font-bold text-destructive">Something went wrong!</h1>
          <pre className="text-xs text-muted-foreground mt-2">{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loader fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="text-4xl mb-4">⛪</div>
      <h1 className="text-xl font-bold text-primary mb-2">Loading...</h1>
    </div>
  </div>
);

const App = () => {
  const status = useReconnect();

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎮</div>
          <h1 className="text-xl font-bold text-primary mb-2">Rejoining game...</h1>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <ResumeOnlineGame />
            <ErrorBoundary>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/online/:gameId"
                  element={
                    <ProtectedRoute>
                      <OnlineGameBoardWrapper />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
