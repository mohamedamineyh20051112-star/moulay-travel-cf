export const defaultFormsConfig: Record<string, any> = {
  organized_trips: {
    title: { ar: 'طلب حجز رحلة منظمة', fr: 'Réservation de voyage organisé', en: 'Organized Trip Booking' },
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم واللقب', fr: 'Nom et prénom', en: 'Full Name' }, required: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف (واتساب)', fr: 'Numéro de téléphone', en: 'Phone Number' }, required: true },
      { id: 'destination', type: 'text', label: { ar: 'الوجهة المطلوبة', fr: 'Destination souhaitée', en: 'Desired Destination' }, required: true },
      { id: 'travelers', type: 'number', label: { ar: 'عدد المسافرين', fr: 'Nombre de voyageurs', en: 'Number of travelers' }, required: true },
      { id: 'notes', type: 'textarea', label: { ar: 'ملاحظات إضافية', fr: 'Remarques', en: 'Notes' }, required: false }
    ]
  },
  visas: {
    title: { ar: 'طلب تأشيرة', fr: 'Demande de Visa', en: 'Visa Application' },
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم واللقب', fr: 'Nom et prénom', en: 'Full Name' }, required: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', fr: 'Numéro de téléphone', en: 'Phone Number' }, required: true },
      { id: 'country', type: 'text', label: { ar: 'دولة التأشيرة', fr: 'Pays de destination', en: 'Destination Country' }, required: true },
      { id: 'visaType', type: 'select', label: { ar: 'نوع التأشيرة', fr: 'Type de visa', en: 'Visa Type' }, required: true, options: [
        { ar: 'سياحية', fr: 'Touristique', en: 'Tourist' },
        { ar: 'دراسية', fr: 'Études', en: 'Student' },
        { ar: 'عمل', fr: 'Travail', en: 'Work' }
      ]},
      { id: 'notes', type: 'textarea', label: { ar: 'ملاحظات إضافية', fr: 'Remarques', en: 'Notes' }, required: false }
    ]
  },
  car_rental: {
    title: { ar: 'تأجير سيارة', fr: 'Location de voiture', en: 'Car Rental' },
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم واللقب', fr: 'Nom et prénom', en: 'Full Name' }, required: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', fr: 'Numéro de téléphone', en: 'Phone' }, required: true },
      { id: 'carType', type: 'select', label: { ar: 'نوع السيارة', fr: 'Type de voiture', en: 'Car Type' }, required: true, options: [
        { ar: 'اقتصادية', fr: 'Économique', en: 'Economy' },
        { ar: 'عائلية', fr: 'Familiale', en: 'Family' },
        { ar: 'فخمة (VIP)', fr: 'Luxe (VIP)', en: 'Luxury (VIP)' }
      ]},
      { id: 'days', type: 'number', label: { ar: 'عدد الأيام', fr: 'Nombre de jours', en: 'Number of days' }, required: true },
      { id: 'notes', type: 'textarea', label: { ar: 'ملاحظات', fr: 'Remarques', en: 'Notes' }, required: false }
    ]
  },
  insurance: {
    title: { ar: 'تأمين السفر', fr: 'Assurance Voyage', en: 'Travel Insurance' },
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم واللقب', fr: 'Nom et prénom', en: 'Full Name' }, required: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', fr: 'Téléphone', en: 'Phone' }, required: true },
      { id: 'destination', type: 'text', label: { ar: 'الوجهة', fr: 'Destination', en: 'Destination' }, required: true },
      { id: 'duration', type: 'number', label: { ar: 'مدة التأمين (بالأيام)', fr: 'Durée (jours)', en: 'Duration (days)' }, required: true },
      { id: 'notes', type: 'textarea', label: { ar: 'ملاحظات', fr: 'Remarques', en: 'Notes' }, required: false }
    ]
  },
  wellness: {
    title: { ar: 'حجز رحلة استشفائية', fr: 'Réservation cure thermale', en: 'Wellness Trip' },
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم واللقب', fr: 'Nom et prénom', en: 'Full Name' }, required: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', fr: 'Téléphone', en: 'Phone' }, required: true },
      { id: 'destination', type: 'text', label: { ar: 'المركب المعدني المفضل', fr: 'Complexe thermal préféré', en: 'Preferred Thermal Complex' }, required: false },
      { id: 'persons', type: 'number', label: { ar: 'عدد الأشخاص', fr: 'Nombre de personnes', en: 'Number of persons' }, required: true },
      { id: 'notes', type: 'textarea', label: { ar: 'ملاحظات', fr: 'Remarques', en: 'Notes' }, required: false }
    ]
  },
  vip_trips: {
    title: { ar: 'حجز رحلة VIP', fr: 'Réservation VIP', en: 'VIP Booking' },
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم واللقب', fr: 'Nom et prénom', en: 'Full Name' }, required: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', fr: 'Téléphone', en: 'Phone' }, required: true },
      { id: 'requests', type: 'textarea', label: { ar: 'طلباتك الخاصة', fr: 'Demandes spéciales', en: 'Special Requests' }, required: true }
    ]
  },
  hammams: {
    title: { ar: 'حجز حمام / مركب معدني', fr: 'Réservation Hammam', en: 'Hammam Booking' },
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم واللقب', fr: 'Nom et prénom', en: 'Full Name' }, required: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', fr: 'Téléphone', en: 'Phone' }, required: true },
      { id: 'persons', type: 'number', label: { ar: 'عدد الأشخاص', fr: 'Nombre de personnes', en: 'Number of persons' }, required: true },
      { id: 'notes', type: 'textarea', label: { ar: 'ملاحظات', fr: 'Remarques', en: 'Notes' }, required: false }
    ]
  },
  cars: {
    title: { ar: 'حجز سيارة', fr: 'Réservation de voiture', en: 'Car Booking' },
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم واللقب', fr: 'Nom et prénom', en: 'Full Name' }, required: true },
      { id: 'idNumber', type: 'text', label: { ar: 'رقم التعريف الوطني', fr: 'Numéro d\'identité nationale', en: 'National ID Number' }, required: true },
      { id: 'licenseNumber', type: 'text', label: { ar: 'رقم رخصة القيادة', fr: 'Numéro de permis de conduire', en: 'Driving License Number' }, required: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', fr: 'Numéro de téléphone', en: 'Phone' }, required: true },
      { id: 'bookingDate', type: 'date', label: { ar: 'تاريخ الحجز', fr: 'Date de réservation', en: 'Booking Date' }, required: true },
      { id: 'days', type: 'number', label: { ar: 'عدد أيام الحجز', fr: 'Nombre de jours de réservation', en: 'Number of booking days' }, required: true },
      { id: 'scope', type: 'select', label: { ar: 'نطاق السير', fr: 'Zone de circulation', en: 'Driving Scope' }, required: true, options: [
        { ar: 'داخل الولاية', fr: 'À l\'intérieur de la wilaya', en: 'Inside State' },
        { ar: 'خارج الولاية', fr: 'À l\'extérieur de la wilaya', en: 'Outside State' }
      ]},
      { id: 'drivingDistance', type: 'select', label: { ar: 'مسافة السير في اليوم', fr: 'Distance de conduite par jour', en: 'Driving distance per day' }, required: true, options: [
        { ar: 'أقل من 250 كم في اليوم', fr: 'Moins de 250 km par jour', en: 'Less than 250 km/day' },
        { ar: 'أكثر من 250 كم في اليوم', fr: 'Plus de 250 km par jour', en: 'More than 250 km/day' }
      ]},
      { id: 'drivingYears', type: 'number', label: { ar: 'كم سنة مضت على حصولك على رخصة القيادة؟', fr: 'Combien d\'années de permis ?', en: 'Years with driver license' }, required: true },
      { id: 'carName', type: 'text', label: { ar: 'السيارة', fr: 'Voiture', en: 'Car' }, required: false, hidden: true }
    ]
  },
  custom_trips: {
    title: { ar: 'تصميم رحلة خاصة', fr: 'Voyage sur mesure', en: 'Custom Trip' },
    fields: [
      { id: 'fullName', type: 'text', label: { ar: 'الاسم واللقب', fr: 'Nom et prénom', en: 'Full Name' }, required: true },
      { id: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', fr: 'Téléphone', en: 'Phone' }, required: true },
      { id: 'destination', type: 'text', label: { ar: 'الوجهات المفضلة', fr: 'Destinations', en: 'Destinations' }, required: true },
      { id: 'budget', type: 'text', label: { ar: 'الميزانية التقريبية', fr: 'Budget approximatif', en: 'Approximate Budget' }, required: false },
      { id: 'details', type: 'textarea', label: { ar: 'تفاصيل الرحلة', fr: 'Détails', en: 'Details' }, required: true }
    ]
  }
};
