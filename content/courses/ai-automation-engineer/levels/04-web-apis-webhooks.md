---
title: "Web, APIs & Webhooks"
titleAr: "Web, APIs & Webhooks"
subtitle: "اتعلم إزاي الأنظمة تتكلم مع بعضها"
order: 4
status: "published"
---

**هدف المستوى:** تقدر تربط أي نظام تقريبًا بأي نظام تاني، وتفهم إزاي البيانات بتتحرك بين الـ APIs والـ Webhooks. معظم الـ Automation الحقيقية مبنية على المفاهيم دي.

## 1. الإنترنت بيشتغل إزاي؟ (Client & Server)
**الشرح:** أي تفاعل على الإنترنت بيحصل بين طرفين: **Client** (المتصفح، تطبيق، أو سكريبت بيطلب بيانات) و**Server** (النظام اللي بيستقبل الطلب ويرد عليه). دورة الحياة: Client يبعت Request → Server يعالجه → Server يرجع Response.

**مصادر:** [How the Web Works — MDN](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works)

---

## 2. HTTP & HTTPS
**الشرح:** HTTP (HyperText Transfer Protocol) هو البروتوكول اللي بيحدد شكل تبادل الرسائل بين Client و Server. HTTPS هو نفس البروتوكول لكن مشفّر (Secure) — أي API حقيقي في الإنتاج لازم يكون HTTPS.

---

## 3. Requests & Responses
**الشرح:** كل تفاعل HTTP بيتكون من:
- **Request:** بيحتوي على Method, URL, Headers, Body (اختياري).
- **Response:** بيحتوي على Status Code, Headers, Body.

```
Request:
GET https://api.example.com/customers/5
Headers: { "Authorization": "Bearer xxx" }

Response:
Status: 200 OK
Body: { "id": 5, "name": "Ahmed" }
```

---

## 4. Status Codes
**الشرح:** أرقام بتوضح نتيجة الطلب:
| الفئة | المعنى | مثال |
|---|---|---|
| 2xx | نجاح | 200 OK, 201 Created |
| 3xx | إعادة توجيه | 301 Moved Permanently |
| 4xx | خطأ من طرف العميل | 400 Bad Request, 401 Unauthorized, 404 Not Found |
| 5xx | خطأ من طرف السيرفر | 500 Internal Server Error, 503 Service Unavailable |

**تمرين:** ابحث عن 3 أكواد أخرى غير المذكورة واشرح كل واحد بجملة.

---

## 5. Headers
**الشرح:** بيانات وصفية بتترسل مع الـ Request أو الـ Response — بتحدد نوع المحتوى، معلومات المصادقة، إلخ.
```
Content-Type: application/json
Authorization: Bearer sk-xxxxxxxx
User-Agent: MyAutomationBot/1.0
```

---

## 6. Query Parameters
**الشرح:** بيانات إضافية بتتبعت في الـ URL نفسه بعد `?`، بتستخدم غالبًا للفلترة أو البحث.
```
https://api.example.com/orders?status=pending&limit=10
```

---

## 7. Request Body & JSON
**الشرح:** البيانات اللي بتترسل مع الطلب (غالبًا في POST/PUT)، وبتتكتب بصيغة JSON.
```json
{
  "customer_name": "Ahmed",
  "product_id": 102,
  "quantity": 2
}
```

---

## 8. REST APIs & HTTP Methods
**الشرح:** REST هو أسلوب معماري (Architecture Style) لتصميم الـ APIs بيعتمد على الموارد (Resources) والأفعال عليها:
| Method | الاستخدام | مثال |
|---|---|---|
| GET | جلب بيانات | جلب قائمة العملاء |
| POST | إنشاء مورد جديد | إضافة عميل جديد |
| PUT | تحديث كامل لمورد | تحديث كل بيانات عميل |
| PATCH | تحديث جزئي | تحديث بريد العميل فقط |
| DELETE | حذف مورد | حذف عميل |

