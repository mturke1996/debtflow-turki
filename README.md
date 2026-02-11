# DebtFlow - نظام إدارة الإنشاءات والفواتير

نظام احترافي لإدارة الإنشاءات والمصروفات والمدفوعات والفواتير.

## م. محمد سالم التركي
**إنشاءات وتعهدات** | تاجوراء، ليبيا

## المميزات

- 👥 إدارة العملاء
- 💰 تتبع المصروفات والمدفوعات
- 📄 إنشاء الفواتير وتقارير PDF
- 📊 لوحة تحكم مع إحصائيات شاملة
- 🔥 Firebase للبيانات والمصادقة
- 📱 تصميم متجاوب للهاتف المحمول

## التقنيات المستخدمة

- **React 19** + **TypeScript**
- **Material UI (MUI) v7**
- **Firebase** (Auth + Firestore)
- **Vite** للتجميع والبناء
- **Zustand** لإدارة الحالة
- **Day.js** لمعالجة التواريخ

## التثبيت والتشغيل

```bash
# تثبيت الاعتماديات
npm install

# تشغيل بيئة التطوير
npm run dev

# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview
```

## النشر على Vercel

1. ادفع المشروع إلى GitHub
2. اربط المستودع في [Vercel](https://vercel.com)
3. سيتم الكشف التلقائي عن إعدادات Vite
4. اضغط **Deploy**

## متغيرات البيئة (اختيارية)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```
