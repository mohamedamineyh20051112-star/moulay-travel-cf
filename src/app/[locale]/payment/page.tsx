import { Landmark } from "lucide-react";

export default function PaymentPage() {
  return (
    <div className="pt-32 pb-16 bg-gray-50 min-h-[70vh]">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">
          معلومات الدفع
        </h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-gold text-center">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
            <Landmark size={32} />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-primary">لا يوجد دفع إلكتروني حالياً</h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            يُرجى العلم أن موقع &quot;مولاي ترافل&quot; لا يوفر حالياً خاصية الدفع الإلكتروني عبر البطاقات البنكية (CIB, Edahabia, Visa, Mastercard). 
            عملية الدفع تتم لاحقاً في مقر الوكالة أو عبر التحويل البنكي/البريدي (CCP) بعد تأكيد حجزك من طرف فريقنا.
          </p>

          <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl text-right">
            <h3 className="font-bold text-lg mb-4 text-gray-800">الحسابات البنكية المعتمدة (سيتم تزويدك بها):</h3>
            <ul className="space-y-3 text-gray-600 list-disc list-inside">
              <li>حساب CCP (بريد الجزائر) - يتم إرساله بعد التأكيد.</li>
              <li>حساب بنكي (BNA / CPA) - يتم إرساله بعد التأكيد.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
