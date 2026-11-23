'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ArrowRight, Mail, Phone, Calendar, Search, Copy, Download, BarChart } from 'lucide-react';
import Link from 'next/link';

export default function ClientsAdmin({ params }: { params: { locale: string } }) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'client'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc): any => ({ id: doc.id, ...doc.data() }));
      // Sort by newest
      data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setClients(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const copyEmails = () => {
    const emails = clients.map(c => c.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emails);
    alert('تم نسخ جميع الإيميلات بنجاح لإرسال عروض ترويجية.');
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientStats, setClientStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchClientStats = async (client: any) => {
    setSelectedClient(client);
    setStatsModalOpen(true);
    setLoadingStats(true);
    setClientStats([]);

    try {
      // Fetch bookings where email or phone matches
      const bookingsQuery = query(collection(db, 'bookings'));
      const bookingsSnap = await getDocs(bookingsQuery);
      
      const formQuery = query(collection(db, 'form_submissions'));
      const formSnap = await getDocs(formQuery);

      let activities: any[] = [];

      // Add bookings (omra, hotels, flights)
      bookingsSnap.docs.forEach(doc => {
        const d = doc.data();
        if (d.email === client.email || d.phone === client.phone) {
          activities.push({
            id: doc.id,
            type: d.type || 'Booking',
            date: d.createdAt,
            status: d.status,
            details: d.destination || d.hotel || 'حجز'
          });
        }
      });

      // Add dynamic form submissions
      formSnap.docs.forEach(doc => {
        const d = doc.data();
        // data contains the form fields
        const emailField = Object.values(d.data || {}).find((v: any) => typeof v === 'string' && v.includes('@'));
        const phoneField = Object.values(d.data || {}).find((v: any) => typeof v === 'string' && (v.startsWith('05') || v.startsWith('06') || v.startsWith('07') || v.startsWith('+')));
        
        if (emailField === client.email || phoneField === client.phone || (d.data?.email === client.email) || (d.data?.phone === client.phone)) {
          activities.push({
            id: doc.id,
            type: 'Form Submission',
            date: d.createdAt,
            status: d.status || 'new',
            details: d.formId === 'airplane' ? 'تذكرة طيران' : d.formId === 'train' ? 'تذكرة قطار' : d.formId === 'ferry' ? 'تذكرة باخرة' : d.formId || 'نموذج'
          });
        }
      });

      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setClientStats(activities);
    } catch (e) {
      console.error(e);
    }
    setLoadingStats(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/${params.locale}/admin`} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">إدارة الزبائن</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="ابحث بالاسم، الإيميل، أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            
            <button 
              onClick={copyEmails}
              className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl transition-colors font-medium w-full md:w-auto justify-center"
            >
              <Copy className="w-4 h-4" /> نسخ جميع الإيميلات (للعروض)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-sm font-semibold text-gray-600">الزبون</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">البريد الإلكتروني</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">رقم الهاتف</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">تاريخ التسجيل</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">جاري التحميل...</td></tr>
                ) : filteredClients.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">لا يوجد زبائن حالياً</td></tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{client.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" /> {client.email}
                        </div>
                      </td>
                      <td className="p-4" dir="ltr">
                        <div className="flex items-center justify-end gap-2 text-gray-600">
                          {client.phone || '-'} <Phone className="w-4 h-4" />
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => fetchClientStats(client)}
                            className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Calendar className="w-4 h-4" /> إحصائيات
                          </button>
                          <a 
                            href={`mailto:${client.email}?subject=عرض خاص من Moulay Travel`}
                            className="inline-flex items-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Mail className="w-4 h-4" /> إرسال عرض
                          </a>
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

      {/* Stats Modal */}
      {statsModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold">إحصائيات الزبون: {selectedClient?.name}</h2>
              <button onClick={() => setStatsModalOpen(false)} className="text-gray-500 hover:text-red-500 font-bold text-xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              {loadingStats ? (
                <div className="text-center py-12 text-gray-500">جاري جلب الإحصائيات...</div>
              ) : clientStats.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-medium text-lg">لم يقم هذا الزبون بأي حجوزات بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">إجمالي الحركات</p>
                      <p className="text-2xl font-black text-primary">{clientStats.length}</p>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mb-4">سجل النشاطات</h3>
                  {clientStats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                          <BarChart className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{stat.type} - {stat.details}</p>
                          <p className="text-sm text-gray-500" dir="ltr">{new Date(stat.date).toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
                        {stat.status}
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
  );
}






