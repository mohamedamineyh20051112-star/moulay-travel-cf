'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User as UserIcon, LogOut, Mail, Phone, CreditCard, Tag, TrendingUp, DollarSign, Clock, AlertCircle, XCircle } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function MarketerDashboard({ params }: { params: { locale: string } }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ uses: 0, pendingCommission: 0, paidCommission: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const rawCommission = Number(userData?.commissionRate || 0);
  const commissionRate = rawCommission > 0 ? rawCommission : 1000;

  useEffect(() => {
    if (!loading) {
      if (!user || userData?.role !== 'marketer') {
        router.push(`/${params.locale}`);
      } else if (userData?.status === 'approved' && userData?.promoCode) {
        fetchStats(userData.promoCode, commissionRate);
      } else {
        setStatsLoading(false);
      }
    }
  }, [user, userData, loading, router, params.locale, commissionRate]);

  const fetchStats = async (promoCode: string, rate: number) => {
    try {
      const q = query(collection(db, 'bookings'), where('promoCode', '==', promoCode));
      const snapshot = await getDocs(q);
      
      const uses = snapshot.size;
      const pendingCommission = uses * rate;
      
      setStats({ uses, pendingCommission, paidCommission: 0 });
    } catch (error) {
      console.error("Error fetching marketer stats", error);
    }
    setStatsLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push(`/${params.locale}`);
  };

  if (loading || !user || userData?.role !== 'marketer') return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-24 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">لوحة تحكم المسوق</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> خروج
          </button>
        </div>

        {userData.status === 'pending' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">حسابك قيد المراجعة</h2>
            <p className="text-gray-500 mb-6">مرحباً {userData.name}. تم تسجيل حسابك كمسوق بنجاح، لكنه يحتاج لموافقة الإدارة أولاً. سيتم تخصيص كود خصم خاص بك فور الموافقة.</p>
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-medium text-sm border border-orange-200">
              <AlertCircle className="w-4 h-4" /> يرجى الانتظار، سنقوم بتفعيل حسابك قريباً.
            </div>
          </div>
        ) : userData.status === 'rejected' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-8 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">تم إيقاف أو رفض الحساب</h2>
            <p className="text-gray-500 mb-4">عذراً {userData.name}، حساب المسوق الخاص بك موقوف أو مرفوض حالياً. يرجى التواصل مع الإدارة للمزيد من التفاصيل.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Promo Code Card */}
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl shadow-lg p-8 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10">
                <Tag className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <p className="text-white/80 font-medium mb-1">كود الخصم الخاص بك</p>
                <div className="flex items-end gap-4 mb-4">
                  <h2 className="text-5xl font-black tracking-wider text-gold">{userData.promoCode || 'MT/XX'}</h2>
                  <button 
                    onClick={() => {navigator.clipboard.writeText(userData.promoCode || ''); alert('تم نسخ الكود!');}}
                    className="mb-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
                  >
                    نسخ الكود
                  </button>
                </div>
                <p className="text-sm text-white/70 max-w-lg">
                  شارك هذا الكود مع عملائك. سيحصلون على تخفيض عند الحجز، وستحصل أنت على عمولة مقابل كل حجز ناجح يتم عبر هذا الكود.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">عدد الاستخدامات</p>
                  <p className="text-2xl font-bold text-gray-800">{statsLoading ? '-' : stats.uses}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">أرباح قيد المراجعة</p>
                  <p className="text-2xl font-bold text-gray-800">{statsLoading ? '-' : stats.pendingCommission} <span className="text-sm text-gray-500 font-normal">دج</span></p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center shrink-0">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">أرباح مسددة</p>
                  <p className="text-2xl font-bold text-gray-800">{statsLoading ? '-' : stats.paidCommission} <span className="text-sm text-gray-500 font-normal">دج</span></p>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">معلومات الحساب المالي</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الاسم الكامل</p>
                    <p className="font-bold text-gray-800">{userData.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">حساب CCP لتلقي الأرباح</p>
                    <p className="font-bold text-gray-800" dir="ltr">{userData.ccp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="font-bold text-gray-800">{userData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">رقم الهاتف</p>
                    <p className="font-bold text-gray-800" dir="ltr">{userData.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


