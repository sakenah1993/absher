import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Shield, ArrowLeft, AlertCircle, CheckCircle, Clock, TrendingUp, Activity, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface RiskEvent {
  id: number;
  userId: number;
  sessionId: number | null;
  actionType: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: string | null;
  deviceFingerprintChange: number;
  ipChange: number;
  geolocationShift: number;
  actionSensitivity: string;
  createdAt: Date;
}

export default function SecurityCenter() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: events, isLoading } = trpc.sessions.recent.useQuery();

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "LOW":
        return "bg-emerald-50 border-emerald-200 text-emerald-900";
      case "MEDIUM":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "HIGH":
        return "bg-orange-50 border-orange-200 text-orange-900";
      case "CRITICAL":
        return "bg-red-50 border-red-200 text-red-900";
      default:
        return "bg-slate-50 border-slate-200 text-slate-900";
    }
  };

  const getRiskBadgeColor = (level: RiskLevel) => {
    switch (level) {
      case "LOW":
        return "bg-emerald-100 text-emerald-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case "LOW":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "MEDIUM":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "HIGH":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "CRITICAL":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const getServiceLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      view_documents: "عرض الوثائق",
      update_profile: "تحديث البيانات",
      request_service: "طلب خدمة",
      approve_transaction: "الموافقة على معاملة",
      download_certificate: "تحميل شهادة",
      transfer_funds: "تحويل أموال",
      change_password: "تغيير كلمة المرور",
    };
    return labels[actionType] || actionType.replace(/_/g, " ");
  };

  const parseFactors = (factorsJson: string | null) => {
    if (!factorsJson) return [];
    try {
      return JSON.parse(factorsJson);
    } catch {
      return [];
    }
  };

  const stats = events
    ? {
        total: events.length,
        avgRisk: Math.round(events.reduce((sum: number, e: any) => sum + e.riskScore, 0) / events.length),
        maxRisk: Math.max(...events.map((e: any) => e.riskScore)),
        criticalCount: events.filter((e: any) => e.riskLevel === "CRITICAL").length,
        highCount: events.filter((e: any) => e.riskLevel === "HIGH").length,
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 order-2">
            <img src="/absher-adaptive-shield-logo.png" alt="Abser Adaptive Shield" className="h-14" />
          </div>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="gap-2 order-1"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للداشبورد
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Info Card */}
        <Card className="mb-8 p-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">أنشطة الجلسة الحديثة</h3>
              <p className="text-sm text-blue-800">
                اطلع على جميع أنشطة حسابك والمخاطر المكتشفة. كل عملية يتم تقييم مخاطرها بناءً على تغييرات الجهاز والموقع والشبكة.
              </p>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-slate-600 to-slate-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">إجمالي الأنشطة</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Activity className="w-8 h-8 opacity-50" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">متوسط المخاطر</p>
                  <p className="text-3xl font-bold">{stats.avgRisk}</p>
                </div>
                <TrendingUp className="w-8 h-8 opacity-50" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-yellow-600 to-yellow-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">أقصى مخاطر</p>
                  <p className="text-3xl font-bold">{stats.maxRisk}</p>
                </div>
                <AlertCircle className="w-8 h-8 opacity-50" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">مخاطر عالية</p>
                  <p className="text-3xl font-bold">{stats.highCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 opacity-50" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-red-600 to-red-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">حرجة</p>
                  <p className="text-3xl font-bold">{stats.criticalCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 opacity-50" />
              </div>
            </Card>
          </div>
        )}

        {/* Events Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-6">سجل الأنشطة</h2>

          {isLoading ? (
            <Card className="p-6 text-center text-slate-600">
              جاري تحميل الأنشطة...
            </Card>
          ) : !events || events.length === 0 ? (
            <Card className="p-6 text-center text-slate-600">
              لا توجد أنشطة مسجلة حتى الآن. قم بتنفيذ خدمة لرؤية الأنشطة هنا.
            </Card>
          ) : (
            events.map((event: any, index: number) => {
              const factors = parseFactors(event.riskFactors);
              return (
                <Card
                  key={event.id}
                  className={`p-6 border-2 ${getRiskColor(event.riskLevel)} transition-all hover:shadow-md`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getRiskIcon(event.riskLevel)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {getServiceLabel(event.actionType)}
                            </h3>
                            <p className="text-sm opacity-75 mt-1">
                              {format(new Date(event.createdAt), "PPpp", { locale: ar })}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold">{event.riskScore}</div>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getRiskBadgeColor(event.riskLevel)}`}>
                              {event.riskLevel === "LOW" ? "منخفض" :
                               event.riskLevel === "MEDIUM" ? "متوسط" :
                               event.riskLevel === "HIGH" ? "عالي" : "حرج"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Risk Analysis */}
                  <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-current border-opacity-20">
                    <div>
                      <h4 className="font-semibold mb-3 opacity-75">عوامل المخاطر</h4>
                      <div className="space-y-2">
                        {factors.map((factor: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-white bg-opacity-50 rounded">
                            <span className="text-sm">{factor.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">+{factor.score}</span>
                              {factor.detected && (
                                <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                                  مكتشف
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 opacity-75">الكشف عن التغييرات</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-white bg-opacity-50 rounded">
                          <span className="text-sm">تغيير الجهاز</span>
                          <span className={event.deviceFingerprintChange ? "text-red-600 font-semibold" : "text-emerald-600"}>
                            {event.deviceFingerprintChange ? "✓ نعم" : "✗ لا"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white bg-opacity-50 rounded">
                          <span className="text-sm">تغيير الشبكة</span>
                          <span className={event.ipChange ? "text-red-600 font-semibold" : "text-emerald-600"}>
                            {event.ipChange ? "✓ نعم" : "✗ لا"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white bg-opacity-50 rounded">
                          <span className="text-sm">تغيير الموقع</span>
                          <span className={event.geolocationShift ? "text-red-600 font-semibold" : "text-emerald-600"}>
                            {event.geolocationShift ? "✓ نعم" : "✗ لا"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Sensitivity */}
                  <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                    <p className="text-sm">
                      <span className="opacity-75">حساسية العملية: </span>
                      <span className="font-semibold">
                        {event.actionSensitivity === "high" ? "عالية" : 
                         event.actionSensitivity === "normal" ? "عادية" : "منخفضة"}
                      </span>
                    </p>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Security Tips */}
        <Card className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
          <h3 className="font-bold text-slate-900 mb-4">💡 نصائح الأمان</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>✓ تحقق من أنشطتك بانتظام في مركز الأمان</li>
            <li>✓ إذا رأيت نشاطاً غريباً، غير كلمة المرور فوراً</li>
            <li>✓ استخدم شبكات آمنة عند الوصول إلى معلومات حساسة</li>
            <li>✓ لا تشارك رابط حسابك مع أحد</li>
            <li>✓ فعّل التحقق الثنائي إذا كان متاحاً</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
