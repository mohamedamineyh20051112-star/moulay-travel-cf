'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { X, Mail, Lock, User as UserIcon, Phone, CreditCard, Loader2, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const params = useParams();
  const locale = (params?.locale || 'ar') as string;
  const isRtl = locale === 'ar';

  const t = {
    fr: {
      login: "Connexion",
      register: "Créer un compte",
      imClient: "Je suis client",
      imMarketer: "Je suis marketeur / partenaire",
      name: "Nom et prénom",
      email: "Adresse E-mail",
      phone: "Numéro de téléphone (WhatsApp)",
      ccp: "Numéro de compte (CCP ou RIP)",
      ccpDesc: "Ce compte sera utilisé pour envoyer vos bénéfices et commissions.",
      password: "Mot de passe",
      passwordRule: "Doit comporter au moins 6 caractères.",
      submitLogin: "Se connecter",
      submitRegisterMarketer: "Soumettre la demande",
      submitRegister: "Créer le compte",
      noAccount: "Vous n'avez pas de compte ? Créez-en un",
      hasAccount: "Vous avez déjà un compte ? Connectez-vous",
      emailInUse: "L'adresse e-mail est déjà utilisée.",
      wrongCredentials: "E-mail ou mot de passe incorrect.",
      weakPassword: "Le mot de passe est faible, il doit contenir au moins 6 caractères.",
      successMarketer: "Le compte a été créé avec succès. Votre compte est maintenant en cours de révision.",
      successClient: "Votre compte a été créé avec succès ! Bienvenue.",
      namePlaceholder: "Nom complet",
      emailPlaceholder: "email@exemple.com",
      phonePlaceholder: "+213 XX XX XX XX"
    },
    en: {
      login: "Log In",
      register: "Create an account",
      imClient: "I am a client",
      imMarketer: "I am a marketer / partner",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number (WhatsApp)",
      ccp: "Bank Account Number (CCP or RIP)",
      ccpDesc: "This account will be used to send your profits and commissions.",
      password: "Password",
      passwordRule: "Must be at least 6 characters.",
      submitLogin: "Log in",
      submitRegisterMarketer: "Submit registration request",
      submitRegister: "Create account",
      noAccount: "Don't have an account? Create one",
      hasAccount: "Already have an account? Log in",
      emailInUse: "The email address is already in use.",
      wrongCredentials: "Incorrect email or password.",
      weakPassword: "The password is weak, it must be at least 6 characters.",
      successMarketer: "Account created successfully. Your account is now under review.",
      successClient: "Your account has been created successfully! Welcome.",
      namePlaceholder: "Full Name",
      emailPlaceholder: "email@example.com",
      phonePlaceholder: "+213 XX XX XX XX"
    },
    ar: {
      login: "تسجيل الدخول",
      register: "إنشاء حساب جديد",
      imClient: "أنا زبون",
      imMarketer: "أنا مسوق / شريك",
      name: "الاسم واللقب",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف (واتساب)",
      ccp: "رقم الحساب البريدي (CCP أو RIP)",
      ccpDesc: "سيتم استخدام هذا الحساب لإرسال أرباحك وعمولاتك التسويقية.",
      password: "كلمة المرور",
      passwordRule: "يجب أن تتكون من 6 أحرف على الأقل.",
      submitLogin: "تسجيل الدخول",
      submitRegisterMarketer: "تقديم طلب التسجيل كمسوق",
      submitRegister: "إنشاء الحساب",
      noAccount: "لا تملك حساباً؟ أنشئ حساباً جديداً",
      hasAccount: "لديك حساب بالفعل؟ سجل الدخول",
      emailInUse: "البريد الإلكتروني مسجل مسبقاً.",
      wrongCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      weakPassword: "كلمة المرور ضعيفة، يجب أن تتكون من 6 أحرف على الأقل.",
      successMarketer: "تم إنشاء حساب المسوق بنجاح. حسابك الآن قيد المراجعة لتفعيل كود الخصم الخاص بك.",
      successClient: "تم إنشاء حسابك بنجاح! مرحباً بك.",
      namePlaceholder: "الاسم الكامل",
      emailPlaceholder: "email@example.com",
      phonePlaceholder: "+213 XX XX XX XX"
    }
  }[locale as "ar" | "fr" | "en"] || {
      login: "تسجيل الدخول",
      register: "إنشاء حساب جديد",
      imClient: "أنا زبون",
      imMarketer: "أنا مسوق / شريك",
      name: "الاسم واللقب",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف (واتساب)",
      ccp: "رقم الحساب البريدي (CCP أو RIP)",
      ccpDesc: "سيتم استخدام هذا الحساب لإرسال أرباحك وعمولاتك التسويقية.",
      password: "كلمة المرور",
      passwordRule: "يجب أن تتكون من 6 أحرف على الأقل.",
      submitLogin: "تسجيل الدخول",
      submitRegisterMarketer: "تقديم طلب التسجيل كمسوق",
      submitRegister: "إنشاء الحساب",
      noAccount: "لا تملك حساباً؟ أنشئ حساباً جديداً",
      hasAccount: "لديك حساب بالفعل؟ سجل الدخول",
      emailInUse: "البريد الإلكتروني مسجل مسبقاً.",
      wrongCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      weakPassword: "كلمة المرور ضعيفة، يجب أن تتكون من 6 أحرف على الأقل.",
      successMarketer: "تم إنشاء حساب المسوق بنجاح. حسابك الآن قيد المراجعة لتفعيل كود الخصم الخاص بك.",
      successClient: "تم إنشاء حسابك بنجاح! مرحباً بك.",
      namePlaceholder: "الاسم الكامل",
      emailPlaceholder: "email@example.com",
      phonePlaceholder: "+213 XX XX XX XX"
    };

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'client' | 'marketer'>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [ccp, setCcp] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userData: any = {
          uid: user.uid,
          name,
          email,
          phone,
          role,
          createdAt: new Date().toISOString()
        };

        if (role === 'marketer') {
          userData.ccp = ccp;
          userData.status = 'pending'; // Requires admin approval
        }

        try { await setDoc(doc(db, 'users', user.uid), userData); } catch(e) { console.error('Firestore saving blocked by rules:', e); }
        try {
          await fetch('/api/clients-sheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, role, ccp })
          });
        } catch(e) { console.error('Sheet sync error', e) }
        onClose();
        
        if (role === 'marketer') {
          alert(t.successMarketer);
        } else {
          alert(t.successClient);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError(t.emailInUse);
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') setError(t.wrongCredentials);
      else if (err.code === 'auth/weak-password') setError(t.weakPassword);
      else setError('Error: ' + err.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-start pt-10 pb-10 px-4 overflow-y-auto backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative m-auto my-8 flex flex-col">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-black text-center mb-6 text-primary">
            {isLogin ? t.login : t.register}
          </h2>

          {!isLogin && (
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button 
                type="button"
                onClick={() => setRole('client')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === 'client' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
              >
                {t.imClient}
              </button>
              <button 
                type="button"
                onClick={() => setRole('marketer')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${role === 'marketer' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
              >
                {t.imMarketer}
              </button>
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-gold focus:border-gold"
                    placeholder={t.namePlaceholder}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-gold focus:border-gold text-left"
                  dir="ltr"
                  placeholder={t.emailPlaceholder}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-gold focus:border-gold text-left"
                    dir="ltr"
                    placeholder={t.phonePlaceholder}
                  />
                </div>
              </div>
            )}

            {!isLogin && role === 'marketer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.ccp}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={ccp}
                    onChange={(e) => setCcp(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-gold focus:border-gold text-left"
                    dir="ltr"
                    placeholder="XXXXXX 000000000000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{t.ccpDesc}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-gold focus:border-gold text-left"
                  dir="ltr"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {!isLogin && <p className="text-xs text-gray-500 mt-1">{t.passwordRule}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-primary-dark bg-gold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold mt-6 transition-colors"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLogin ? t.submitLogin : (role === 'marketer' ? t.submitRegisterMarketer : t.submitRegister)}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setRole('client');
              }}
              className="text-gray-600 hover:text-primary font-medium transition-colors"
            >
              {isLogin ? t.noAccount : t.hasAccount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
