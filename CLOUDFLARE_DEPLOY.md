# دليل النشر الصحيح على Cloudflare Pages (لتجنب خطأ 404)

## لماذا ظهر خطأ 404 عند الرفع سابقاً؟
في Cloudflare Pages، رفع مجلد الكود المصدري مباشرة (Direct Upload) أو اختيار مجلد البناء `.next` يؤدي إلى خطأ **404** لأن Cloudflare لا يشغّل Next.js SSR/Middleware إلا إذا تم البناء بأمر `@cloudflare/next-on-pages` الذي ينتج مجلد `.vercel/output/static` مع `_worker.js`.

---

## الطريقة الصحيحة للنشر (خطوة بخطوة)

### 1. فك الضغط ورفع المشروع إلى GitHub
فك ضغط ملف `moulay-travel-fixed-cloudflare.zip` — ستجد الملفات مباشرة في الجذر (`package.json`, `next.config.mjs`, `wrangler.toml`, `src/`). ارفعها إلى مستودع GitHub.

### 2. إعداد Cloudflare Pages
1. ادخل إلى **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. اختر مستودع المشروع واضبط الإعدادات التالية بدقة:
   * **Framework preset:** `Next.js` (أو `None`)
   * **Build command:** `npm run pages:build`
   * **Build output directory:** `.vercel/output/static`
   * **Root directory:** `/` (اتركه فارغاً)
3. بعد الإنشاء، اذهب إلى **Settings → Functions → Compatibility flags** وأضف:
   * `nodejs_compat`
4. في **Settings → Builds & deployments → Build environment variables** أضف:
   * `NODE_VERSION` = `20`

### 3. متغيرات البيئة (Environment Variables)
في **Settings → Environment variables** أضف:

**مطلوب فوراً للحماية (لا يُوضع في الكود أبداً):**
* `ADMIN_PASSWORD` = كلمة مرور لوحة التحكم القوية الخاصة بك
* `ADMIN_SESSION_SECRET` = سلسلة عشوائية طويلة (مثلاً 64 حرفاً) لتوقيع جلسات الدخول

**متغيرات الموقع و Google Sheets و Firebase (يمكنك إضافتها الآن أو تباعاً):**
* `NEXT_PUBLIC_SITE_URL` = رابط موقعك (مثلاً `https://moulaytravel.com`)
* `GOOGLE_SERVICE_ACCOUNT_EMAIL`
* `GOOGLE_PRIVATE_KEY`
* `GOOGLE_SHEET_OMRA_ID`
* `GOOGLE_SHEET_AUTRES_ID`
* `NEXT_PUBLIC_FIREBASE_API_KEY`
* `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
* `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
* `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
* `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
* `NEXT_PUBLIC_FIREBASE_APP_ID`

### 4. النشر المباشر من حاسوبك عبر Wrangler (بديل سريع)
إذا أردت البناء والرفع مباشرة من جهازك بعد فك الضغط:
```bash
npm install
npm run pages:deploy
```
سيقوم `wrangler` ببناء مجلد `.vercel/output/static` ورفعه مباشرة إلى Cloudflare Pages.
