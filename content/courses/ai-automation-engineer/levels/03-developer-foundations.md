---
title: "Developer Foundations"
titleAr: "Developer Foundations"
subtitle: "اتعلم الأدوات الأساسية لأي Developer"
order: 3
status: "published"
---

**هدف المستوى:** تبدأ مشروع منظم، تستخدم Git وGitHub، وتفهم الأخطاء وتتعامل مع بيئة التطوير بشكل احترافي.

## 1. Terminal & Command Line
**الشرح:** الـ Terminal هو الطريقة الأساسية للتفاعل مع نظام التشغيل بأوامر نصية بدل الواجهة الرسومية — كل أدوات التطوير (Git, Python, Docker) بتتحكم فيها عن طريق Terminal.

**أوامر أساسية:**
```bash
pwd            # عرض المسار الحالي
ls / dir       # عرض محتويات الفولدر
cd folder_name # الدخول لفولدر
mkdir new_folder
touch file.py  # إنشاء ملف (Linux/Mac)
rm file.py     # حذف ملف
cat file.py    # عرض محتوى الملف
```
**مصادر:** [freeCodeCamp: Command Line Basics](https://www.freecodecamp.org/news/command-line-for-beginners/)

**تمرين:** افتح Terminal، اعمل فولدر جديد اسمه `my_project`، ادخل جواه، اعمل ملف `main.py` وافتحه في VS Code من الـ Terminal مباشرة (`code .`).

---

## 2. Linux Basics
**الشرح:** غالبية السيرفرات اللي هتنشر (Deploy) عليها مشاريعك بتشتغل بـ Linux. فهم أوامره الأساسية ضروري: `sudo`, `apt`, `chmod`, `ps`, `top`, `grep`, `find`.
```bash
sudo apt update && sudo apt upgrade
chmod +x script.sh   # إعطاء صلاحية تنفيذ
grep "error" logs.txt
```

---

## 3. VS Code
**الشرح:** أشهر محرر أكواد مجاني ومرن، بيدعم Extensions بتسهّل التطوير (Python, GitLens, Prettier, Docker).
**إضافات مهمة لمهندس الأتمتة:** Python, Pylance, GitLens, REST Client, Docker.

**تمرين:** ثبّت VS Code، فعّل إضافة Python وGitLens، وجرب الـ Integrated Terminal جواه.

---

## 4. تنظيم المشاريع (Project Structure)
**الشرح:** هيكل منظم يخلي المشروع قابل للصيانة والتوسع.
```
my_project/
├── src/
│   ├── main.py
│   └── utils.py
├── tests/
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```
**تمرين:** نظّم مشروع بايثون بسيط بالهيكل ده، وضيف README.md فيه وصف قصير للمشروع.

---

## 5. Git — الأساسيات
**الشرح:** نظام تحكم بالإصدارات (Version Control) بيسجل كل تغيير في الكود، ويخليك ترجع لأي نسخة سابقة، وتشتغل مع فريق من غير ما تدوس على شغل بعض.
```bash
git init
git status
git add file.py
git add .
git commit -m "Add customer processing script"
git log
```
**مصادر:** [Git Guides](https://github.com/git-guides) | [Pro Git Book](https://git-scm.com/book/en/v2)

**تمرين:** اعمل مجلد جديد، فعّل Git جواه (`git init`)، اعمل أول Commit ليه.

---

## 6. GitHub
**الشرح:** منصة سحابية لاستضافة مستودعات Git، وبتسمح بالتعاون بين المطورين ومشاركة الكود ونشره.
```bash
git remote add origin https://github.com/username/repo.git
git push -u origin main
git pull origin main
```
**مصادر:** [GitHub Docs: Get Started](https://docs.github.com/en/get-started)

**تمرين:** اعمل حساب GitHub (لو مش عندك)، اعمل Repository جديد، وارفع مشروع الـ Level ده عليه.

---

## 7. Commits
**الشرح:** كل Commit هو "لقطة" (Snapshot) لحالة الكود في وقت معين، مع رسالة توضح إيه اللي اتغير. أفضل ممارسة: اكتب رسائل واضحة ومختصرة (Conventional Commits).
```
feat: add WhatsApp webhook handler
fix: handle empty response from API
docs: update README with setup steps
```

---

## 8. Branches
**الشرح:** فرع منفصل من الكود تقدر تشتغل عليه من غير ما تأثر على النسخة الرئيسية (`main`)، مفيد لما تطور ميزة جديدة أو تجرب حاجة.
```bash
git branch feature/whatsapp-integration
git checkout feature/whatsapp-integration
# أو في أمر واحد:
git checkout -b feature/whatsapp-integration
```

---

## 9. Pull Requests
**الشرح:** طلب رسمي لدمج التغييرات من فرع (Branch) لفرع تاني (غالبًا main)، بيسمح بمراجعة الكود قبل الدمج (Code Review) — أساسي في العمل الجماعي.

**تمرين:** اعمل Branch جديد، عدّل فيه حاجة بسيطة، ادفعه لـ GitHub (`git push origin branch_name`)، وافتح Pull Request من الواجهة.

---

## 10. Environment Variables & `.env`
**الشرح:** (تفصيل تكميلي لما اتعلمته في Level 02) — أهم قاعدة: ملف `.env` **لازم يتحط في `.gitignore`** عشان متترفعش المفاتيح السرية على GitHub بالخطأ.
```
# .gitignore
.env
__pycache__/
venv/
*.pyc
```

---

## 11. إدارة Dependencies
**الشرح:** تسجيل كل المكتبات اللي المشروع محتاجها في ملف واحد عشان أي حد يقدر يجهز نفس البيئة.
```bash
pip freeze > requirements.txt
pip install -r requirements.txt
```

---

## 12. Debugging & قراءة Error Messages
**الشرح:** كل خطأ في بايثون بيديك Traceback بيوضح: نوع الخطأ (Exception Type)، رسالة توضيحية، والسطر اللي حصل فيه بالظبط. اقرأ من "تحت لفوق" — آخر سطر هو الأهم.
```
Traceback (most recent call last):
  File "main.py", line 12, in <module>
    result = 10 / 0
ZeroDivisionError: division by zero
```
**تمرين:** خد Error Message حقيقي من مشروعك وحلله: إيه نوع الخطأ؟ في أنهي سطر؟ إيه سببه المحتمل؟

---

## 13. Logging
**الشرح:** بدل استخدام `print()` في مشروع حقيقي، استخدم مكتبة `logging` عشان تسجل الأحداث بمستويات مختلفة (INFO, WARNING, ERROR) وتقدر تتبع المشكلة في الإنتاج (Production).
```python
import logging
logging.basicConfig(level=logging.INFO, filename="app.log")
logging.info("Process started")
logging.error("API call failed")
```
**مصادر:** [logging — Python Docs](https://docs.python.org/3/library/logging.html)

---

## 14. Documentation
**الشرح:** توثيق الكود والمشروع بيسهّل الصيانة والتعاون. أساسيات: `README.md` واضح، Docstrings في الدوال.
```python
def calculate_total(price: float, quantity: int) -> float:
    """
    يحسب السعر الإجمالي لطلب معين.
    Args:
        price: سعر الوحدة
        quantity: الكمية
    Returns:
        السعر الإجمالي شامل الضريبة
    """
    return price * quantity * 1.14
```

---

## 15. أساسيات Clean Code
**الشرح:** مبادئ أساسية لكتابة كود مقروء وقابل للصيانة:
- أسماء متغيرات ودوال واضحة ومعبّرة (`get_customer_by_id` بدل `func1`).
- كل دالة تعمل حاجة واحدة بس (Single Responsibility).
- تجنب تكرار الكود (DRY — Don't Repeat Yourself).
- علّق (Comment) على "ليه" مش على "إيه" (الكود نفسه بيوضح إيه).
- خلي الدوال قصيرة (لو الدالة أطول من شاشة واحدة، فكر تقسمها).

**تمرين تجميعي نهائي للمستوى:**
اعمل Repository جديد على GitHub لمشروع بايثون بسيط (زي سكريبت معالجة بيانات عملاء من Level 02). نظّمه بهيكل مشروع صحيح، ضيف `.gitignore` و`requirements.txt` و`README.md`، اعمل على الأقل 3 Commits بمعنى واضح، اعمل Branch جديد لإضافة ميزة، وافتح Pull Request لدمجها في main.
