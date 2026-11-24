'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, Plane, Building, Target, ClipboardList } from 'lucide-react';

export default function AnalyticsAdmin({ params }: { params: { locale: string } }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [formSubmissions, setFormSubmissions] = useState<any[]>([]);
  const [marketers, setMarketers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsSnap, submissionsSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))),
          getDocs(collection(db, 'form_submissions')),
          getDocs(collection(db, 'users')),
        ]);

        setBookings(bookingsSnap.docs.map((d): any => ({ id: d.id, ...d.data() })));
        setFormSubmissions(submissionsSnap.docs.map((d): any => ({ id: d.id, ...d.data() })));

        const usersData = usersSnap.docs.map((d): any => ({ id: d.id, ...d.data() }));
        setMarketers(usersData.filter((u) => u.role === 'marketer' && u.status === 'approved'));
      } catch (e) {
        console.error('Error fetching analytics data', e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalBookings = bookings.length + formSubmissions.length;
  const hotelBookings = bookings.filter((b) => b.type === 'hotel').length;
  const flightBookings = bookings.filter((b) => b.type === 'flight').length;
  const omraBookings = bookings.filter((b) => b.type === 'omra').length;
  const dynamicFormRequests = formSubmissions.length;

  const marketerPerformance = marketers
    .map((m) => {
      const bookingUses = bookings.filter((b) => b.promoCode === m.promoCode).length;
      const formUses = formSubmissions.filter((s) => s.data?.promo_code === m.promoCode).length;
      return { ...m, uses: bookingUses + formUses };
    })
    .sort((a, b) => b.uses - a.uses);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/${params.locale}/admin`}
            className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">الإحصائيات الشاملة</h1>
        </div>

        {loading ? (
          <div className="text-center p-10 text-gray-500 font-bold">جاري تحميل البيانات...</div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-blue-500 rounded-xl">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-4 bg-green-50 text-green-500 rounded-xl">
                  <Building className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">طلبات الفنادق</p>
                  <p className="text-2xl font-bold text-gray-900">{hotelBookings}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-4 bg-orange-50 text-orange-500 rounded-xl">
                  <Plane className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">تذاكر الطيران</p>
                  <p className="text-2xl font-bold text-gray-900">{flightBookings}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-4 bg-purple-50 text-purple-500 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">طلبات العمرة</p>
                  <p className="text-2xl font-bold text-gray-900">{omraBookings}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">السيارات والرحلات والحمامات</p>
                  <p className="text-2xl font-bold text-gray-900">{dynamicFormRequests}</p>
                </div>
              </div>
            </div>

            {/* Marketers Performance */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="text-primary w-6 h-6" /> أداء المسوقين
                </h2>
              </div>
              <div className="p-6">
                {marketerPerformance.length === 0 ? (
                  <p className="text-gray-500 text-center">لا يوجد مسوقين نشطين حالياً.</p>
                ) : (
                  <div className="space-y-4">
                    {marketerPerformance.map((m, idx) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{m.name}</p>
                            <p className="text-sm text-gray-500" dir="ltr">
                              {m.promoCode}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-500">حجوزات باستعمال الكود</p>
                          <p className="text-xl font-black text-primary">{m.uses}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
