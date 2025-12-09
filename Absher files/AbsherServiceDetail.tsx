import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getDeviceFingerprint } from "@/lib/deviceFingerprint";
import { Shield, CheckCircle, AlertCircle, Clock, FileText, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import GestureChallenge from "@/components/GestureChallenge";
import PushApproval from "@/components/PushApproval";

interface RiskResult {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  action: "SAFE" | "GESTURE" | "PUSH" | "BLOCK";
  factors: Array<{ name: string; score: number; detected: boolean }>;
  challengeId?: string;
}

const serviceDetails: Record<string, any> = {
  driving_license: {
    titleAr: "رخصة القيادة",
    titleEn: "Driving License",
    icon: "🚗",
    description: "تجديد وإصدار رخص القيادة للسيارات الخاصة والعامة",
    processingTime: "3-5 أيام",
    fee: "مجاني",
    requirements: [
      "صورة شخصية حديثة",
      "صورة من الهوية الوطنية",
      "شهادة طبية",
      "تقرير من المرور",
    ],
    steps: [
      "تقديم الطلب عبر المنصة",
      "دفع الرسوم (إن وجدت)",
      "جدولة الفحص الطبي",
      "استلام الرخصة",
    ],
  },
  passport: {
    titleAr: "جواز السفر",
    titleEn: "Passport",
    icon: "✈️",
    description: "إصدار وتجديد جوازات السفر السعودية",
    processingTime: "5-7 أيام",
    fee: "100 ريال",
    requirements: [
      "صورة شخصية حديثة",
      "صورة من الهوية الوطنية",
      "شهادة الميلاد",
    ],
    steps: [
      "تقديم الطلب",
      "دفع الرسوم",
      "المقابلة الشخصية",
      "استلام الجواز",
    ],
  },
};

export default function AbsherServiceDetail() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [showGestureChallenge, setShowGestureChallenge] = useState(false);
  const [showPushApproval, setShowPushApproval] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const evaluateRiskMutation = trpc.risk.evaluate.useMutation();

  // Get service ID from URL
  const serviceId = window.location.pathname.split("/").pop() || "driving_license";
  const service = serviceDetails[serviceId] || serviceDetails.driving_license;

  const handleRequestService = async () => {
    setIsEvaluating(true);

    try {
      const deviceFingerprint = await getDeviceFingerprint();
      const previousFingerprint = localStorage.getItem("deviceFingerprint") || deviceFingerprint;
      localStorage.setItem("deviceFingerprint", deviceFingerprint);

      const currentIp = await fetch("https://api.ipify.org?format=json")
        .then((r) => r.json())
        .then((d) => d.ip)
        .catch(() => "192.168.1.100");
      const previousIp = localStorage.getItem("lastIp") || currentIp;
      localStorage.setItem("lastIp", currentIp);

      const result = await evaluateRiskMutation.mutateAsync({
        actionType: serviceId,
        currentDeviceFingerprint: deviceFingerprint,
        previousDeviceFingerprint: previousFingerprint,
        currentIp: currentIp,
        previousIp: previousIp,
        currentGeolocation: "25.2048,55.2708,AE",
        previousGeolocation: localStorage.getItem("lastLocation") || "25.2048,55.2708,AE",
        actionSensitivity: "high",
      });

      localStorage.setItem("lastLocation", "25.2048,55.2708,AE");
      setRiskResult(result);

      if (result.action === "SAFE") {
        toast.success("✓ الطلب آمن - يمكنك المتابعة");
        setTimeout(() => {
          navigate("/absher/request-submitted");
        }, 2000);
      } else if (result.action === "GESTURE") {
        setShowGestureChallenge(true);
      } else if (result.action === "PUSH") {
        setShowPushApproval(true);
      } else if (result.action === "BLOCK") {
        toast.error("✕ الطلب محظور بسبب مخاطر أمنية عالية");
      }
    } catch (error) {
      toast.error("فشل تقييم الأمان");
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/absher/services")}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            العودة إلى الخدمات
          </button>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{service.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{service.titleAr}</h1>
              <p className="text-gray-600">{service.titleEn}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">عن الخدمة</h2>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </Card>

            {/* Requirements */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">المتطلبات</h2>
              <ul className="space-y-3">
                {service.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Steps */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">خطوات التقديم</h2>
              <div className="space-y-4">
                {service.steps.map((step: string, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 font-semibold">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Risk Assessment */}
            {riskResult && (
              <Card className="p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">تقييم الأمان</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">درجة المخاطر</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {riskResult.riskScore}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${riskResult.riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    المستوى: <span className="font-semibold">{riskResult.riskLevel}</span>
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Info Card */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">معلومات الخدمة</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">وقت المعالجة</p>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Clock className="w-4 h-4" />
                    {service.processingTime}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الرسوم</p>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <FileText className="w-4 h-4" />
                    {service.fee}
                  </div>
                </div>
              </div>
            </Card>

            {/* Security Notice */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">حماية متقدمة</h4>
                  <p className="text-sm text-blue-800">
                    يتم فحص طلبك من خلال نظام أمان متقدم يكتشف أي نشاط مريب
                  </p>
                </div>
              </div>
            </Card>

            {/* Request Button */}
            <Button
              onClick={handleRequestService}
              disabled={isEvaluating}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
            >
              {isEvaluating ? "جاري التحقق..." : "تقديم الطلب"}
            </Button>
          </div>
        </div>
      </div>

      {showGestureChallenge && (
        <GestureChallenge
          onClose={() => setShowGestureChallenge(false)}
          actionType={serviceId}
          riskResult={riskResult}
        />
      )}

      {showPushApproval && (
        <PushApproval
          onClose={() => setShowPushApproval(false)}
          challengeId={riskResult?.challengeId || ""}
          actionType={serviceId}
          riskResult={riskResult}
        />
      )}
    </div>
  );
}
