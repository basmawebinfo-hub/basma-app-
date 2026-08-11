---
title: "Python Fundamentals"
titleAr: "Python Fundamentals"
subtitle: "اتعلم البرمجة اللي هتخليك تبني حلول مش مجرد تستخدم Tools"
order: 2
status: "published"
---

**هدف المستوى:** تكتب Python Scripts بنفسك، تعالج البيانات، تتعامل مع APIs، وتبني Automation بسيطة بالكود. المرجع الرسمي الأساسي طول المستوى: [The Python Tutorial — docs.python.org](https://docs.python.org/3/tutorial/index.html) و[Python.org](https://www.python.org/).

## 1. أساسيات Python (Installation & Setup)
**الشرح:** بايثون لغة برمجة عالية المستوى، سهلة القراءة، وهي اللغة الأساسية في عالم الـ AI والـ Automation لأن معظم مكتبات الذكاء الاصطناعي (OpenAI, LangChain, إلخ) مبنية بيها أو بتوفر SDK ليها.

**مثال عملي:**
```python
print("Hello, AI Automation Engineer!")
```

**مصادر:** [Python 3.14 Docs](https://docs.python.org/3/) | [Real Python](https://realpython.com/)

**تمرين:** ثبّت Python على جهازك، اكتب سكريبت يطبع اسمك وتاريخ اليوم.

---

## 2. Variables (المتغيرات)
**الشرح:** المتغير هو اسم بيشاور على قيمة مخزنة في الذاكرة. بايثون مش محتاج تحدد نوع البيانات صراحة (Dynamically Typed).

```python
name = "Basma"
age = 25
is_active = True
```

**تمرين:** اعمل متغيرات لتخزين بيانات عميل (اسم، سن، بريد إلكتروني) واطبعهم في جملة واحدة.

---

## 3. Data Types (أنواع البيانات)
**الشرح:** الأنواع الأساسية: `int` (أعداد صحيحة)، `float` (أعداد عشرية)، `str` (نصوص)، `bool` (صح/خطأ)، `list`، `dict`، `tuple`، `set`. استخدم `type()` عشان تعرف نوع أي متغير.

```python
price = 99.5      # float
quantity = 3       # int
product = "Laptop" # str
```

**تمرين:** اكتب سكريبت يحدد نوع كل متغير في قائمة بيانات مختلطة باستخدام `type()`.

---

## 4. Strings (النصوص)
**الشرح:** التعامل مع النصوص أساسي جدًا في الأتمتة — قراءة رسائل، تنسيق ردود، استخراج بيانات. أهم العمليات: `.split()`, `.join()`, `.strip()`, `.lower()`, `.replace()`, f-strings.

```python
message = "  Hello World  "
clean = message.strip().lower()
formatted = f"العميل {name} عنده {age} سنة"
```

**مصادر:** [Python String Methods](https://docs.python.org/3/library/stdtypes.html#string-methods)

**تمرين:** اكتب دالة تاخد رسالة واتساب خام وتنضفها من المسافات الزيادة وتحولها لحروف صغيرة.

---

## 5. Lists (القوائم)
**الشرح:** بنية بيانات مرتبة قابلة للتعديل، بتستخدم لتخزين مجموعة عناصر (زي قائمة طلبات، أو رسائل).

```python
orders = ["order1", "order2", "order3"]
orders.append("order4")
first_order = orders[0]
```

**تمرين:** اعمل قائمة بأسماء 5 عملاء، ضيف عميل جديد، احذف أول واحد، واطبع القائمة النهائية.

---

## 6. Dictionaries (القواميس)
**الشرح:** بنية Key-Value — أهم بنية بيانات هتستخدمها لما تتعامل مع JSON من الـ APIs، لأن استجابات الـ APIs غالبًا بتيجي كـ Dictionary في بايثون.

```python
customer = {
    "name": "Ahmed",
    "email": "ahmed@example.com",
    "orders": 3
}
print(customer["name"])
```

**تمرين:** اعمل Dictionary يمثل بيانات فاتورة (رقم، عميل، مبلغ، حالة الدفع) واطبع المبلغ فقط.

---

## 7. Conditions (الشروط)
**الشرح:** `if / elif / else` — أساس أي منطق قرار في الأتمتة.

```python
status_code = 404
if status_code == 200:
    print("Success")
elif status_code == 404:
    print("Not Found")
else:
    print("Unknown Error")
```

**تمرين:** اكتب شرط يحدد هل الرسالة "عاجلة" لو فيها كلمة "urgent" أو "مستعجل"، وإلا "عادية".

---

## 8. Loops (الحلقات التكرارية)
**الشرح:** `for` و `while` — لتكرار عملية على مجموعة عناصر، زي معالجة كل رسالة في قائمة رسائل.

```python
for order in orders:
    print(f"Processing {order}")

i = 0
while i < 5:
    i += 1
```

**تمرين:** اكتب لوب يمر على قائمة طلبات ويطبع بس اللي حالتها "pending".

---

## 9. Functions (الدوال)
**الشرح:** كتلة كود قابلة لإعادة الاستخدام — أساس تنظيم أي مشروع Automation حقيقي.

```python
def calculate_total(price, quantity, tax_rate=0.14):
    return price * quantity * (1 + tax_rate)

total = calculate_total(100, 2)
```

**تمرين:** اكتب دالة `classify_message(text)` تُرجع "urgent" أو "normal" حسب محتوى النص.

---

## 10. Error Handling (التعامل مع الأخطاء)
**الشرح:** `try / except / finally` — ضروري جدًا في الأتمتة لأن الـ API ممكن يفشل، الملف ممكن يكون مفقود، إلخ. النظام لازم "يستحمل" الأخطاء بدل ما يقف تمامًا.

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error occurred: {e}")
finally:
    print("Done processing")
```

**مصادر:** [Errors and Exceptions — Python Docs](https://docs.python.org/3/tutorial/errors.html)

**تمرين:** اكتب كود بيحاول يقرأ ملف مش موجود، وامسك الخطأ واطبع رسالة واضحة بدل ما البرنامج يكراش.

---

## 11. Files (التعامل مع الملفات)
```python
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()

with open("output.txt", "w", encoding="utf-8") as f:
    f.write("Processed data")
```
**تمرين:** اكتب سكريبت يقرأ ملف نصي فيه قائمة إيميلات (سطر لكل إيميل) ويطبع عددهم.

---

## 12. JSON
**الشرح:** JSON هو الصيغة الأساسية لتبادل البيانات بين الأنظمة والـ APIs.
```python
import json
data = json.loads('{"name": "Ahmed", "age": 30}')
json_string = json.dumps(data, ensure_ascii=False)
```
**مصادر:** [json — Python Docs](https://docs.python.org/3/library/json.html)

**تمرين:** حول Dictionary فيه بيانات منتج إلى JSON string واطبعه، وبعدين رجّعه Dictionary تاني.

---

## 13. CSV
```python
import csv
with open("customers.csv", newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["email"])
```
**تمرين:** اعمل ملف CSV فيه 5 صفوف بيانات عملاء واكتب سكريبت يقرأه ويطبع بس أسماء العملاء اللي مبلغهم أكبر من 500.

---

## 14. Modules & Packages
**الشرح:** الـ Module ملف بايثون واحد فيه كود قابل للاستيراد. الـ Package مجموعة Modules منظمة في فولدر فيه `__init__.py`. ده أساس تنظيم أي مشروع كبير.

```python
# my_module.py
def greet(name):
    return f"Hello {name}"

# main.py
from my_module import greet
```

---

## 15. Virtual Environments
**الشرح:** بيئة معزولة لكل مشروع عشان الـ Dependencies بتاعت مشروع معين متتعارضش مع مشروع تاني.
```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install requests
```
**مصادر:** [venv — Python Docs](https://docs.python.org/3/library/venv.html)

**تمرين:** اعمل Virtual Environment جديد، فعّله، وثبّت مكتبة `requests` جواه.

---

## 16. Environment Variables
**الشرح:** لتخزين البيانات الحساسة (API Keys, Passwords) بعيد عن الكود مباشرة — أساسي للأمان.
```python
import os
from dotenv import load_dotenv
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
```
ملف `.env`:
```
OPENAI_API_KEY=sk-xxxxxxxx
```
**تحذير أمني:** لازم تضيف `.env` في ملف `.gitignore` عشان متسربش المفاتيح على GitHub.

**تمرين:** اعمل ملف `.env` فيه مفتاح وهمي، واكتب سكريبت يقرأه باستخدام `python-dotenv`.

---

## 17. OOP Basics (البرمجة الكائنية)
**الشرح:** تنظيم الكود في Classes و Objects — مفيد لما تبني أنظمة معقدة (زي AI Agent بحالة داخلية).
```python
class Customer:
    def __init__(self, name, email):
        self.name = name
        self.email = email

    def greet(self):
        return f"Hello {self.name}"

c = Customer("Ahmed", "ahmed@example.com")
print(c.greet())
```
**تمرين:** اعمل Class اسمه `Order` فيه `product`, `quantity`, `price` ودالة `total_price()` بترجع السعر الكلي.

---

## 18. Debugging
**الشرح:** قراءة الـ Traceback بعناية (بيقولك في أنهي سطر بالظبط حصل الخطأ ونوعه). أدوات: `print()` المؤقت، `pdb` (Python Debugger)، أو breakpoints في VS Code.
```python
import pdb
pdb.set_trace()  # يوقف التنفيذ هنا للفحص
```
**تمرين:** خد كود فيه خطأ منطقي بسيط (زي قسمة خاطئة) وصلحه باستخدام `print()` statements للتتبع.

---

## 19. التعامل مع Libraries
**الشرح:** استخدام مكتبات جاهزة بدل إعادة اختراع العجلة. أهم مكتبات لمهندس الأتمتة: `requests` (APIs)، `pandas` (بيانات)، `python-dotenv` (متغيرات بيئة)، `pydantic` (تحقق من البيانات).
```bash
pip install requests pandas python-dotenv
```

---

## 20. إرسال واستقبال البيانات + التعامل مع APIs باستخدام Python
**الشرح:** استخدام مكتبة `requests` للتواصل مع أي API خارجي — أساس ربط أي نظامين ببعض.
```python
import requests

response = requests.get("https://api.example.com/customers")
if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f"Error: {response.status_code}")

# POST request
payload = {"name": "Ahmed", "email": "ahmed@example.com"}
response = requests.post("https://api.example.com/customers", json=payload)
```
**مصادر:** [Requests Library Docs](https://requests.readthedocs.io/)

**تمرين:** اكتب سكريبت يستدعي API عام مجاني (زي `https://jsonplaceholder.typicode.com/users`) ويطبع أسماء أول 3 مستخدمين.

---

## 21. أساسيات Async Programming
**الشرح:** البرمجة غير المتزامنة (Async) بتخليك تنفذ عدة عمليات (زي استدعاء عدة APIs) في نفس الوقت تقريبًا بدل ما تنتظر كل واحدة لوحدها — بيحسّن الأداء بشكل كبير في أنظمة الأتمتة.
```python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.json()

async def main():
    async with aiohttp.ClientSession() as session:
        result = await fetch(session, "https://api.example.com/data")
        print(result)

asyncio.run(main())
```
**مصادر:** [asyncio — Python Docs](https://docs.python.org/3/library/asyncio.html)

**تمرين تجميعي نهائي للمستوى:**
اكتب سكريبت Python كامل يعمل التالي: يقرأ قائمة عملاء من ملف CSV → لكل عميل يستدعي API وهمي (أو حقيقي) عشان يجيب حالة الطلب → يصنف الحالة (Success/Error) باستخدام try/except → يحفظ النتائج في ملف JSON جديد. استخدم فيه: Functions, Dictionaries, Error Handling, Files, JSON, CSV, وAPIs.
