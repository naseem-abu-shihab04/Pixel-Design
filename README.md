# قائمة المهام

موقع بسيط فيه خادم (Node.js) وواجهة (HTML/CSS/JS)، بدون أي مكتبات خارجية.

## التشغيل

```bash
npm start
```

بعدها افتح http://localhost:3000

## الـ API

| الطريقة | المسار | الوظيفة |
|---|---|---|
| GET | `/api/tasks` | جلب كل المهام |
| POST | `/api/tasks` | إضافة مهمة `{ "title": "..." }` |
| PATCH | `/api/tasks/:id` | تعديل الحالة `{ "done": true }` |
| DELETE | `/api/tasks/:id` | حذف مهمة |

المهام تُحفظ في ملف `data.json`.
