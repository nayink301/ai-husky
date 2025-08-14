import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabase";
import DemoBanner from "@/components/demo-banner";
import { isDemoMode } from "@/lib/demoFlag";



import Navbar from "./components/navbar";
import Spinner from "./components/spinner";

import Login from "./routes/login";
import Dashboard from "./routes/dashboard";
import NewItem from "./routes/new-item";
import Unauthorized from "./routes/unauthorized";
import NotFound from "./routes/not-found";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (isDemoMode()) { setAuthed(true); setReady(true); return; }

    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session)); setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setAuthed(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="p-6"><Spinner label="Checking session…" /></div>;
  if (!authed) return <Navigate to="/unauthorized" state={{ from: location }} replace />;

  return (
    <div className="min-h-screen">
      <DemoBanner />  
      <Navbar />
      <main id="main">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/new" element={<ProtectedLayout><NewItem /></ProtectedLayout>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
