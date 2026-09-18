import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Phone,
  Mail,
  ChevronDown,
  MessageCircle,
  Briefcase,
  Send,
  CheckCircle2,
  Camera,
  Sparkles,
  Gem,
  Globe,
  Smartphone,
  GraduationCap,
  Rocket,
} from 'lucide-react';
import { HeroBackdrop, PortraitRings, AboutCanvas } from './components/Scene3D';
import TiltCard from './components/TiltCard';
import SiteMockup, { type SiteTheme } from './components/SiteMockup';

const DeployPanel = lazy(() => import('./deploy/DeployPanel'));

/* ------------------------------------------------------------------ */
/*  البيانات                                                           */
/* ------------------------------------------------------------------ */

const PHONE_DISPLAY = '01012297429';
const PHONE_WA = '201012297429';
const EMAIL = 'yehiaahmed6455@gmail.com';

const PORTRAIT_KEY = 'ya-portrait-photo';
const DEFAULT_PORTRAIT = '/images/yehia-portrait.png';

interface Project {
  id: number;
  name: string;
  type: string;
  desc: string;
  /** صورة ثابتة (تُستخدم لتطبيق المساحة فقط) */
  image?: string;
  /** واجهة موقع حقيقية */
  site?: SiteTheme;
}

const projects: Project[] = [
  {
    id: 1,
    name: 'زاد',
    type: 'منصة تعليمية',
    desc: 'منصة تعليمية متكاملة بحسابات طلاب مفعّلة من الإدارة — فيديوهات شرح وملخصات وامتحانات إلكترونية حسب المرحلة الدراسية، ولوحة تحكم إدارية كاملة.',
    site: {
      logo: 'منصة زاد التعليمية',
      mark: 'ز',
      url: 'zad-platform.com',
      photo:
        'https://images.pexels.com/photos/5905749/pexels-photo-5905749.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      nav: ['الرئيسية', 'الكورسات', 'الامتحانات', 'اشتراكاتي'],
      badge: 'التسجيل مفتوح لكل المراحل',
      headline: 'تعليم متكامل… في مكان واحد',
      sub: 'فيديوهات شرح، ملخصات PDF، وامتحانات إلكترونية حسب مرحلتك الدراسية مع متابعة مستمرة لتقدمك.',
      cta: 'ابدأ التعلم',
      cta2: 'استعرض الكورسات',
      stats: ['+6500 طالب', '+120 كورس', 'تقييم 4.9'],
      accent: '#f0c14b',
      accentText: '#1a1405',
      navBg: 'linear-gradient(180deg, rgba(8,20,16,0.92), rgba(8,20,16,0.55))',
      overlay: 'linear-gradient(180deg, rgba(6,18,15,0.82) 0%, rgba(6,18,15,0.7) 45%, rgba(6,18,15,0.95) 100%)',
    },
  },
  {
    id: 2,
    name: 'قمة',
    type: 'منصة تعليمية',
    desc: 'منصة لمدرس لغة عربية — حجز مجموعات السنتر والأونلاين، حصص مجانية، امتحانات دورية بنتائج فورية، ومتابعة فردية لكل طالب.',
    site: {
      logo: 'منصة قمة التعليمية',
      mark: 'ق',
      url: 'qimma-edu.com',
      photo:
        'https://images.pexels.com/photos/6503100/pexels-photo-6503100.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      nav: ['الرئيسية', 'المجموعات', 'الامتحانات', 'تواصل'],
      badge: 'الحجز مفتوح للترم الجديد',
      headline: 'اللغة العربية أسهل مما تتخيل',
      sub: 'شرح مبسط من الصفر، حل مكثف على كل الأفكار، امتحانات دورية ومتابعة فردية — في السنتر أو أونلاين.',
      cta: 'احجز مكانك',
      cta2: 'حصص مجانية',
      stats: ['+7500 طالب سنوياً', '15 سنة خبرة', 'نتائج فورية'],
      accent: '#f5b41f',
      accentText: '#12223d',
      navBg: 'linear-gradient(180deg, rgba(11,26,48,0.94), rgba(11,26,48,0.6))',
      overlay: 'linear-gradient(180deg, rgba(10,24,45,0.85) 0%, rgba(10,24,45,0.72) 45%, rgba(10,24,45,0.96) 100%)',
    },
  },
  {
    id: 3,
    name: 'Survey Engineering',
    type: 'تطبيق محاكاة',
    image: '/images/project-misaha.png',
    desc: 'أول تطبيق محاكاة مساحة في مصر والوطن العربي — تدريب واقعي على جهاز التوتال ستيشن بأزراره الفيزيائية وقراءاته الحقيقية، بوضع تدريب موجّه وامتحانات تطبيقية.',
  },
  {
    id: 4,
    name: 'رواق',
    type: 'متجر إلكتروني',
    desc: 'موقع مقهى وقهوة مختصة — هوية بصرية فاخرة بأسلوب داكن أنيق، قائمة منتجات وأسعار، سلة شراء وطلب أونلاين مع توصيل للمنازل.',
    site: {
      logo: 'رواق',
      mark: 'ر',
      url: 'rawaq-coffee.com',
      photo:
        'https://images.pexels.com/photos/39190559/pexels-photo-39190559.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      nav: ['المتجر', 'محامصنا', 'قصتنا', 'الاشتراكات'],
      headline: 'قهوة مختصة، تُحمّص بحب',
      sub: 'حبوب مختارة من أجود المزارع، تحميص طازج كل أسبوع، وتوصيل لباب بيتك في نفس اليوم.',
      cta: 'اطلب الآن',
      cta2: 'تصفح المحمصة',
      stats: ['تحميص طازج أسبوعياً', 'توصيل لكل المحافظات'],
      accent: '#e5b96b',
      accentText: '#20130c',
      navBg: 'linear-gradient(180deg, rgba(20,11,7,0.94), rgba(20,11,7,0.5))',
      overlay: 'linear-gradient(180deg, rgba(18,10,6,0.8) 0%, rgba(18,10,6,0.66) 45%, rgba(18,10,6,0.96) 100%)',
    },
  },
  {
    id: 5,
    name: 'سكون',
    type: 'موقع تعريفي',
    desc: 'موقع استوديو يوجا — جدول حصص أسبوعي لكل المستويات، ملفات المدربات، وحجز أونلاين بتصميم هادئ يعكس فلسفة المكان.',
    site: {
      logo: 'سكون',
      mark: 'س',
      url: 'sokoon-yoga.com',
      photo:
        'https://images.pexels.com/photos/6648583/pexels-photo-6648583.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      nav: ['الحصص', 'المدربات', 'الأسعار', 'عن سكون'],
      headline: 'هدوءك يبدأ من هنا',
      sub: 'حصص يوجا وتأمل لكل المستويات — حضورياً في الاستوديو أو أونلاين من بيتك.',
      cta: 'احجزي حصتك',
      cta2: 'جدول الأسبوع',
      stats: ['حصص لكل المستويات', 'مدربات معتمدات'],
      accent: '#b8cf9f',
      accentText: '#1b2617',
      navBg: 'linear-gradient(180deg, rgba(16,22,15,0.9), rgba(16,22,15,0.45))',
      overlay: 'linear-gradient(180deg, rgba(20,26,19,0.78) 0%, rgba(20,26,19,0.6) 45%, rgba(20,26,19,0.94) 100%)',
    },
  },
  {
    id: 6,
    name: 'خدمتي',
    type: 'منصة خدمات',
    desc: 'منصة بورتفوليو وسيرة ذاتية — صفحة أعمال بهويتك الخاصة، تستقبل طلبات العملاء مباشرة على واتساب وإيميلك، مع تصنيف الخدمات وعرض نماذج الأعمال.',
    site: {
      logo: 'خدمتي',
      mark: 'خ',
      url: 'khidmaty.app',
      photo:
        'https://images.pexels.com/photos/7014403/pexels-photo-7014403.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      nav: ['استكشف', 'التخصصات', 'كيف تعمل؟', 'الأسعار'],
      badge: 'أنشئ صفحتك في دقائق',
      headline: 'بورتفوليو يجذبلك عملاءك',
      sub: 'اعرض أعمالك بصفحة بهويتك الخاصة، واستقبل طلبات العملاء مباشرة على واتسابك وإيميلك.',
      cta: 'أنشئ صفحتك',
      cta2: 'شوف نماذج',
      stats: ['+2300 محترف', 'ربط واتساب مباشر'],
      accent: '#8d7bf0',
      accentText: '#120c2b',
      navBg: 'linear-gradient(180deg, rgba(14,12,26,0.93), rgba(14,12,26,0.5))',
      overlay: 'linear-gradient(180deg, rgba(13,11,24,0.82) 0%, rgba(13,11,24,0.68) 45%, rgba(13,11,24,0.96) 100%)',
    },
  },
  {
    id: 7,
    name: 'عقارك',
    type: 'موقع عقارات',
    desc: 'موقع بيع وتأجير عقارات — بحث ذكي بالمدينة والميزانية ونوع الوحدة، صور موثقة وأسعار حقيقية لآلاف الوحدات، وتواصل مباشر مع المالك.',
    site: {
      logo: 'عقارك',
      mark: 'ع',
      url: 'aqarak.com',
      photo:
        'https://images.pexels.com/photos/27459248/pexels-photo-27459248.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      nav: ['للبيع', 'للإيجار', 'فلل', 'تجاري'],
      headline: 'بيتك الجديد يبدأ من هنا',
      sub: 'آلاف الوحدات للبيع والإيجار في كل المحافظات — صور موثقة، أسعار حقيقية، وتواصل مباشر مع المالك.',
      cta: 'ابحث عن عقار',
      cta2: 'اعرض عقارك',
      stats: ['+12,000 وحدة', 'بحث بالميزانية والمدينة'],
      accent: '#e8a33d',
      accentText: '#132635',
      navBg: 'linear-gradient(180deg, rgba(12,26,38,0.94), rgba(12,26,38,0.5))',
      overlay: 'linear-gradient(180deg, rgba(11,24,36,0.82) 0%, rgba(11,24,36,0.66) 45%, rgba(11,24,36,0.96) 100%)',
    },
  },
];

