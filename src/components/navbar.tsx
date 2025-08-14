import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { isDemoMode, disableDemoMode, hardNavigate } from "@/lib/demoFlag";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const link = (to: string, label: string) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded ${pathname === to ? "bg-black text-white" : "hover:bg-gray-100"}`}
    >
      {label}
    </Link>
  );
  const logout = async () => {
    if (isDemoMode()) {
      // In demo, there is no Supabase session—just exit demo and go to login
      disableDemoMode();
      hardNavigate("/login");
      return;
    }
    await supabase.auth.signOut();
    hardNavigate("/login");
  };
  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto p-3 flex items-center gap-3">
        {link("/dashboard", "Dashboard")}
        {link("/new", "New Item")}
        <div className="ml-auto">
          <button onClick={logout} className="px-3 py-2 rounded hover:bg-gray-100">Logout</button>
        </div>
      </div>
    </nav>
  );
}
