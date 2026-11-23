'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { ArrowRight, Mail, Phone, Calendar, Search, CreditCard, Tag, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function MarketersAdmin({ params }: { params: { locale: string } }) {
  const [marketers, setMarketers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMarketers();
  }, []);

  const fetchMarketers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'marketer'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMarketers(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const approveMarketer = async (id: string, currentCount: number) => {
    const commission = prompt('أدخل تسعيرة العمولة لهذا المسوق (مثال: 1000 للحجز الواحد بالدينار):', '1000');
    if (commission === null) return; // User cancelled
    
    try {
      // Generate a sequential code based on the number of approved marketers
      // To make it simple, we use MT/ + random 4 digits, or a timestamp-based ID to ensure uniqueness,
      // but the user requested MT/01, MT/02.
      // Let's count approved marketers to get the next number:
      const q = query(collection(db, 'users'), where('role', '==', 'marketer'), where('status', '==', 'approved'));
      const snap = await getDocs(q);
      const nextNumber = snap.size + 1;
      const paddedNumber = nextNumber.toString().padStart(2, '0');
      const promoCode = `MT/${paddedNumber}`;

      await updateDoc(doc(db, 'users', id), {
        status: 'approved',
        promoCode: promoCode
      });
      
      alert('تمت الموافقة بنجاح! كود الخصم المولد: ' + promoCode);
      fetchMarketers();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الموافقة.');
    }
  };

  const rejectMarketer = async (id: string) => {
    if (!confirm('هل أنت متأكد من إيقاف هذا المسوق؟')) return;
    try {
      await updateDoc(doc(db, 'users', id), {
        status: 'rejected'
      });
      fetchMarketers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMarketer = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المسوق نهائياً من قاعدة البيانات؟')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      fetchMarketers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMarketers = marketers.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.promoCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/${params.locale}/admin`} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">إدارة المسوقين</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="ابحث بالاسم، الإيميل، أو كود الخصم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-sm font-semibold text-gray-600">المسوق</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">التواصل</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">حساب CCP</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">الحالة / الكود</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">جاري التحميل...</td></tr>
                ) : filteredMarketers.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">لا يوجد مسوقين حالياً</td></tr>
                ) : (
                  filteredMarketers.map((marketer) => (
                    <tr key={marketer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{marketer.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(marketer.createdAt).toLocaleDateString('fr-FR')}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {marketer.email}</div>
                          <div className="flex items-center gap-1" dir="ltr"><Phone className="w-3 h-3" /> {marketer.phone || '-'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-800 font-medium bg-gray-100 px-3 py-1 rounded-lg inline-flex" dir="ltr">
                          <CreditCard className="w-4 h-4 text-gray-500" /> {marketer.ccp || 'غير محدد'}
                        </div>
                      </td>
                      <td className="p-4">
                        {marketer.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600">
                            قيد المراجعة
                          </span>
                        ) : marketer.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                            مرفوض
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600 w-fit">
                              مقبول
                            </span>
                            <span className="inline-flex items-center gap-1 text-gold font-black tracking-wider bg-black/5 px-2 py-1 rounded w-fit text-sm">
                              <Tag className="w-3 h-3 text-gold" /> {marketer.promoCode}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {marketer.status === 'pending' && (
                            <button 
                              onClick={() => approveMarketer(marketer.id, marketers.length)}
                              className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="قبول وتوليد كود"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {marketer.status !== 'rejected' && (
                            <button 
                              onClick={() => rejectMarketer(marketer.id)}
                              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="رفض / إيقاف"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button onClick={() => deleteMarketer(marketer.id)} className="p-2 bg-gray-50 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors" title="حذف نهائي"><Trash2 className="w-5 h-5" /></button>
</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}









