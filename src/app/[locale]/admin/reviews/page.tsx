'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronRight, Plus, Trash2, Star, MessageSquare } from 'lucide-react';

export default function ReviewsAdmin({ params }: { params: { locale: string } }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [source, setSource] = useState('google'); // google, facebook, etc.

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'customerReviews'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !text) return alert("يرجى إدخال الاسم والنص");

    try {
      await addDoc(collection(db, 'customerReviews'), {
        name,
        text,
        rating,
        source,
        createdAt: new Date().toISOString()
      });
      setName('');
      setText('');
      setRating(5);
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إضافة التقييم');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      await deleteDoc(doc(db, 'customerReviews', id));
      fetchReviews();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-gray-500 mb-6">
          <Link href={`/${params.locale}/admin`} className="hover:text-primary">لوحة التحكم</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">آراء الزبائن</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">إدارة آراء وتقييمات الزبائن</h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> إضافة تقييم جديد
          </h2>
          <form onSubmit={handleAddReview} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-600">اسم الزبون</label>
                <input required value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white" placeholder="مثال: أحمد عبد الله" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-600">المصدر</label>
                <select value={source} onChange={e=>setSource(e.target.value)} className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white">
                  <option value="google">Google Reviews</option>
                  <option value="facebook">Facebook</option>
                  <option value="direct">رسائل واتساب/مباشر</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-2 text-gray-600">التقييم (النجوم)</label>
              <select value={rating} onChange={e=>setRating(Number(e.target.value))} className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white">
                <option value={5}>5 نجوم - ممتاز</option>
                <option value={4}>4 نجوم - جيد جداً</option>
                <option value={3}>3 نجوم - جيد</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-600">رأي الزبون</label>
              <textarea required value={text} onChange={e=>setText(e.target.value)} rows={3} className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white resize-none" placeholder="اكتب رأي الزبون هنا..." />
            </div>

            <button type="submit" className="bg-primary hover:bg-gold text-white px-6 py-3 rounded-xl font-bold transition-colors">
              حفظ التقييم
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> التقييمات الحالية
          </h2>
          
          {loading ? <div className="text-center py-8">جاري التحميل...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.length === 0 ? (
                <div className="col-span-2 text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">لا توجد تقييمات مضافة حالياً.</div>
              ) : (
                reviews.map(rev => (
                  <div key={rev.id} className="p-4 border rounded-xl bg-gray-50 flex flex-col relative">
                    <button onClick={() => handleDelete(rev.id)} className="absolute top-4 left-4 text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h3 className="font-bold text-lg">{rev.name}</h3>
                    <div className="flex items-center gap-1 my-2 text-yellow-400">
                      {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{rev.text}</p>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full w-max mt-4">
                      {rev.source === 'google' ? 'جوجل' : rev.source === 'facebook' ? 'فيسبوك' : 'مباشر'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
