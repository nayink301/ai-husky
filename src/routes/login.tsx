// src/routes/login.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { enableDemoMode, isDemoMode, hardNavigate } from "@/lib/demoFlag";

const DEMO_EMAIL = "demo@husky.app";
const DEMO_PASSWORD = "demo123";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation() as any;

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const from = loc.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isDemoMode()) nav("/dashboard", { replace: true });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === DEMO_EMAIL && pwd === DEMO_PASSWORD) {
        enableDemoMode();
        hardNavigate("/dashboard?demo=1");
        return;
      }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pwd,
    });

    if (!error && data.session) {
        nav("/dashboard", { replace: true });
      } else {
        // No account? Create one. With "Confirm email" OFF, this returns a session immediately.
        const { data: su, error: upErr } = await supabase.auth.signUp({ email, password: pwd });
        if (upErr) {
          alert(upErr.message);
        } else if (su.session) {
          nav("/dashboard", { replace: true });
        } else {
          // This only happens if confirmations are ON
          alert("Sign-up successful. Please check your email to confirm.");
        }
      }
    }  
      
      
      
      
    

  // ✅ this is the handler your button needs
  const tryDemo = () => {
    enableDemoMode();
    nav("/dashboard?demo=1",{replace:true}) // sets localStorage + reloads (auth bypass will kick in)
  };

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Login</h1>

      {!isDemoMode() && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Want to explore without signing up?
          <div className="mt-2">
            <Button type="button" variant="outline" onClick={tryDemo}>
              🚀 Try demo
            </Button>
            </div>
            <div className="mt-2 text-xs text-amber-800">
          </div>
          
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
        </div>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm mb-1 mt-3">Password</label>
        </div>
        <Input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? "…" : "Continue"}
        </Button>
      </form>

      <p className="text-xs text-gray-500 mt-3">
        Don’t have an account? Submitting will create one automatically.
      </p>
      <p className="text-xs mt-2">
        <Link className="underline" to="/unauthorized">
          Need help?
        </Link>
      </p>
    </div>
  );
}
