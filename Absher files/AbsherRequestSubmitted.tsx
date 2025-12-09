import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, FileText, Clock } from "lucide-react";

export default function AbsherRequestSubmitted() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4" dir="rtl">
      <Card className="max-w-md w-full p-8 text-center">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تم استقبال طلبك</h1>
        <p className="text-gray-600 mb-8">
          شكراً لتقديمك الطلب. سيتم معالجته في أقرب وقت
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-600" />
            <div className="text-right">
              <p className="text-sm text-gray-500">رقم الطلب</p>
              <p className="font-semibold text-gray-900">REQ-2025-123456</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-600" />
            <div className="text-right">
              <p className="text-sm text-gray-500">وقت المعالجة المتوقع</p>
              <p className="font-semibold text-gray-900">3-5 أيام عمل</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/absher")}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            العودة إلى الرئيسية
          </Button>
          <Button
            onClick={() => navigate("/absher/services")}
            variant="outline"
            className="w-full"
          >
            تقديم طلب آخر
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          سيتم إرسال تحديثات الطلب إلى بريدك الإلكتروني
        </p>
      </Card>
    </div>
  );
}
