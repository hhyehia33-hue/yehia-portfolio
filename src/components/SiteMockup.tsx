/**
 * واجهة موقع حقيقية داخل نافذة متصفح — صورة فوتوغرافية حقيقية + اسم المشروع بالعربي
 */

export interface SiteTheme {
  /** اسم المشروع كما يظهر في الشعار */
  logo: string;
  /** حرف الشعار داخل المربع */
  mark: string;
  /** رابط الموقع في شريط العنوان */
  url: string;
  /** صورة الهيرو الفوتوغرافية */
  photo: string;
  /** عناصر القائمة */
  nav: string[];
  /** شارة صغيرة فوق العنوان (اختياري) */
  badge?: string;
  /** العنوان الرئيسي */
  headline: string;
  /** سطر وصف تحت العنوان */
  sub: string;
  /** نص الزر الأساسي */
  cta: string;
  /** نص الزر الثانوي (اختياري) */
  cta2?: string;
  /** شريط إحصائيات صغير أسفل الهيرو */
  stats?: string[];
  /** ألوان الهوية */
  accent: string;
  accentText: string;
  navBg: string;
  /** درجة تعتيم الصورة */
  overlay: string;
}

export default function SiteMockup({ theme, tall = false }: { theme: SiteTheme; tall?: boolean }) {
  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[#0d0d14]" dir="rtl">
      {/* ===== شريط المتصفح ===== */}
      <div className="flex h-8 items-center gap-2 border-b border-white/8 bg-[#1b1b24] px-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-5 w-[58%] items-center justify-center gap-1.5 rounded-md bg-[#0e0e15] px-3">
          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-none stroke-[#5ec26a] stroke-[3]">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          <span className="font-mono text-[9px] text-white/45" dir="ltr">
            {theme.url}
          </span>
        </div>
      </div>

      {/* ===== الموقع ===== */}
      <div className="relative h-[calc(100%-2rem)] w-full overflow-hidden">
        {/* صورة الهيرو الحقيقية */}
        <img src={theme.photo} alt={theme.logo} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: theme.overlay }} />

        {/* شريط التنقل */}
        <div
          className="relative flex items-center justify-between px-4 py-2.5 backdrop-blur-sm"
          style={{ background: theme.navBg }}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-black"
              style={{ background: theme.accent, color: theme.accentText }}
            >
              {theme.mark}
            </span>
            <span className="text-[13px] font-black text-white drop-shadow">{theme.logo}</span>
          </div>
          <div className="hidden items-center gap-3.5 sm:flex">
            {theme.nav.map((n) => (
              <span key={n} className="text-[10px] font-bold text-white/70">
                {n}
              </span>
            ))}
          </div>
          <span
            className="rounded-md px-2.5 py-1 text-[9px] font-black"
            style={{ background: theme.accent, color: theme.accentText }}
          >
            {theme.cta}
          </span>
        </div>

        {/* محتوى الهيرو */}
        <div className={`relative flex flex-col items-center px-5 text-center ${tall ? 'pt-10' : 'pt-6'}`}>
          {theme.badge && (
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-[9px] font-black"
              style={{ background: theme.accent, color: theme.accentText }}
            >
              {theme.badge}
            </span>
          )}
          <h3
            className={`font-black leading-tight text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.85)] ${
              tall ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {theme.headline}
          </h3>
          <p
            className={`mt-2 max-w-md font-semibold text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${
              tall ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'
            }`}
          >
            {theme.sub}
          </p>

          <div className="mt-4 flex items-center gap-2.5">
            <span
              className={`rounded-lg font-black shadow-lg ${tall ? 'px-6 py-2.5 text-xs' : 'px-4 py-2 text-[10px]'}`}
              style={{ background: theme.accent, color: theme.accentText }}
            >
              {theme.cta}
            </span>
            {theme.cta2 && (
              <span
                className={`rounded-lg border border-white/40 font-bold text-white/90 backdrop-blur-sm ${
                  tall ? 'px-5 py-2.5 text-xs' : 'px-3.5 py-2 text-[10px]'
                }`}
              >
                {theme.cta2}
              </span>
            )}
          </div>

          {theme.stats && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
              {theme.stats.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 text-[9px] font-bold text-white/75 drop-shadow sm:text-[10px]"
                >
                  <span className="h-1 w-1 rounded-full" style={{ background: theme.accent }} />
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* كروت سفلية توحي بمحتوى الموقع */}
        <div className="absolute inset-x-0 bottom-0 flex gap-2 px-4 pb-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-9 flex-1 rounded-t-lg border-x border-t border-white/12 bg-white/8 backdrop-blur-md sm:h-11"
            >
              <div className="mx-2 mt-2 h-1 w-8 rounded-full bg-white/35" />
              <div className="mx-2 mt-1.5 h-1 w-12 rounded-full bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
