import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Shield, Lock, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <img src="/absher-adaptive-shield-logo.png" alt="Abser Adaptive Shield" className="h-24" />
          </div>
          <p className="text-xl text-slate-300">
            Continuous, Adaptive Session Security for Absher
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Features */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Security That Adapts to Your Risk
              </h2>
              <p className="text-slate-300 text-lg">
                Most systems only protect at login. We protect your entire session with
                real-time risk evaluation and adaptive security measures.
              </p>
            </div>

            <div className="space-y-4">