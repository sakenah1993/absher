import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Shield, LogOut, History, AlertCircle } from "lucide-react";
import GestureChallenge from "@/components/GestureChallenge";
import PushApproval from "@/components/PushApproval";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getDeviceFingerprint } from "@/lib/deviceFingerprint";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface RiskResult {
  riskScore: number;
  riskLevel: RiskLevel;
  action: "SAFE" | "GESTURE" | "PUSH" | "BLOCK";
  factors: Array<{ name: string; score: number; detected: boolean }>;
  challengeId?: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [showGestureChallenge, setShowGestureChallenge] = useState(false);
  const [showPushApproval, setShowPushApproval] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [fingerprintReady, setFingerprintReady] = useState(false);

  // Initialize fingerprinting on component mount
  useEffect(() => {
    getDeviceFingerprint().then(() => {
      setFingerprintReady(true);
    }).catch((error) => {
      console.error('Failed to initialize fingerprinting:', error);
      setFingerprintReady(true); // Still allow usage with fallback
    });
  }, []);

  const evaluateRiskMutation = trpc.risk.evaluate.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Only show loading state if fingerprinting is not ready
  if (!fingerprintReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-emerald-600 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">جاري تحضير نظام الأمان...</p>
        </div>
      </div>
    );
  }

  const services = [
    { 
      id: "view_documents", 
      label: "عرض الوثائق", 
      englishLabel: "View Documents",
      icon: "📄", 
      sensitivity: "normal",
      description: "شهادات وتراخيص وسجلات رسمية"
    },
    { 
      id: "update_profile", 
      label: "تحديث البيانات", 
      englishLabel: "Update Profile",
      icon: "👤", 
      sensitivity: "normal",
      description: "تحديث العنوان والهاتف والبيانات الشخصية"
    },
    { 
      id: "request_service", 
      label: "طلب خدمة", 
      englishLabel: "Request Service",
      icon: "📋", 
      sensitivity: "high",
      description: "تجديد الرخصة، استخراج شهادات"
    },
    { 
      id: "approve_transaction", 
      label: "الموافقة على معاملة", 
      englishLabel: "Approve Transaction",
      icon: "✅", 
      sensitivity: "high",
      description: "توقيع رسمي على وثيقة أو معاملة"
    },
    { 
      id: "download_certificate", 
      label: "تحميل شهادة", 
      englishLabel: "Download Certificate",
      icon: "📥", 
      sensitivity: "normal",
      description: "تحميل شهادات ووثائق رسمية"
    },
  ];

  const handleActionClick = async (actionId: string) => {
    setSelectedAction(actionId);
    setIsEvaluating(true);

    try {
      // Get real device fingerprint using FingerprintJS
      const deviceFingerprint = await getDeviceFingerprint();
      const previousFingerprint = localStorage.getItem("deviceFingerprint") || deviceFingerprint;
      localStorage.setItem("deviceFingerprint", deviceFingerprint);

      // Get current IP (in production, this would be from the server)
      const currentIp = await fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(d => d.ip)
        .catch(() => '192.168.1.100');
      const previousIp = localStorage.getItem("lastIp") || currentIp;
      localStorage.setItem("lastIp", currentIp);

      const result = await evaluateRiskMutation.mutateAsync({
        actionType: actionId,
        currentDeviceFingerprint: deviceFingerprint,
        previousDeviceFingerprint: previousFingerprint,
        currentIp: currentIp,
        previousIp: previousIp,
        currentGeolocation: "25.2048,55.2708,AE",
        previousGeolocation: localStorage.getItem("lastLocation") || "25.2048,55.2708,AE",
        actionSensitivity: services.find((a) => a.id === actionId)?.sensitivity as any,
      });

      localStorage.setItem("lastLocation", "25.2048,55.2708,AE");
      setRiskResult(result);

      if (result.action === "SAFE") {
        const service = services.find(s => s.id === actionId);
        toast.success(`✓ ${service?.label} - آمنة للمتابعة`);
        setTimeout(() => {
          setSelectedAction(null);
          setRiskResult(null);
        }, 2000);
      } else if (result.action === "GESTURE") {
        setShowGestureChallenge(true);
      } else if (result.action === "PUSH") {
        setShowPushApproval(true);
      } else if (result.action === "BLOCK") {
        const service = services.find(s => s.id === actionId);
        toast.error(`✕ ${service?.label} - محظورة بسبب مخاطر عالية`);
      }
    } catch (error) {
      toast.error("فشل تقييم المخاطر");
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 order-2">
            <img src="/absher-adaptive-shield-logo.png" alt="Absher Adaptive Shield" className="h-16" />
          </div>
          <div className="flex items-center gap-4 order-1">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
            <Button
              onClick={() => navigate("/security-center")}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <History className="w-4 h-4" />
              مركز الأمان
            </Button>
            <span className="text-slate-600">{user?.name || user?.email}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Info Card */}
        <Card className="mb-8 p-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">حماية الجلسة في الوقت الفعلي</h3>
              <p className="text-sm text-blue-800">
                جلستك محمية بشكل مستمر. نظام درع أبشر يراقب أي تغييرات مريبة ويطلب توثيق إضافي عند الحاجة لحماية حسابك من الاختراق والاحتيال.
              </p>
            </div>
          </div>
        </Card>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedAction === service.id ? "ring-2 ring-emerald-500" : ""
              }`}
              onClick={() => !isEvaluating && handleActionClick(service.id)}
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="font-semibold text-slate-900 mb-1">{service.label}</h3>
              <p className="text-xs text-slate-500 mb-2">{service.englishLabel}</p>
              <p className="text-sm text-slate-600 mb-4">{service.description}</p>
              <p className="text-sm text-slate-600 mb-4">
                الحساسية: <span className="font-semibold capitalize">
                  {service.sensitivity === "high" ? "عالية" : "عادية"}
                </span>
              </p>
              <Button
                disabled={isEvaluating}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(service.id);
                }}
              >
                {isEvaluating && selectedAction === service.id ? "جاري التقييم..." : "تنفيذ الخدمة"}
              </Button>
            </Card>
          ))}
        </div>

        {/* Risk Result Display */}
        {riskResult && (
          <Card className="mt-8 p-6 border-2 border-slate-300">
            <h3 className="text-lg font-bold text-slate-900 mb-4">نتيجة تقييم المخاطر</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Risk Score */}
              <div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-600">درجة المخاطر</span>
                    <span className="text-3xl font-bold text-slate-900">{riskResult.riskScore}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        riskResult.riskScore <= 30
                          ? "bg-emerald-500"
                          : riskResult.riskScore <= 60
                            ? "bg-yellow-500"
                            : riskResult.riskScore <= 85
                              ? "bg-orange-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${riskResult.riskScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">مستوى المخاطر:</span>
                    <span
                      className={`font-semibold ${
                        riskResult.riskLevel === "LOW"
                          ? "text-emerald-600"
                          : riskResult.riskLevel === "MEDIUM"
                            ? "text-yellow-600"
                            : riskResult.riskLevel === "HIGH"
                              ? "text-orange-600"
                              : "text-red-600"
                      }`}
                    >
                      {riskResult.riskLevel === "LOW" ? "منخفض" : 
                       riskResult.riskLevel === "MEDIUM" ? "متوسط" :
                       riskResult.riskLevel === "HIGH" ? "عالي" : "حرج"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">الإجراء المطلوب:</span>
                    <span className="font-semibold text-slate-900">
                      {riskResult.action === "SAFE" ? "آمن" :
                       riskResult.action === "GESTURE" ? "تحقق بحركة" :
                       riskResult.action === "PUSH" ? "موافقة من الهاتف" : "محظور"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">عوامل المخاطر</h4>
                <div className="space-y-2">
                  {riskResult.factors.map((factor) => (
                    <div
                      key={factor.name}
                      className="flex justify-between items-center p-2 bg-slate-100 rounded"
                    >
                      <span className="text-sm text-slate-700">{factor.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">+{factor.score}</span>
                        {factor.detected && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            مكتشف
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Overlays */}
      {showGestureChallenge && riskResult && (
        <GestureChallenge
          onClose={() => setShowGestureChallenge(false)}
          actionType={selectedAction || ""}
          riskResult={riskResult}
        />
      )}

      {showPushApproval && riskResult && (
        <PushApproval
          onClose={() => setShowPushApproval(false)}
          actionType={selectedAction || ""}
          riskResult={riskResult}
          challengeId={riskResult.challengeId || ""}
        />
      )}
    </div>
  );
}
