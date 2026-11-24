import { Landmark } from "lucide-react";

const PAYMENT_COPY = {
  ar: {
    title: "معلومات الدفع",
    subtitle: "لا يوجد دفع إلكتروني حالياً",
    desc: "يُرجى العلم أن موقع \"مولاي ترافل\" لا يوفر حالياً خاصية الدفع الإلكتروني عبر البطاقات البنكية (CIB، الذهبية، Visa، Mastercard). تتم عملية الدفع لاحقاً في مقر الوكالة أو عبر التحويل البنكي/البريدي (CCP) بعد تأكيد حجزك من طرف فريقنا.",
    accountsTitle: "الحسابات البنكية المعتمدة (سيتم تزويدك بها):",
    account1: "حساب CCP (بريد الجزائر) - يتم إرساله بعد التأكيد.",
    account2: "حساب بنكي (BNA / CPA) - يتم إرساله بعد التأكيد.",
  },
  fr: {
    title: "Informations de paiement",
    subtitle: "Aucun paiement en ligne pour le moment",
    desc: "Veuillez noter que le site Moulay Travel ne propose pas actuellement le paiement en ligne par carte bancaire (CIB, Edahabia, Visa, Mastercard). Le règlement s'effectue à l'agence ou par virement bancaire / postal (CCP) après confirmation de votre réservation par notre équipe.",
    accountsTitle: "Comptes agréés (fournis après confirmation) :",
    account1: "Compte CCP (Algérie Poste) - communiqué après confirmation.",
    account2: "Compte bancaire (BNA / CPA) - communiqué après confirmation.",
  },
  en: {
    title: "Payment Information",
    subtitle: "Online Card Payment Not Yet Available",
    desc: "Please note that Moulay Travel does not currently process online card payments (CIB, Edahabia, Visa, Mastercard) directly on the website. Payment is completed later at our agency office or via bank/postal transfer (CCP) once our team confirms your booking.",
    accountsTitle: "Approved Payment Accounts (shared upon confirmation):",
    account1: "CCP Account (Algérie Poste) - provided after booking confirmation.",
    account2: "Bank Account (BNA / CPA) - provided after booking confirmation.",
  },
} as const;

export default function PaymentPage({ params: { locale } }: { params: { locale: string } }) {
  const isRtl = locale === "ar";
  const copy =
    PAYMENT_COPY[(locale as keyof typeof PAYMENT_COPY)] || PAYMENT_COPY.fr;

  return (
    <div className="pt-32 pb-16 bg-gray-50 min-h-[70vh]" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">
          {copy.title}
        </h1>

        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-gold text-center">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
            <Landmark size={32} />
          </div>

          <h2 className="text-2xl font-bold mb-4 text-primary">{copy.subtitle}</h2>

          <p className="text-gray-600 mb-8 leading-relaxed">{copy.desc}</p>

          <div
            className={`bg-gray-50 border border-gray-200 p-6 rounded-xl ${
              isRtl ? "text-right" : "text-left"
            }`}
          >
            <h3 className="font-bold text-lg mb-4 text-gray-800">{copy.accountsTitle}</h3>
            <ul className="space-y-3 text-gray-600 list-disc list-inside">
              <li>{copy.account1}</li>
              <li>{copy.account2}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
