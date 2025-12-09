import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Search, Filter, ChevronRight, Clock, FileText } from "lucide-react";

export default function AbsherServices() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "جميع الخدمات" },
    { id: "transport", label: "النقل والمرور" },
    { id: "interior", label: "الداخلية" },
    { id: "health", label: "الصحة" },
    { id: "education", label: "التعليم" },
    { id: "labor", label: "العمل" },
    { id: "real_estate", label: "العقارات" },
    { id: "finance", label: "المالية" },
  ];

  const services = [
    {
      id: "driving_license",
      titleAr: "رخصة القيادة",
      titleEn: "Driving License",
      description: "تجديد وإصدار رخص القيادة للسيارات الخاصة والعامة",
      category: "transport",
      icon: "🚗",
      processingTime: "3-5 أيام",
      fee: "مجاني",
      sensitivity: "high",
    },
    {
      id: "passport",
      titleAr: "جواز السفر",
      titleEn: "Passport",
      description: "إصدار وتجديد جوازات السفر السعودية",
      category: "interior",
      icon: "✈️",
      processingTime: "5-7 أيام",
      fee: "100 ريال",
      sensitivity: "high",
    },
    {
      id: "civil_status",
      titleAr: "الأحوال المدنية",
      titleEn: "Civil Status",
      description: "شهادات الميلاد والزواج والوفيات والطلاق",
      category: "interior",
      icon: "👨‍👩‍👧‍👦",
      processingTime: "يومي",
      fee: "مجاني",
      sensitivity: "medium",
    },
    {
      id: "health_insurance",
      titleAr: "التأمين الصحي",
      titleEn: "Health Insurance",
      description: "الاستعلام والتسجيل في برامج التأمين الصحي",
      category: "health",
      icon: "🏥",
      processingTime: "فوري",
      fee: "مجاني",
      sensitivity: "medium",
    },
    {
      id: "education_cert",
      titleAr: "الشهادات الدراسية",
      titleEn: "Education Certificates",
      description: "استخراج الشهادات الدراسية والسجلات الأكاديمية",
      category: "education",
      icon: "📚",
      processingTime: "يومي",
      fee: "مجاني",
      sensitivity: "low",
    },
    {
      id: "work_permit",
      titleAr: "تصريح العمل",
      titleEn: "Work Permit",
      description: "تجديد وإصدار تصاريح العمل للعاملين",
      category: "labor",
      icon: "💼",
      processingTime: "2-3 أيام",
      fee: "50 ريال",
      sensitivity: "high",
    },
    {
      id: "property_register",
      titleAr: "تسجيل العقار",
      titleEn: "Property Registration",
      description: "تسجيل وتحديث بيانات العقارات والملكية",
      category: "real_estate",
      icon: "🏠",
      processingTime: "5-10 أيام",
      fee: "متغير",
      sensitivity: "high",
    },
    {
      id: "tax_return",
      titleAr: "الإقرار الضريبي",
      titleEn: "Tax Return",
      description: "تقديم الإقرارات الضريبية والاستعلام عن الالتزامات",
      category: "finance",
      icon: "📊",
      processingTime: "فوري",
      fee: "مجاني",
      sensitivity: "high",
    },
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.titleAr.includes(searchQuery) ||
      service.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.includes(searchQuery);
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/absher/service/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">الخدمات الحكومية</h1>
            <button
              onClick={() => navigate("/absher")}
              className="text-green-600 hover:text-green-700"
            >
              ← العودة
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن الخدمات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900">الفئات</h3>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Services Grid */}
          <div className="md:col-span-3">
            <div className="grid gap-4">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleServiceClick(service.id)}
                  >
                    <div className="flex gap-6">
                      <div className="text-5xl">{service.icon}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              {service.titleAr}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {service.titleEn}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getSensitivityColor(
                              service.sensitivity
                            )}`}
                          >
                            {service.sensitivity === "low"
                              ? "منخفضة"
                              : service.sensitivity === "medium"
                              ? "متوسطة"
                              : "عالية"}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4">{service.description}</p>

                        <div className="flex flex-wrap gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{service.processingTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span>{service.fee}</span>
                          </div>
                        </div>

                        <div className="flex items-center text-green-600 hover:text-green-700">
                          <span className="text-sm font-semibold">اطلب الآن</span>
                          <ChevronRight className="w-4 h-4 mr-2" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-gray-600 text-lg">
                    لم يتم العثور على خدمات مطابقة للبحث
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
