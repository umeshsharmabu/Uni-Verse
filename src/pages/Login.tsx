import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";

const validDomains = [".edu", ".ac.in", ".ac.uk", ".edu.in", ".college.edu"];

function isValidCollegeEmail(email: string): boolean {
  return validDomains.some((domain) => email.toLowerCase().endsWith(domain));
}

type Role = "student" | "organisation";

export default function Login() {
  const { login, signup } = useApp();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (role === "student" && !isValidCollegeEmail(email)) {
      setError("Please use a valid college email (.edu, .ac.in, etc.)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const result = signup(email, password, role, email.split("@")[0]);
        if (result.error) {
          setError(result.error);
        } else {
          toast({ title: "Account created!", description: "Welcome to Campus District." });
        }
      } else {
        const result = login(email, password);
        if (result.error) {
          setError(result.error);
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass w-full max-w-md rounded-2xl p-8"
      >
        {/* Logo */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="gradient-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-primary-foreground font-heading"
          >
            CD
          </motion.div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Campus District</h1>
          <p className="mt-1 text-sm text-muted-foreground">Discover. Register. Experience.</p>
        </div>

        {/* Role Toggle */}
        <div className="mb-6 flex items-center justify-center">
          <div className="relative flex rounded-full bg-secondary p-1">
            {(["student", "organisation"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors"
              >
                {role === r && (
                  <motion.div
                    layoutId="role-pill"
                    className="absolute inset-0 rounded-full gradient-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${role === r ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {r === "student" ? "Student" : "Organisation"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder={role === "student" ? "your.name@college.edu" : "org@example.com"}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="h-12 rounded-xl border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground focus:ring-primary"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              className="h-12 rounded-xl border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground focus:ring-primary"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}

          <Button
            onClick={handleAuth}
            disabled={loading}
            className="gradient-primary h-12 w-full rounded-xl text-base font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent"
              />
            ) : (
              isSignUp ? "Create Account" : "Sign In"
            )}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="h-12 w-full rounded-xl border-border bg-secondary text-foreground hover:bg-muted"
            disabled
          >
            <Shield className="mr-2 h-5 w-5" />
            Continue with Microsoft
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            className="font-semibold text-primary hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>

        {role === "student" && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Only college email addresses are accepted for students
          </p>
        )}
      </motion.div>
    </div>
  );
}
