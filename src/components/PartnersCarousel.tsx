"use client";

import { useLocale } from "next-intl";

const AIRLINES = [
  { name: "Air Algérie", logo: "https://pics.avs.io/250/80/AH.png" },
  { name: "Turkish Airlines", logo: "https://pics.avs.io/250/80/TK.png" },
  { name: "Emirates", logo: "https://pics.avs.io/250/80/EK.png" },
  { name: "Qatar Airways", logo: "https://pics.avs.io/250/80/QR.png" },
  { name: "Air France", logo: "https://pics.avs.io/250/80/AF.png" },
  { name: "Saudia", logo: "https://pics.avs.io/250/80/SV.png" },
  { name: "Tunisair", logo: "https://pics.avs.io/250/80/TU.png" },
  { name: "Tassili Airlines", logo: "https://pics.avs.io/250/80/SF.png" }
];

export default function PartnersCarousel() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  // To create an infinite scroll, we duplicate the array
  const duplicatedAirlines = [...AIRLINES, ...AIRLINES];

  return (
    <section className="py-16 bg-white border-y border-gray-100 overflow-hidden relative">
      <div className="container mx-auto px-4 mb-8 text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">
          {isRtl ? 'شركاء النجاح' : locale === 'fr' ? 'Nos Partenaires' : 'Our Partners'}
        </h2>
        <div className="w-24 h-1 bg-gold mx-auto rounded-full"></div>
      </div>

      <div className="relative flex overflow-x-hidden group mt-10">
        <div className="flex space-x-12 px-6 items-center whitespace-nowrap animate-marquee rtl:space-x-reverse">
          {duplicatedAirlines.map((airline, index) => (
            <div key={index} className="flex-shrink-0 flex items-center justify-center w-48 h-20 transition-transform duration-300 hover:scale-110 cursor-pointer">
              <img 
                src={airline.logo} 
                alt={airline.name} 
                className="max-h-full max-w-full object-contain drop-shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    const span = document.createElement('span');
                    span.className = "text-xl font-bold text-gray-500 uppercase tracking-widest";
                    span.innerText = airline.name;
                    e.currentTarget.parentElement.appendChild(span);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        [dir="rtl"] .animate-marquee {
          animation: marquee-rtl 35s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-rtl {
          0% { transform: translateX(0%); }
          100% { transform: translateX(50%); }
        }
      `}} />
    </section>
  );
}
