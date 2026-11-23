'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User as UserIcon, LogOut, Mail, Phone, Calendar, Tag, CreditCard, BarChart } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ProfilePage({ params }: { params: { locale: string } }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, paidBookings: 0 });
  const [fetchingStats, setFetchingStats] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router, params.locale]);

  useEffect(() => {
    const fetchMarketerStats = async () => {
      if (userData?.role === 'marketer' && userData?.promoCode) {
        setFetchingStats(true);
        try {
          const q = query(collection(db, 'bookings'), where('promoCode', '==', userData.promoCode));
          const snap = await getDocs(q);
          
          let pending = 0;
          let paid = 0;
          
          snap.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'paid') paid++;
            else pending++;
          });
          
          setStats({ totalBookings: snap.size, pendingBookings: pending, paidBookings: paid });
        } catch (e) {
          console.error(e);
        }
        setFetchingStats(false);
      }
    };
    if (userData) fetchMarketerStats();
  }, [userData]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-32 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-primary to-[#2a2a2a] p-8 text-white text-center">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/20">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{userData?.name}</h1>
            <p className="text-white/80">{userData?.role === 'marketer' ? 'حساب مسوق (Affiliate)' : 'حساب زبون'}</p>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">المعلومات الشخصية</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                  <p className="font-bold text-gray-800">{userData?.email}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">رقم الهاتف</p>
                  <p className="font-bold text-gray-800" dir="ltr">{userData?.phone || 'غير محدد'}</p>
                </div>
              </div>
            </div>

            {userData?.role === 'marketer' && (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-t pt-8">لوحة تحكم المسوق</h2>
                
                {userData.status === 'pending' ? (
                  <div className="bg-yellow-50 text-yellow-700 p-6 rounded-2xl border border-yellow-200 text-center font-bold">
                    حسابك قيد المراجعة. لا يمكنك رؤية إحصائياتك أو الكود الخاص بك حتى تتم الموافقة عليه من الإدارة.
                  </div>
                ) : userData.status === 'rejected' ? (
                  <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center font-bold">
                    تم إيقاف حسابك من قبل الإدارة.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-gold to-yellow-500 p-6 rounded-2xl text-white flex items-center justify-between shadow-md">
                        <div>
                          <p className="text-white/90 text-sm mb-1">كود الخصم الخاص بك</p>
                          <p className="text-3xl font-black tracking-widest">{userData.promoCode}</p>
                        </div>
                        <Tag className="w-10 h-10 opacity-50" />
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm mb-1">نسبة العمولة (لكل حجز ناجح)</p>
                          <p className="text-2xl font-bold text-gray-800">{userData.commissionRate || 1000} د.ج</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-primary opacity-50" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-4 mt-6">إحصائيات المبيعات</h3>
                    {fetchingStats ? (
                      <div className="text-center py-4">جاري تحميل الإحصائيات...</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                          <p className="text-gray-500 text-sm mb-1">إجمالي الحجوزات المجلوبة</p>
                          <p className="text-2xl font-black text-gray-800">{stats.totalBookings}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                          <p className="text-gray-500 text-sm mb-1">حجوزات قيد المعالجة</p>
                          <p className="text-2xl font-bold text-orange-500">{stats.pendingBookings}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                          <p className="text-gray-500 text-sm mb-1">حجوزات مؤكدة (أرباح)</p>
                          <p className="text-2xl font-bold text-green-500">{stats.paidBookings}</p>
                          <p className="text-sm text-green-600 font-bold mt-1">
                            الإجمالي: {stats.paidBookings * (userData.commissionRate || 1000)} د.ج
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="mt-10 flex justify-center">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-8 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" /> تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
