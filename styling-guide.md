# دليل النظام البصري والتصميم (Athar Styling & Design System Guide)

يرشدك هذا الدليل لكيفية تطبيق نظام التصميم والهوية البصرية الخاص بمشروع **أثر (Athar)** في أي مشروع جديد باستخدام **React** و **Tailwind CSS**.

---

## 📌 الخطوة 1: تثبيت الخطوط المطلوبة (Fonts Setup)
يستخدم النظام مجموعة من الخطوط المتناسقة للغات العربية والإنجليزية، يتم استيرادها في ملف الـ CSS الرئيسي:

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Hepta+Slab:wght@100;200;300;400;500;600;700;800;900&family=Jomhuria&family=Tajawal:wght@400;700&display=swap');
```

---

## ⚙️ الخطوة 2: إعداد إعدادات تيلويند (`tailwind.config.js`)
قم بتحديث ملف `tailwind.config.js` لتعريف الألوان والخطوط والحواف المخصصة للهوية:

```javascript
/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        athar: {
          black: "#0d0e0e",
          blue: "hsl(234, 77%, 44%)", // الأزرق الملكي الأساسي (#1a27c9)
          yellow: "hsl(54, 100%, 63%)", // الأصفر المشع المساعد (#ffe92c)
        }
      },
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
```

---

## 🎨 الخطوة 3: إعداد المتغيرات والأنماط في ملف CSS الرئيسي (`src/index.css`)
هنا نحدد قيم المتغيرات لنمطين (الفاتح والداكن) ليتوافقا مع متطلبات الهوية:

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Hepta+Slab:wght@100;200;300;400;500;600;700;800;900&family=Jomhuria&family=Tajawal:wght@400;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%; /* أبيض ناصع في الفاتح */
    --foreground: 180 4% 5%; /* أسود عميق للنصوص */
    
    --card: 0 0% 100%;
    --card-foreground: 180 4% 5%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 180 4% 5%;
    
    /* الأزرق الملكي هو الأساسي في الفاتح */
    --primary: 234 77% 44%; 
    --primary-foreground: 0 0% 100%;
    
    /* الأصفر المشع هو المساعد في الفاتح */
    --secondary: 54 100% 63%; 
    --secondary-foreground: 234 77% 44%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 214.3 31.8% 91.4%;
    
    --radius: 0.5rem; /* حواف ناعمة 8px */
  }

  .dark {
    --background: 180 4% 5%; /* خلفية سوداء عميقة */
    --foreground: 0 0% 100%;
    
    --card: 180 4% 5%;
    --card-foreground: 0 0% 100%;
    
    --popover: 180 4% 5%;
    --popover-foreground: 0 0% 100%;
    
    /* تنعكس الأدوار في الداكن: الأصفر يصبح هو الأساسي لجذب الانتباه */
    --primary: 54 100% 63%; 
    --primary-foreground: 180 4% 5%;
    
    /* الأزرق يصبح هو المساعد */
    --secondary: 234 77% 44%; 
    --secondary-foreground: 0 0% 100%;
    
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 54 100% 63%; /* حواف تركيز صفراء مشعة */
  }
}

@layer base {
  * {
    @apply border-border;
    box-sizing: border-box;
  }
  html, body {
    overflow-x: hidden;
    max-width: 100vw;
  }
  body {
    @apply font-manrope bg-background text-foreground antialiased selection:bg-athar-yellow/30 selection:text-athar-black;
    transition: background-color 0.3s ease;
    -webkit-overflow-scrolling: touch;
  }
}

@layer utilities {
    /* الخطوط الإضافية */
    .font-manrope { font-family: 'Manrope', sans-serif; }
    .font-hepta { font-family: 'Hepta Slab', serif; }
    .font-jomhuria { font-family: 'Jomhuria', serif; }
    .font-taguel { font-family: 'Tajawal', sans-serif; }
    .font-arabic { font-family: 'Tajawal', sans-serif; }

    /* حركات وتحولات ممتازة */
    .transition-premium {
        transition-property: all;
        transition-duration: 400ms;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    .shadow-premium {
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
    }

    /* مساعدات للهواتف (Mobile Helpers) */
    .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
    .safe-top { padding-top: env(safe-area-inset-top, 0px); }
    .no-overflow-x { overflow-x: hidden; max-width: 100vw; }
    
    .modal-mobile {
        @apply fixed inset-0 z-50 flex flex-col;
    }
    .tap-target {
        min-height: 44px;
        min-width: 44px;
    }
    .float-bar {
        @apply fixed bottom-0 left-0 right-0 z-50;
        padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
    }

    /* تقليص النصوص الطويلة */
    .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
    .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .line-clamp-3 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
}

/* تأثيرات حركية (Keyframes & Animations) */
@keyframes scale-in-center {
    0% { transform: scale(0.9); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.scale-in-center {
    animation: scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}
.animate-fadeIn {
    animation: fadeIn 0.4s ease-out both;
}
.animate-slideInRight {
    animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* نمط الطباعة (Print Styles) */
@media print {
    @page {
        size: A4 portrait;
        margin: 0;
    }
    body, html {
        width: 100%;
        margin: 0;
        padding: 0;
        background-color: #fff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    .print-page {
        page-break-after: always;
        break-after: page;
        min-height: 100vh;
        width: 100%;
        position: relative;
        background-color: white;
    }
    .print-content-scale { zoom: 0.8; }
    .print-page:last-of-type {
        page-break-after: auto;
        break-after: auto;
    }
    .no-print, .print\:hidden { display: none !important; }
}
```

