import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/admin/AdminRoute";
import OnlineGameBoardWrapper from "@/pages/OnlineGameBoardWrapper";
import ResumeOnlineGame from "./components/game/ResumeOnlineGame";
import { useReconnect } from "@/hooks/useReconnect";

// ErrorBoundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error("ErrorBoundary caught:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-destructive mb-2">Something went wrong</h1>
            <p className="text-muted-foreground">Please try refreshing the page.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="text-4xl mb-4">⛪</div>
      <h1 className="text-xl font-bold text-primary mb-2">Loading...</h1>
    </div>
  </div>
);

const App = () => {
  let status: "checking" | "ready" = "ready";

  try {
    status = useReconnect();
  } catch (e) {
    console.error("useReconnect hook failed:", e);
    status = "ready"; // fallback
  }

  if (status === "checking" || status === "idle") {
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
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              {/* Safe ResumeOnlineGame */}
              <ErrorBoundary>
                <ResumeOnlineGame />
              </ErrorBoundary>

              <Routes>
                <Route path="/auth" element={
                  <ErrorBoundary>
                    <Auth />
                  </ErrorBoundary>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <ErrorBoundary>
                        <Admin />
                      </ErrorBoundary>
                    </AdminRoute>
                  </ProtectedRoute>
                } />

                <Route path="/" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Index />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                <Route path="/online/:gameId" element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <OnlineGameBoardWrapper />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                <Route path="*" element={
                  <ErrorBoundary>
                    <NotFound />
                  </ErrorBoundary>
                } />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
