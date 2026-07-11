import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { BAPSLogo } from "@/components/BAPSLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession, loginAdmin } from "@/services/authService";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Admin — BAPS Yuvak Sabha" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const s = getSession();
    if (s?.role === "admin") nav({ to: "/admin/dashboard" });
  }, [nav]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const s = loginAdmin(password);
    setLoading(false);
    if (!s) {
      toast.error("Incorrect password");
      return;
    }
    toast.success("Welcome, Admin");
    nav({ to: "/admin/dashboard" });
  };

  return (
    <div className="mandala-bg min-h-screen bg-cream-gradient">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-10">
        <div className="w-full">
          <div className="flex flex-col items-center text-center">
            <BAPSLogo size={64} />
            <h1 className="mt-4 text-2xl font-semibold text-maroon">Admin Login</h1>
            <p className="text-sm text-muted-foreground">BAPS Yuvak Sabha — Administrator Access</p>
          </div>

          <form
            onSubmit={onSubmit}
            className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-pw">Password</Label>
                <div className="relative">
                  <Input
                    id="admin-pw"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="h-11 pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="h-11 w-full bg-saffron text-white hover:bg-saffron-deep"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
