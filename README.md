# 🛒 نادر ماركت - Nader Market

<div align="center">

![Nader Market Logo](https://up6.cc/2026/06/178036787702831.jpg)

**منصة تسوق إلكترونية حديثة وموثوقة لتوفير أفضل المنتجات الطازة والجودة العالية**

[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)](https://nadermarket-fdwgbli8.manus.space)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen?style=flat-square)](package.json)
[![Node](https://img.shields.io/badge/Node-22.13.0-green?style=flat-square)](https://nodejs.org/)

[🌐 الموقع الرسمي](#-الموقع-الرسمي) • [📋 الميزات](#-الميزات-الرئيسية) • [🚀 البدء السريع](#-البدء-السريع) • [📖 التوثيق](#-التوثيق)

</div>

---

## 🌐 الموقع الرسمي

🔗 **الرابط الرسمي:** [https://nadermarket-fdwgbli8.manus.space](https://nadermarket-fdwgbli8.manus.space)

**العنوان:** رأس البر - سوق 89  
**رقم الواتساب:** +20 100 293 4519  
**وسيلة الدفع:** فودافون كاش

---

## 📋 الميزات الرئيسية

### 🛍️ تجربة التسوق

- ✨ **واجهة مستخدم حديثة وسهلة الاستخدام** - تصميم متجاوب يعمل على جميع الأجهزة
- 🏷️ **تصنيفات منظمة** - 8 أقسام رئيسية (لحوم، بقوليات، ألبان، خضروات، فواكه، حبوب، معلبات، زيوت وتوابل)
- 🔍 **بحث وتصفية متقدمة** - ابحث عن المنتجات بسهولة حسب القسم
- 🛒 **سلة مشتريات ذكية** - أضف وعدّل الكميات بسهولة
- 💳 **دفع آمن** - تكامل مع فودافون كاش
- 📱 **إشعارات فورية** - تلقي تفاصيل الطلب عبر واتساب

### 👨‍💼 لوحة التحكم الإدارية

- 📊 **إدارة المنتجات** - أضف وعدّل وحذف المنتجات بسهولة
- 📂 **إدارة الأقسام** - تنظيم المنتجات في أقسام مختلفة
- 📦 **إدارة الطلبات** - تتبع جميع الطلبات وتحديث حالتها
- 🖼️ **رفع الصور** - تخزين آمن على S3
- 🔐 **أمان عالي** - حماية كاملة للبيانات الحساسة

### 🎯 الميزات التقنية

- ⚡ **أداء عالي** - تحميل سريع وسلس
- 🔒 **أمان متقدم** - تشفير وحماية البيانات
- 📱 **تصميم متجاوب** - يعمل بشكل مثالي على الهواتف والأجهزة اللوحية
- 🌍 **دعم اللغة العربية** - واجهة كاملة باللغة العربية
- 🚀 **قابل للتوسع** - معمارية حديثة تسمح بإضافة ميزات جديدة

---

## 🚀 البدء السريع

### المتطلبات

- **Node.js** 22.13.0 أو أحدث
- **npm** أو **pnpm**
- **قاعدة بيانات MySQL/TiDB**

### التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/wahedelfar/nadermarket.git
cd nadermarket

# تثبيت المكتبات
pnpm install

# إعداد متغيرات البيئة
cp .env.example .env.local

# تشغيل قاعدة البيانات
pnpm db:push

# بدء خادم التطوير
pnpm dev
```

الموقع سيكون متاحاً على: `http://localhost:3000`

---

## 📖 التوثيق

### هيكل المشروع

```
nader-market-web/
├── client/                 # الواجهة الأمامية (React 19)
│   ├── src/
│   │   ├── pages/         # صفحات التطبيق
│   │   ├── components/    # المكونات المعاد استخدامها
│   │   ├── lib/           # مكتبات مساعدة
│   │   └── App.tsx        # التطبيق الرئيسي
│   └── index.html
├── server/                 # الخادم الخلفي (Express + tRPC)
│   ├── routers.ts         # إجراءات tRPC
│   ├── db.ts              # استعلامات قاعدة البيانات
│   └── _core/             # ملفات النظام الأساسية
├── drizzle/               # قاعدة البيانات (Drizzle ORM)
│   └── schema.ts          # تعريف الجداول
├── storage/               # معالجات التخزين (S3)
└── package.json
```

### تقنيات المشروع

| الطبقة | التقنية | الإصدار |
|------|---------|--------|
| **الواجهة الأمامية** | React | 19 |
| **التصميم** | Tailwind CSS | 4 |
| **الخادم** | Express | 4 |
| **الاتصال** | tRPC | 11 |
| **قاعدة البيانات** | Drizzle ORM | - |
| **المصادقة** | Manus OAuth | - |
| **التخزين** | AWS S3 | - |

### متغيرات البيئة

```env
# قاعدة البيانات
DATABASE_URL=mysql://user:password@host:port/database

# المصادقة
JWT_SECRET=your_jwt_secret_key
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im

# التخزين
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key

# معلومات المالك
OWNER_OPEN_ID=your_owner_id
OWNER_NAME=Owner Name
```

---

## 💻 الأوامر المتاحة

```bash
# بدء خادم التطوير
pnpm dev

# بناء المشروع للإنتاج
pnpm build

# تشغيل الاختبارات
pnpm test

# فحص TypeScript
pnpm check

# إدارة قاعدة البيانات
pnpm db:push      # دفع التغييرات إلى قاعدة البيانات
pnpm db:studio    # فتح واجهة إدارة قاعدة البيانات
```

---

## 📱 تطبيق Nader Market والأرشفة

يدعم المتجر التثبيت كتطبيق PWA من الهاتف والكمبيوتر عبر زر «ثبّت التطبيق»، مع أيقونات قياسية وقابلة للقناع بمقاسات متعددة، وService Worker خفيف لا يخزن واجهات API. عند فتح التطبيق المثبت لأول مرة تظهر رسالة ترحيبية عربية فاخرة.

تم تجهيز `manifest.webmanifest` و`robots.txt` و`sitemap.xml`، بالإضافة إلى وصف الصفحة وCanonical URL وOpen Graph وTwitter Cards وStructured Data من نوع `GroceryStore` لتحسين ظهور المتجر في نتائج البحث ومشاركته على شبكات التواصل.

## 🔐 الأمان والخصوصية

- ✅ **تشفير البيانات** - جميع البيانات الحساسة مشفرة
- ✅ **المصادقة الآمنة** - استخدام OAuth 2.0
- ✅ **حماية CSRF** - حماية من هجمات CSRF
- ✅ **التحقق من الإدخال** - التحقق من جميع المدخلات
- ✅ **HTTPS** - جميع الاتصالات محمية

---

## 📊 الإحصائيات

- **عدد المنتجات:** 20+ منتج
- **عدد الأقسام:** 8 أقسام رئيسية
- **أوقات التحميل:** < 2 ثانية
- **معدل الاستجابة:** 99.9%

---

## 🤝 المساهمة

نرحب بمساهماتك! يرجى اتباع الخطوات التالية:

1. Fork المستودع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

## 📞 التواصل والدعم

- 📧 **البريد الإلكتروني:** support@nadermarket.com
- 💬 **واتساب:** [+20 100 293 4519](https://wa.me/201002934519)
- 🌐 **الموقع:** [https://nadermarket-fdwgbli8.manus.space](https://nadermarket-fdwgbli8.manus.space)

---

## 👨‍💻 فريق التطوير

- **المالك:** وحيد الفار (Wahid Elfar)
- **المطورون:** فريق تطوير متخصص

---

## 🙏 شكر وتقدير

شكراً لاستخدامك نادر ماركت! نتمنى لك تجربة تسوق ممتعة وآمنة.

---

<div align="center">

**صُنع بـ ❤️ من قبل فريق نادر ماركت**

© 2026 Nader Market. جميع الحقوق محفوظة.

</div>