**مصادر:** [REST API Tutorial](https://restfulapi.net/)

**تمرين:** حدد أي Method هتستخدم لكل عملية: (أ) جلب تفاصيل طلب معين، (ب) إلغاء طلب، (ج) تحديث حالة الدفع فقط.

---

## 9. API Authentication (API Keys, Bearer Tokens, OAuth Basics)
**الشرح:** طرق التحقق من هوية الطرف اللي بيطلب البيانات:
- **API Key:** مفتاح ثابت بيترسل مع كل طلب (في Header أو Query Param).
- **Bearer Token:** توكن (غالبًا JWT) بيترسل في الـ Authorization Header، وممكن يكون له مدة صلاحية.
- **OAuth 2.0:** بروتوكول أكثر تعقيدًا وأمانًا، بيسمح لتطبيق يوصل لبيانات مستخدم في نظام تاني بموافقته (زي "تسجيل الدخول بجوجل").

```python
headers = {"Authorization": "Bearer sk-xxxxxxxxxxxxx"}
response = requests.get(url, headers=headers)
```

**مصادر:** [OAuth 2.0 Simplified](https://www.oauth.com/)

---

## 10. Webhooks
**الشرح:** بدل ما نظامك "يسأل" API كل شوية "في جديد؟" (Polling)، الـ Webhook بيخلي النظام التاني "يبلّغك" تلقائيًا لما حدث معين يحصل، عن طريق إرسال POST Request لـ URL محدد عندك (Callback URL).

**مثال:** لما عميل يدفع فاتورة عن طريق Stripe، Stripe بيبعت Webhook لسيرفرك فورًا بالحدث `payment.succeeded`، وأنت بتستقبله وتعالجه.

```python
from fastapi import FastAPI, Request
app = FastAPI()

@app.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.json()
    event_type = payload.get("type")
    if event_type == "payment.succeeded":
        # نفّذ اللي محتاجه
        pass
    return {"status": "received"}
```

**الفرق الجوهري:** API = أنت اللي بتطلب البيانات (Pull). Webhook = النظام التاني بيبعتلك البيانات تلقائيًا لحظة حدوثها (Push).

**مصادر:** [GitHub Webhooks Docs](https://docs.github.com/en/webhooks) | [Webhooks REST API — QuickNode](https://www.quicknode.com/docs/webhooks/rest-api/getting-started)

---

## 11. Webhook Security
**الشرح:** لازم تتأكد إن الـ Webhook جاي من مصدر موثوق ومش من طرف خبيث، وده بيتم عن طريق:
- **Signature Verification (HMAC):** النظام المرسل بيوقّع الـ Payload بمفتاح سري، وأنت بتتحقق من التوقيع قبل ما تعالج البيانات.
- **استخدام HTTPS فقط.**
- **التحقق من الـ IP Source** (لو المصدر بيوفر قائمة IPs ثابتة).

```python
import hmac, hashlib

def verify_signature(payload, signature, secret):
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

---

## 12. Postman
**الشرح:** أداة لاختبار الـ APIs من غير ما تكتب كود — بتقدر تبني Request، تضيف Headers وBody، وتشوف الـ Response فورًا. أساسية جدًا وقت تطوير أو تصحيح أي تكامل بين نظامين.

**مصادر:** [Postman Learning Center](https://learning.postman.com/)

**تمرين:** حمّل Postman وجرب تستدعي API مجاني (زي `https://jsonplaceholder.typicode.com/posts`) بـ GET request وشوف الـ Response.

---

## 13. API Documentation
**الشرح:** أي API احترافي بيوفر توثيق يوضح: الـ Endpoints المتاحة، الـ Parameters المطلوبة، أمثلة Request/Response، وطرق المصادقة. تعلم قراءة التوثيق مهارة أساسية — منها OpenAPI/Swagger specs.

---

## 14. Rate Limits
**الشرح:** حد أقصى لعدد الطلبات المسموح بيها في فترة زمنية معينة (زي 100 طلب/دقيقة)، عشان تحمي السيرفر من الحمل الزائد. لو تجاوزت الحد، هتاخد Status Code `429 Too Many Requests`. الحل: استخدام Retry مع Exponential Backoff.

```python
import time

def call_with_retry(func, max_retries=3):
    for attempt in range(max_retries):
        response = func()
        if response.status_code == 429:
            time.sleep(2 ** attempt)  # Exponential backoff
        else:
            return response
```

---

## 15. Pagination
**الشرح:** لما الـ API عنده بيانات كتير، مش بيرجعها كلها مرة واحدة، بيقسمها لصفحات (Pages). أنواع شائعة: Offset-based (`?page=2&limit=20`) و Cursor-based (`?cursor=abc123`).

```python
page = 1
all_data = []
while True:
    response = requests.get(f"https://api.example.com/items?page={page}")
    data = response.json()
    if not data["items"]:
        break
    all_data.extend(data["items"])
    page += 1
```

---

## 16. API Error Handling
**الشرح:** أي تكامل حقيقي لازم يتعامل مع كل الاحتمالات: انقطاع الاتصال، Timeout، رد غير متوقع، Rate Limit، Authentication Error.

```python
try:
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    data = response.json()
except requests.exceptions.Timeout:
    print("Request timed out")
except requests.exceptions.HTTPError as e:
    print(f"HTTP Error: {e}")
except requests.exceptions.ConnectionError:
    print("Connection failed")
```

**تمرين تجميعي نهائي للمستوى:**
اكتب سكريبت Python يعمل التالي: (1) يستدعي API عام (GET) ويجيب قائمة بيانات مع Pagination، (2) يتعامل مع الأخطاء المحتملة بـ try/except، (3) يبني Webhook Endpoint بسيط باستخدام FastAPI يستقبل بيانات POST ويطبعها، (4) يتحقق من توقيع HMAC وهمي قبل معالجة البيانات. اختبر الـ Endpoint باستخدام Postman.