---

## 💎 الخطوة 4: فلسفة التصميم وكيفية كتابة الأكواد (Design Tokens & Classes)

للحصول على المظهر العصري والممتاز (Premium Look) الخاص بالبراند، اتبع القواعد والأنماط التالية في كود React:

### 1. الألوان الديناميكية (Shadcn Dynamic Mode Mapping)
*   **الفاتح (Light Mode):** الخلفية بيضاء ناصعة، الخط أسود عميق، الأزرار الأساسية باللون الأزرق (`bg-primary` تعني أزرق).
*   **الداكن (Dark Mode):** الخلفية سوداء زرقاوية عميقة، الخط أبيض، والأزرار الأساسية تتحول للأصفر المشع للفت الانتباه ووضوح الرؤية الحاد (`bg-primary` تعني أصفر).

### 2. التدرجات اللونية الفاخرة (Premium Gradients)
*   **تدرج العناوين والنصوص (Text Gradient):**
    ```html
    <h1 class="text-transparent bg-clip-text bg-gradient-to-r from-athar-blue to-athar-yellow">
      عنوان متميز بتدرج الهوية
    </h1>
    ```
*   **تدرج الهيرو التفاعلي للخلفية (Hero Radial Gradient):**
    يوضع كخلفية للصفحة ليعطي توهجاً خفيفاً في الزاوية العلوية اليمنى:
    ```html
    <div class="bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-athar-blue/10 via-white to-white">
      <!-- محتوى الهيرو هنا -->
    </div>
    ```
*   **خلفية الكروت الداكنة المائلة (Solid Dark Gradient):**
    ```html
    <div class="bg-gradient-to-br from-athar-blue to-athar-black text-white rounded-lg">
      <!-- محتوى الكارت -->
    </div>
    ```
*   **تدرج التحويم الجمالي للأزرار (Hover Gradient Effect):**
    تأثير الخط الملون السفلي أو الحواف اللامعة التي تظهر بسلاسة عند تحويم الفأرة:
    ```html
    <div class="relative group">
      <button class="...">زر تفاعلي</button>
      <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-athar-blue via-athar-blue/80 to-athar-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    ```

### 3. ملمس الضوضاء الفاخر (Noise Overlay)
يستخدم النظام ملمس ورقي/رملي ناعم فوق التدرجات اللونية الكبيرة لإضفاء مظهر فاخر وملموس:
```html
<div class="relative overflow-hidden bg-gradient-to-br from-athar-blue to-athar-black text-white">
  <!-- طبقة الضوضاء التراكبية -->
  <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>
  
  <!-- المحتوى الفعلي للمكون -->
  <div class="relative z-10">
    ...
  </div>
</div>
```
*(ملاحظة: استخدم شفافية `opacity-50` للفاتح و `opacity-10` أو أقل للداكن).*

### 4. نسب توزيع الألوان (Color Balance 70-15-15)
*   **70% إلى 80%:** مساحات سلبية بيضاء ناصعة أو رماديات خفيفة في الفاتح، والأسود العميق في الداكن.
*   **10% إلى 15%:** الأزرق الملكي (`athar-blue`) للأزرار الأساسية والتفاعلات المهمة.
*   **5% إلى 10%:** الأصفر المشع (`athar-yellow`) للتنبيهات أو الحواف عند التركيز (Focus) أو كعنصر تباين خفيف.

### 5. الرسوم التفاعلية والانتقالات (Animations & Micro-interactions)
*   استخدم دائمًا كلاس `transition-premium` لتأثيرات حركية فائقة السلاسة والنعومة (400ms).
*   استخدم الكلاسات الحركية عند ظهور المكونات على الشاشة:
    ```html
    <div class="scale-in-center shadow-premium bg-card text-card-foreground p-6 rounded-lg">
      محتوى يظهر بشكل مميز
    </div>
    ```
