'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Settings, Users, LogOut, Home, Plane, MapPin, ImageIcon, BarChart3, UserCheck, HeartHandshake, LayoutTemplate, Menu, X, Car, Percent, Globe } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, getCountFromServer, onSnapshot, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

function useAdminNotifications() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Request permission for browser notifications
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const playSound = () => {
      try {
        // Will fallback to browser default beep if audio file is not found
        const audio = new Audio('/notification.mp3'); 
        audio.play().catch(e => console.log('Audio play error:', e));
      } catch (e) {}
    };

    const q = query(collection(db, 'form_submissions'), where('status', '==', 'new'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const createdAt = new Date(data.createdAt).getTime();
          const now = Date.now();
          if (now - createdAt < 10000) { // Only if created in the last 10 seconds
            playSound();
            if (Notification.permission === 'granted') {
              new Notification('حجز جديد 🛎️', {
                body: 'يوجد طلب حجز جديد في لوحة التحكم.',
                icon: '/logo.jpg'
              });
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);
}

export default function AdminDashboard({ params }: { params: { locale: string } }) {
  useAdminNotifications();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    cars: 0,
    hammams: 0,
    organized: 0,
    vip: 0,
    omra: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [c, h, o, v, om] = await Promise.all([
          getCountFromServer(collection(db, 'cars')),
          getCountFromServer(collection(db, 'hammams')),
          getCountFromServer(collection(db, 'organized_trips_hotels')),
          getCountFromServer(collection(db, 'vip_trips_hotels')),
          getCountFromServer(collection(db, 'omraHotels'))
        ]);
        setStats({
          cars: c.data().count,
          hammams: h.data().count,
          organized: o.data().count,
          vip: v.data().count,
          omra: om.data().count
        });
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    await signOut(auth);
    router.push(`/${params.locale}/admin/login`);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100 text-center flex justify-between items-center md:block">
        <h2 className="text-2xl font-bold text-primary">Moulay Travel</h2>
        <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link href={`/${params.locale}/admin`} className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-medium transition-colors">
          <Home className="w-5 h-5" /> الرئيسية
        </Link>
        <Link href={`/${params.locale}/admin/analytics`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
          <BarChart3 className="w-5 h-5" /> الإحصائيات
        </Link>
        <Link href={`/${params.locale}/admin/clients`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
          <Users className="w-5 h-5" /> الزبائن
        </Link>
        <Link href={`/${params.locale}/admin/marketers`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
          <HeartHandshake className="w-5 h-5" /> المسوقين
        </Link>
        <Link href={`/${params.locale}/admin/omra-hotels`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
          <Building2 className="w-5 h-5" /> فنادق العمرة
        </Link>
        
        

        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">رحلات VIP</p>
          <Link href={`/${params.locale}/admin/vip-trips-hotels`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
            <Building2 className="w-5 h-5" /> فنادق وبرامج VIP
          </Link>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">الرحلات المنظمة</p>
          <Link href={`/${params.locale}/admin/organized-trips-hotels`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
            <Building2 className="w-5 h-5" /> فنادق وبرامج الرحلات
          </Link>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">الحمامات والمركبات</p>

          <Link href={`/${params.locale}/admin/hammams-list`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
            <Building2 className="w-5 h-5" /> الحمامات
          </Link>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">خدمات أخرى</p>
          <Link href={`/${params.locale}/admin/cars`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
            <Car className="w-5 h-5" /> السيارات (Nos collection)
          </Link>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">الوجهات والمظهر</p>
          <Link href={`/${params.locale}/admin/services-destinations`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
            <Globe className="w-5 h-5" /> الوجهات والدول
          </Link>
          <Link href={`/${params.locale}/admin/hero`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
            <ImageIcon className="w-5 h-5" /> خلفيات الرئيسية
          </Link>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100">
          <Link href={`/${params.locale}/admin/discounts`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
            <Percent className="w-5 h-5" /> التخفيضات والتقسيط
          </Link>
          <Link href={`/${params.locale}/admin/reviews`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
            <UserCheck className="w-5 h-5" /> آراء الزبائن
          </Link>

          <Link href={`/${params.locale}/admin/settings`} className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" /> الإعدادات
          </Link>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-4 py-3 w-full text-white bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-colors">
          <LogOut className="w-5 h-5" /> تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row" dir="rtl">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-primary bg-primary/10 rounded-xl">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-primary">لوحة الإدارة</h2>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 flex flex-col md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop) */}
      <div className="w-72 bg-white shadow-lg flex-col hidden md:flex min-h-screen sticky top-0 border-l border-gray-100">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full max-w-[100vw]">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-right">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">مرحباً بك في لوحة تحكم Moulay Travel 👋</h1>
              <p className="text-gray-500 md:text-lg">من هنا يمكنك إدارة جميع أجزاء موقعك بكل سهولة.</p>
            </div>
            <div className="bg-primary/10 p-4 rounded-full hidden md:block">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 text-center">
              <div className="bg-blue-100 p-3 md:p-4 rounded-xl text-blue-600"><Car className="w-6 h-6 md:w-8 md:h-8"/></div>
              <div>
                <p className="text-gray-500 text-xs md:text-sm font-medium">السيارات</p>
                <h3 className="text-xl md:text-3xl font-black">{stats.cars}</h3>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 text-center">
              <div className="bg-green-100 p-3 md:p-4 rounded-xl text-green-600"><Building2 className="w-6 h-6 md:w-8 md:h-8"/></div>
              <div>
                <p className="text-gray-500 text-xs md:text-sm font-medium">الرحلات المنظمة</p>
                <h3 className="text-xl md:text-3xl font-black">{stats.organized}</h3>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 text-center">
              <div className="bg-purple-100 p-3 md:p-4 rounded-xl text-purple-600"><MapPin className="w-6 h-6 md:w-8 md:h-8"/></div>
              <div>
                <p className="text-gray-500 text-xs md:text-sm font-medium">رحلات VIP</p>
                <h3 className="text-xl md:text-3xl font-black">{stats.vip}</h3>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 text-center">
              <div className="bg-orange-100 p-3 md:p-4 rounded-xl text-orange-600"><Building2 className="w-6 h-6 md:w-8 md:h-8"/></div>
              <div>
                <p className="text-gray-500 text-xs md:text-sm font-medium">فنادق العمرة</p>
                <h3 className="text-xl md:text-3xl font-black">{stats.omra}</h3>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 text-center">
              <div className="bg-teal-100 p-3 md:p-4 rounded-xl text-teal-600"><MapPin className="w-6 h-6 md:w-8 md:h-8"/></div>
              <div>
                <p className="text-gray-500 text-xs md:text-sm font-medium">الحمامات</p>
                <h3 className="text-xl md:text-3xl font-black">{stats.hammams}</h3>
              </div>
            </div>
          </div>

          {/* Quick Actions / Navigation Cards */}
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">الوصول السريع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            
            <Link href={`/${params.locale}/admin/omra-hotels`} className="group bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:border-primary">
              <div className="bg-gray-50 group-hover:bg-primary/10 transition-colors w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">فنادق العمرة</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">إضافة، تعديل أو حذف فنادق العمرة ومميزاتها.</p>
            </Link>

            <Link href={`/${params.locale}/admin/vip-trips-hotels`} className="group bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:border-primary">
              <div className="bg-gray-50 group-hover:bg-primary/10 transition-colors w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">رحلات الـ VIP</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">إدارة الفنادق وبرامج الرحلات الخاصة بالـ VIP.</p>
            </Link>

            <Link href={`/${params.locale}/admin/organized-trips-hotels`} className="group bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:border-primary">
              <div className="bg-gray-50 group-hover:bg-primary/10 transition-colors w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Plane className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">الرحلات المنظمة</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">إدارة برامج السياحة والرحلات المنظمة بالقروبات.</p>
            </Link>

            <Link href={`/${params.locale}/admin/cars`} className="group bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:border-primary">
              <div className="bg-gray-50 group-hover:bg-primary/10 transition-colors w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">تأجير السيارات</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">إدارة اسطول السيارات الخاصة بالكراء.</p>
            </Link>

            <Link href={`/${params.locale}/admin/hammams-list`} className="group bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:border-primary">
              <div className="bg-gray-50 group-hover:bg-primary/10 transition-colors w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">السياحة الحموية</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">إدارة مراكز الراحة والاستجمام والحمامات المعدنية.</p>
            </Link>

            <Link href={`/${params.locale}/admin/discounts`} className="group bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:border-primary">
              <div className="bg-gray-50 group-hover:bg-primary/10 transition-colors w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Percent className="w-6 h-6 text-gray-600 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">التخفيضات والتقسيط</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">إدارة التخفيضات والعروض وخيارات الدفع بالتقسيط لخدماتك.</p>
            </Link>


          </div>
        </div>
      </main>
    </div>
  );
}