const serviceOptions = [
  'موقع إلكتروني',
  'منصة تعليمية',
  'متجر إلكتروني',
  'تطبيق موبايل',
  'تصميم واجهات وهوية',
  'خدمة أخرى',
];

const marqueeItems = ['منصات تعليمية', 'مواقع احترافية', 'متاجر إلكترونية', 'تطبيقات موبايل', 'تصميم واجهات', 'هوية بصرية', 'محاكاة وتدريب', 'حجز أونلاين'];

/* ------------------------------------------------------------------ */
/*  مكونات مساعدة                                                      */
/* ------------------------------------------------------------------ */

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1500;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} dir="ltr">
      {suffix}
      {val}
    </span>
  );
}

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (ref.current)
        ref.current.style.transform = `translate(${e.clientX - 190}px, ${e.clientY - 190}px)`;
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-auto top-0 left-0 z-[4] hidden h-[380px] w-[380px] rounded-full md:block"
      style={{
        background: 'radial-gradient(circle, rgba(139,92,246,0.11), rgba(236,192,120,0.06) 45%, transparent 70%)',
        mixBlendMode: 'screen',
      }}
    />
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (d: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  التطبيق                                                            */
/* ------------------------------------------------------------------ */

export default function App() {
  const [portrait, setPortrait] = useState<string>(DEFAULT_PORTRAIT);
  const [name, setName] = useState('');
  const [service, setService] = useState(serviceOptions[0]);
  const [details, setDetails] = useState('');
  const [showDeploy, setShowDeploy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    try {
      const saved = localStorage.getItem(PORTRAIT_KEY);
      if (saved) setPortrait(saved);
    } catch {
      /* التخزين غير متاح */
    }
  }, []);

  // لوحة النشر تظهر فقط عند إضافة #deploy إلى الرابط
  useEffect(() => {
    const sync = () => setShowDeploy(window.location.hash === '#deploy');
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const closeDeploy = () => {
    history.replaceState(null, '', window.location.pathname);
    setShowDeploy(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 900;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setPortrait(dataUrl);
        try {
          localStorage.setItem(PORTRAIT_KEY, dataUrl);
        } catch {
          /* حجم أكبر من المسموح */
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const sendWhatsApp = () => {
    if (!name.trim() || !details.trim()) return;
    const msg =
      `السلام عليكم يحيى 👋\n\n` +
      `الاسم: ${name.trim()}\n` +
      `الخدمة المطلوبة: ${service}\n` +
      `تفاصيل الطلب: ${details.trim()}\n\n` +
      `— مرسلة من موقعك الشخصي`;
    window.open(`https://wa.me/${PHONE_WA}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const canSend = name.trim().length > 0 && details.trim().length > 0;

  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-hidden bg-[#07070d] text-[#eceaf4]">
      <div className="noise-overlay" aria-hidden="true" />
      <CursorGlow />

      {/* ====================== الشريط العلوي ====================== */}
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-50"
      >
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="glass-panel gold-border flex h-14 items-center justify-between rounded-2xl px-5">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ecc078] to-[#a87f35] font-black text-sm text-[#1a1206] shadow-[0_8px_20px_-6px_rgba(236,192,120,0.5)]">
                يـ
              </span>
              <span className="text-sm font-extrabold tracking-tight">يحيى أحمد</span>
            </a>
            <div className="hidden items-center gap-7 text-sm font-semibold text-white/55 sm:flex">
              <a href="#about" className="transition-colors hover:text-[#ecc078]">نبذة عني</a>
              <a href="#work" className="transition-colors hover:text-[#ecc078]">أعمالي</a>
              <a href="#contact" className="transition-colors hover:text-[#ecc078]">تواصل معايا</a>
            </div>
            <a
              href="#contact"
              className="rounded-xl bg-[#eceaf4] px-4 py-2 text-xs font-extrabold text-[#0b0b13] transition-all hover:bg-[#ecc078]"
            >
              اطلب مشروعك
            </a>
          </div>
        </div>
      </motion.nav>

      {/* ====================== الهيدر ====================== */}
      <header id="top" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pt-28 pb-16">
        <HeroBackdrop />
        {/* توهجات زخرفية */}
        <div className="pointer-events-none absolute right-[10%] top-[18%] h-72 w-72 rounded-full bg-[#8b5cf6]/12 blur-[110px]" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-[12%] left-[8%] h-80 w-80 rounded-full bg-[#ecc078]/10 blur-[120px]" aria-hidden="true" />

        <div className="relative flex max-w-3xl flex-col items-center text-center">
          {/* شارة */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="glass-panel mb-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-white/70"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ecc078] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ecc078]" />
            </span>
            متاح لمشاريع جديدة
          </motion.div>

          {/* الصورة + الحلقات 3D */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-10"
          >
            <PortraitRings />
            <img
              src={portrait}
              alt="يحيى أحمد"
              className="relative z-10 h-52 w-52 rounded-full border-[3px] border-white/15 object-cover object-top shadow-[0_0_70px_-12px_rgba(236,192,120,0.5),0_30px_60px_-20px_rgba(0,0,0,0.8)] sm:h-64 sm:w-64"
            />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="تغيير الصورة"
              aria-label="تغيير الصورة"
              className="absolute bottom-2 left-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white opacity-35 backdrop-blur transition-all hover:opacity-100"
            >
              <Camera className="h-4 w-4" />
            </button>
          </motion.div>

          {/* الاسم */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.3}
            className="text-glow-gold text-5xl font-black tracking-tight sm:text-7xl"
            dir="ltr"
          >
            YEHIA{' '}
            <span className="bg-gradient-to-l from-[#ecc078] via-[#f4d9a5] to-[#9f8bf5] bg-clip-text text-transparent">
              AHMED
            </span>
          </motion.h1>

          {/* الوصف */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.42}
            className="mt-5 text-lg font-extrabold text-white/85 sm:text-2xl"
          >
            مصمم ومطور منصات ومواقع وتطبيقات
          </motion.p>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.52}
            className="mt-4 max-w-xl text-sm leading-loose text-white/50 sm:text-base"
          >
            بحوّل فكرتك لمنتج رقمي كامل وجاهز للإطلاق — من أول التخطيط والتصميم لحد التطوير والنشر،
            بشغل متقن وتواصل واضح في كل خطوة.
          </motion.p>

          {/* بيانات التواصل */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.64}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href={`tel:${PHONE_DISPLAY}`}
              className="glass-panel flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors hover:border-[#ecc078]/60 hover:text-[#ecc078]"
            >
              <Phone className="h-4 w-4 text-[#ecc078]" />
              <span dir="ltr">{PHONE_DISPLAY}</span>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="glass-panel flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors hover:border-[#ecc078]/60 hover:text-[#ecc078]"
            >
              <Mail className="h-4 w-4 text-[#ecc078]" />
              <span dir="ltr">{EMAIL}</span>
            </a>
          </motion.div>

          {/* أزرار */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.76}
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#work"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-l from-[#ecc078] to-[#c99a45] px-8 py-4 text-sm font-black text-[#1a1206] shadow-[0_18px_40px_-12px_rgba(236,192,120,0.55)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-10px_rgba(236,192,120,0.7)]"
            >
              <Briefcase className="h-4 w-4" />
              شوف أعمالي
            </a>
            <a
              href="#contact"
              className="glass-panel gold-border flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-black text-white/85 transition-all hover:-translate-y-1 hover:text-white"
            >
              <MessageCircle className="h-4 w-4 text-[#9f8bf5]" />
              كلمني دلوقتي
            </a>
          </motion.div>
        </div>

        <a href="#about" className="absolute bottom-6 right-1/2 translate-x-1/2 animate-bounce text-white/35">
          <ChevronDown className="h-6 w-6" />
        </a>
      </header>

      {/* ====================== ماركي الخدمات ====================== */}
      <div className="relative border-y border-white/6 bg-white/[0.015] py-5" dir="ltr">
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex shrink-0 -translate-x-1/2 items-center gap-10 pl-10">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap" dir="rtl">
                <span className="text-sm font-bold text-white/45">{item}</span>
                <Gem className="h-3.5 w-3.5 text-[#ecc078]/70" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ====================== نبذة عني ====================== */}
      <section id="about" className="relative mx-auto max-w-6xl px-5 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel gold-border relative overflow-hidden rounded-[2.5rem] px-7 py-12 sm:px-12 sm:py-14"
        >
          <AboutCanvas />
          <div className="relative">
            <span className="mb-3 inline-block text-xs font-black tracking-[0.25em] text-[#ecc078]">نبذة عني</span>
            <h2 className="mb-6 text-3xl font-black leading-snug sm:text-4xl">
              من الفكرة…{' '}
              <span className="bg-gradient-to-l from-[#ecc078] to-[#9f8bf5] bg-clip-text text-transparent">
                لمنتج شغّال على أرض الواقع
              </span>
            </h2>
            <p className="max-w-3xl text-sm leading-loose text-white/60 sm:text-base">
              بشتغل في تصميم وتطوير المنصات التعليمية والمواقع والتطبيقات من سنين، ونفّذت مشاريع
              حقيقية بيستخدمها آلاف الطلاب والعملاء يومياً في مصر والوطن العربي. بمسك المشروع من أوله
              لآخره: بفهم فكرتك واحتياج جمهورك، بصمم واجهات مريحة وسهلة، بطوّر بأحدث التقنيات،
              وبسلّمك منتج مجرّب وجاهز للإطلاق — ومعاك بعد التسليم في أي تعديل أو تطوير.
            </p>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-5">
              {[
                { to: 40, suffix: '+', label: 'مشروع منفّذ' },
                { to: 7, suffix: '+', label: 'منصة وتطبيق' },
                { to: 100, suffix: '%', label: 'رضا العملاء' },
              ].map((s) => (
                <div key={s.label} className="glass-panel rounded-2xl p-4 text-center sm:p-5">
                  <div className="text-2xl font-black text-[#ecc078] sm:text-4xl">
                    <Counter to={s.to} suffix={s.suffix} />
                  </div>
                  <div className="mt-1.5 text-[11px] font-bold text-white/45 sm:text-xs">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {[
                { icon: GraduationCap, text: 'خبرة في المنصات التعليمية' },
                { icon: Globe, text: 'مواقع ومتاجر احترافية' },
                { icon: Smartphone, text: 'تطبيقات بأداء عالي' },
                { icon: Sparkles, text: 'هوية وتصميم مميز' },
              ].map((f) => (
                <span key={f.text} className="flex items-center gap-2 text-xs font-bold text-white/55 sm:text-sm">
                  <f.icon className="h-4 w-4 text-[#9f8bf5]" />
                  {f.text}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ====================== أعمالي ====================== */}
      <section id="work" className="relative mx-auto max-w-6xl px-5 pb-28">
        <div className="pointer-events-none absolute left-[5%] top-[30%] h-72 w-72 rounded-full bg-[#4fe0ee]/8 blur-[110px]" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <span className="mb-3 inline-block text-xs font-black tracking-[0.25em] text-[#ecc078]">أعمالي</span>
          <h2 className="text-3xl font-black sm:text-4xl">مشاريع حقيقية، <span className="text-white/45">لعملاء حقيقيين</span></h2>
        </motion.div>

        <div className="grid gap-7 sm:grid-cols-2" style={{ perspective: '1400px' }}>
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, delay: (i % 2) * 0.1 }}
              className={i === 0 ? 'sm:col-span-2' : ''}
            >
              <TiltCard intensity={i === 0 ? 5 : 8} className="h-full">
                <article className="glass-panel gold-border h-full overflow-hidden rounded-3xl">
                  <div className={`relative overflow-hidden ${i === 0 ? 'h-72 sm:h-[26rem]' : 'h-60'}`}>
                    {p.site ? (
                      <SiteMockup theme={p.site} tall={i === 0} />
                    ) : (
                      <img
                        src={p.image}
                        alt={`${p.name} — ${p.type}`}
                        loading="lazy"
                        className="h-full w-full object-cover object-top"
                      />
                    )}
                    <span className="absolute bottom-3 left-3 z-10 rounded-full border border-white/12 bg-black/65 px-3 py-1.5 text-[10px] font-black text-[#ecc078] backdrop-blur">
                      {p.type}
                    </span>
                  </div>
                  <div className="px-6 pb-6 pt-5">
                    <h3 className="text-xl font-black">{p.name}</h3>
                    <p className="mt-2.5 text-sm leading-loose text-white/55">{p.desc}</p>
                  </div>
                </article>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====================== تواصل معايا ====================== */}
      <section id="contact" className="relative mx-auto max-w-6xl px-5 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel gold-border relative overflow-hidden rounded-[2.5rem]"
        >
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[#8b5cf6]/12 blur-[100px]" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[#ecc078]/10 blur-[100px]" aria-hidden="true" />
          <div className="relative grid md:grid-cols-5">
            {/* الجانب التعريفي */}
            <div className="flex flex-col justify-between border-b border-white/8 bg-gradient-to-br from-[#101019] to-[#0c0c14] p-8 sm:p-10 md:col-span-2 md:border-b-0 md:border-l">
              <div>
                <span className="mb-3 inline-block text-xs font-black tracking-[0.25em] text-[#ecc078]">تواصل معايا</span>
                <h2 className="mb-4 text-2xl font-black leading-snug sm:text-3xl">
                  عندك فكرة مشروع؟<br />
                  احكيلي عنها
                </h2>
                <p className="text-sm leading-relaxed text-white/50">
                  اكتب اسمك وطلبك، والرسالة هتوصلني واتساب فوراً وهرد عليك في أقرب وقت — عادة خلال ساعة.
                </p>
              </div>
              <div className="mt-10 space-y-3 text-sm font-bold">
                <a
                  href={`tel:${PHONE_DISPLAY}`}
                  className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors hover:text-[#ecc078]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ecc078]/12">
                    <Phone className="h-4 w-4 text-[#ecc078]" />
                  </span>
                  <span dir="ltr">{PHONE_DISPLAY}</span>
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="glass-panel flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors hover:text-[#ecc078]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#9f8bf5]/12">
                    <Mail className="h-4 w-4 text-[#9f8bf5]" />
                  </span>
                  <span dir="ltr" className="break-all">{EMAIL}</span>
                </a>
              </div>
            </div>

            {/* الفورم */}
            <div className="p-8 sm:p-10 md:col-span-3">
              <div className="space-y-5">
                <div>
                  <label htmlFor="c-name" className="mb-2 block text-sm font-extrabold">الاسم</label>
                  <input
                    id="c-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اكتب اسمك"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold placeholder:text-white/25 focus:border-[#ecc078]/70 focus:bg-white/[0.06] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="c-service" className="mb-2 block text-sm font-extrabold">الخدمة المطلوبة</label>
                  <select
                    id="c-service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold focus:border-[#ecc078]/70 focus:outline-none transition-colors"
                  >
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="c-details" className="mb-2 block text-sm font-extrabold">تفاصيل الطلب</label>
                  <textarea
                    id="c-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={5}
                    placeholder="احكيلي عن مشروعك… إيه اللي محتاجه؟ وهل في ميعاد معين للتسليم؟"
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold placeholder:text-white/25 focus:border-[#ecc078]/70 focus:bg-white/[0.06] focus:outline-none transition-colors"
                  />
                </div>
                <button
                  onClick={sendWhatsApp}
                  disabled={!canSend}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-l from-[#2fce6e] to-[#1faa59] py-4 text-sm font-black text-white shadow-[0_18px_40px_-12px_rgba(31,170,89,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-12px_rgba(31,170,89,0.75)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
                >
                  <Send className="h-4 w-4" />
                  إرسال عبر واتساب
                </button>
                <p className="flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-white/30">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2fce6e]" />
                  الرسالة بتتفتح مباشرة في واتساب — من غير ما تتخزن في أي مكان تاني.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ====================== الفوتر ====================== */}
      <footer className="border-t border-white/6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs font-bold text-white/35 sm:flex-row">
          <span>© {new Date().getFullYear()} يحيى أحمد — جميع الحقوق محفوظة</span>
          <div className="flex items-center gap-5">
            <a href={`tel:${PHONE_DISPLAY}`} dir="ltr" className="transition-colors hover:text-[#ecc078]">{PHONE_DISPLAY}</a>
            <a href={`mailto:${EMAIL}`} dir="ltr" className="transition-colors hover:text-[#ecc078]">{EMAIL}</a>

          </div>
        </div>
      </footer>

      {/* زر واتساب عائم */}
      <a
        href={`https://wa.me/${PHONE_WA}?text=${encodeURIComponent('السلام عليكم يحيى، شوفت موقعك وعايز أكلمك بخصوص مشروع.')}`}
        target="_blank"
        rel="noreferrer"
        aria-label="تواصل واتساب"
        className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2fce6e] to-[#1a8a4a] shadow-[0_18px_40px_-8px_rgba(31,170,89,0.65)] transition-all hover:scale-110 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* ===== زر أداة النشر — كبير وواضح ===== */}
      {!showDeploy && (
        <button
          onClick={() => {
            window.location.hash = 'deploy';
            setShowDeploy(true);
          }}
          className="group fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-gradient-to-l from-[#ecc078] to-[#c99a45] px-5 py-4 text-sm font-black text-[#1a1206] shadow-[0_18px_45px_-10px_rgba(236,192,120,0.7)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_55px_-8px_rgba(236,192,120,0.85)] active:scale-95"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1a1206]/50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#1a1206]" />
          </span>
          <Rocket className="h-4 w-4" />
          <span>أداة النشر</span>
        </button>
      )}

      {/* لوحة النشر */}
      {showDeploy && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07070d]/95 text-sm font-bold text-white/60">
              جارٍ تحميل أداة النشر…
            </div>
          }
        >
          <DeployPanel onClose={closeDeploy} />
        </Suspense>
      )}
    </div>
  );
}
