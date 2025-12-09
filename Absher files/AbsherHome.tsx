import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Search, Bell, User, Menu, X, ChevronRight, Shield } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function AbsherHome() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = [
    {
      id: "driving_license",
      titleAr: "رخصة القيادة",
      titleEn: "Driving License",
      icon: "🚗",
      description: "تجديد وإصدار رخص القيادة",
      category: "النقل",
    },
    {
      id: "passport",
      titleAr: "جواز السفر",
      titleEn: "Passport",
      icon: "✈️",
      description: "إصدار وتجديد جوازات السفر",
      category: "الخارجية",
    },
    {
      id: "civil_status",
      titleAr: "الأحوال المدنية",
      titleEn: "Civil Status",
      icon: "👨‍👩‍👧‍👦",
      description: "شهادات الميلاد والزواج والوفيات",
      category: "الداخلية",
    },
    {
      id: "labor",
      titleAr: "العمل والموارد البشرية",
      titleEn: "Labor & HR",
      icon: "💼",
      description: "تصاريح العمل والرواتب",
      category: "الموارد البشرية",
    },
    {
      id: "education",
      titleAr: "التعليم",
      titleEn: "Education",
      icon: "📚",
      description: "الشهادات الدراسية والقبول",
      category: "التعليم",
    },
    {
      id: "health",
      titleAr: "الصحة",
      titleEn: "Health",
      icon: "🏥",
      description: "الفحوصات الطبية والتقارير",
      category: "الصحة",
    },
    {
      id: "real_estate",
      titleAr: "العقارات",
      titleEn: "Real Estate",
      icon: "🏠",
      description: "تسجيل العقارات والملكية",
      category: "العدل",
    },
    {
      id: "tax",
      titleAr: "الضرائب",
      titleEn: "Taxes",
      icon: "📊",
      description: "الإقرارات الضريبية والدفع",
      category: "المالية",
    },
  ];

  const handleServiceClick = (serviceId: string) => {
    if (isAuthenticated) {
      navigate(`/absher/service/${serviceId}`);
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">أ</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">أبشر</h1>
                <p className="text-xs text-gray-500">منصة الخدمات الحكومية</p>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 mx-8">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث عن الخدمات..."
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-green-600">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">مستخدم</p>
                  </div>
                  <button
                    onClick={() => navigate("/absher/profile")}
                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                  >
                    <User className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    تسجيل الدخول
                  </Button>
                </a>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن الخدمات..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-l from-green-50 to-emerald-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                منصة أبشر
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                الوصول الآمن والسريع إلى جميع الخدمات الحكومية في مكان واحد
              </p>
              <div className="flex gap-4">
                {isAuthenticated ? (
                  <Button
                    onClick={() => navigate("/absher/services")}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    استعرض الخدمات
                  </Button>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                      ابدأ الآن
                    </Button>
                  </a>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <Shield className="w-24 h-24 text-green-600 mx-auto mb-4" />
                <p className="text-center text-gray-600">
                  حماية متقدمة لحسابك الحكومي
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-gray-900 mb-12">الخدمات الحكومية</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {service.titleAr}
                </h4>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center text-green-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-sm">اطلب الآن</span>
                  <ChevronRight className="w-4 h-4 mr-2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2.5M+</div>
              <p className="text-gray-600">مستخدم نشط</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">150+</div>
              <p className="text-gray-600">خدمة حكومية</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
              <p className="text-gray-600">متاح طوال الوقت</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <p className="text-gray-600">توفر الخدمة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">عن أبشر</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">حول المنصة</a></li>
                <li><a href="#" className="hover:text-white">الأخبار</a></li>
                <li><a href="#" className="hover:text-white">الإحصائيات</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">الدعم</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-white">تواصل معنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">القانونية</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-white">شروط الاستخدام</a></li>
                <li><a href="#" className="hover:text-white">الأمان</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">تطبيقات الجوال</h4>
              <div className="space-y-2">
                <button className="block w-full bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm">
                  iOS
                </button>
                <button className="block w-full bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm">
                  Android
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 منصة أبشر - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
