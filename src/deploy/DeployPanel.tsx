import { useRef, useState } from 'react';
import {
  Rocket,
  KeyRound,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Database,
  Globe,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  deployToGithub,
  deployToVercel,
  setupNeon,
  addEnvToVercel,
  type Logger,
  type GithubResult,
  type VercelResult,
  type NeonResult,
} from './api';

type LogLine = { msg: string; kind: 'info' | 'ok' | 'warn' | 'err' };

const GithubIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const VercelIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 1155 1000">
    <path d="m577.3 0 577.4 1000H0z" />
  </svg>
);

export default function DeployPanel({ onClose }: { onClose: () => void }) {
  const [ghToken, setGhToken] = useState('');
  const [vcToken, setVcToken] = useState('');
  const [neonKey, setNeonKey] = useState('');
  const [repoName, setRepoName] = useState('yehia-portfolio');
  const [isPrivate, setIsPrivate] = useState(false);

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [gh, setGh] = useState<GithubResult | null>(null);
  const [vc, setVc] = useState<VercelResult | null>(null);
  const [neon, setNeon] = useState<NeonResult | null>(null);
  const [copied, setCopied] = useState('');
  const logBoxRef = useRef<HTMLDivElement>(null);

  const log: Logger = (msg, kind = 'info') => {
    setLogs((prev) => [...prev, { msg, kind }]);
    requestAnimationFrame(() => {
      logBoxRef.current?.scrollTo({ top: logBoxRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 1800);
  };

  const run = async () => {
    if (!ghToken.trim()) return;
    setRunning(true);
    setLogs([]);
    setGh(null);
    setVc(null);
    setNeon(null);

    let ghRes: GithubResult | null = null;
    let vcRes: VercelResult | null = null;

    // ===== GitHub =====
    try {
      log('──── الخطوة 1: GitHub ────');
      ghRes = await deployToGithub(ghToken.trim(), repoName.trim(), isPrivate, log);
      setGh(ghRes);
    } catch (e) {
      log((e as Error).message, 'err');
      setRunning(false);
      return;
    }

    // ===== Vercel =====
    if (vcToken.trim()) {
      try {
        log('──── الخطوة 2: Vercel ────');
        vcRes = await deployToVercel(vcToken.trim(), ghRes, log);
        setVc(vcRes);
      } catch (e) {
        log((e as Error).message, 'err');
      }
    } else {
      log('لم يتم إدخال توكن Vercel — تم تخطّي النشر.', 'warn');
    }

    // ===== Neon =====
    if (neonKey.trim()) {
      try {
        log('──── الخطوة 3: Neon ────');
        const nRes = await setupNeon(neonKey.trim(), `${repoName.trim()}-db`, log);
        setNeon(nRes);
        if (vcRes && nRes.connectionString.startsWith('postgres')) {
          await addEnvToVercel(vcToken.trim(), vcRes.projectId, 'DATABASE_URL', nRes.connectionString, log);
        }
      } catch (e) {
        log((e as Error).message, 'err');
      }
    }

    log('──── انتهت العملية ────', 'ok');
    setRunning(false);
  };

  const kindColor: Record<LogLine['kind'], string> = {
    info: 'text-white/55',
    ok: 'text-emerald-400',
    warn: 'text-amber-400',
    err: 'text-rose-400',
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-[100] overflow-y-auto bg-[#07070d]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* رأس */}
        <div className="glass-panel gold-border mb-5 flex items-center justify-between rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ecc078] to-[#a87f35] text-[#1a1206]">
              <Rocket className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-base font-black text-white">أداة النشر التلقائي</h1>
              <p className="text-[11px] font-semibold text-white/45">
                GitHub · Vercel · Neon — بضغطة زر واحدة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* تنبيه أمان */}
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p className="text-[12px] font-semibold leading-relaxed text-emerald-200/80">
            التوكينات بتتنفذ من متصفحك مباشرة للمنصات، ومش بتتخزن ولا بتتبعت لأي سيرفر تاني.
            بعد ما تخلص النشر، يفضّل تعمل للتوكينات <span className="font-black">Revoke</span> من إعدادات حسابك.
          </p>
        </div>

        {/* النموذج */}
        <div className="glass-panel gold-border space-y-5 rounded-2xl p-5 sm:p-6">
          {/* اسم المستودع */}
          <div>
            <label className="mb-2 block text-xs font-black text-white/80">اسم المستودع</label>
            <input
              dir="ltr"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-sm text-white focus:border-[#ecc078]/70 focus:outline-none"
            />
            <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-[11px] font-bold text-white/50">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#ecc078]"
              />
              اجعل المستودع خاصاً (Private)
            </label>
          </div>

          {/* GitHub */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-black text-white/80">
                <GithubIcon className="h-4 w-4" />
                GitHub Token <span className="text-rose-400">*</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=Portfolio%20Deploy"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-[#ecc078] hover:underline"
              >
                استخرج التوكن <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative">
              <KeyRound className="absolute right-3 top-3 h-4 w-4 text-white/25" />
              <input
                dir="ltr"
                type="password"
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pr-10 pl-3.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-[#ecc078]/70 focus:outline-none"
              />
            </div>
            <p className="mt-1.5 text-[10px] font-semibold text-white/35">
              الصلاحية المطلوبة: <code className="text-[#ecc078]">repo</code>
            </p>
          </div>

          {/* Vercel */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-black text-white/80">
                <VercelIcon className="h-3 w-3" />
                Vercel Token
              </label>
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-[#ecc078] hover:underline"
              >
                استخرج التوكن <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative">
              <KeyRound className="absolute right-3 top-3 h-4 w-4 text-white/25" />
              <input
                dir="ltr"
                type="password"
                value={vcToken}
                onChange={(e) => setVcToken(e.target.value)}
                placeholder="vcp_..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pr-10 pl-3.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-[#ecc078]/70 focus:outline-none"
              />
            </div>
          </div>

          {/* Neon */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-black text-white/80">
                <Database className="h-3.5 w-3.5 text-[#4fe0ee]" />
                Neon API Key
              </label>
              <a
                href="https://console.neon.tech/app/settings/api-keys"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-[#ecc078] hover:underline"
              >
                استخرج المفتاح <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative">
              <KeyRound className="absolute right-3 top-3 h-4 w-4 text-white/25" />
              <input
                dir="ltr"
                type="password"
                value={neonKey}
                onChange={(e) => setNeonKey(e.target.value)}
                placeholder="napi_..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pr-10 pl-3.5 font-mono text-sm text-white placeholder:text-white/20 focus:border-[#ecc078]/70 focus:outline-none"
              />
            </div>
          </div>

          {/* زر التنفيذ */}
          <button
            onClick={run}
            disabled={running || !ghToken.trim()}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-l from-[#ecc078] to-[#c99a45] py-4 text-sm font-black text-[#1a1206] shadow-[0_18px_40px_-12px_rgba(236,192,120,0.55)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جارٍ التنفيذ…
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                ابدأ النشر الآن
              </>
            )}
          </button>
        </div>

        {/* السجل */}
        {logs.length > 0 && (
          <div
            ref={logBoxRef}
            className="glass-panel mt-5 max-h-60 space-y-1 overflow-y-auto rounded-2xl p-4 font-mono text-[11px] leading-relaxed"
          >
            {logs.map((l, i) => (
              <div key={i} className={kindColor[l.kind]}>
                {l.kind === 'ok' && '✓ '}
                {l.kind === 'err' && '✕ '}
                {l.kind === 'warn' && '! '}
                {l.msg}
              </div>
            ))}
          </div>
        )}

        {/* النتائج */}
        {(gh || vc || neon) && (
          <div className="mt-5 space-y-3">
            {gh && (
              <div className="glass-panel flex items-center justify-between gap-3 rounded-2xl p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <GithubIcon className="h-5 w-5 shrink-0 text-white" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-emerald-400">تم الرفع على GitHub</div>
                    <div dir="ltr" className="truncate font-mono text-[11px] text-white/55">
                      {gh.htmlUrl}
                    </div>
                  </div>
                </div>
                <a
                  href={gh.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-white/8 px-3 py-2 text-[11px] font-black text-white transition-colors hover:bg-white/15"
                >
                  فتح <ArrowRight className="h-3 w-3 rotate-180" />
                </a>
              </div>
            )}

            {vc && (
              <div className="glass-panel flex items-center justify-between gap-3 rounded-2xl p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Globe className="h-5 w-5 shrink-0 text-[#4fe0ee]" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-emerald-400">الموقع منشور على Vercel</div>
                    <div dir="ltr" className="truncate font-mono text-[11px] text-white/55">
                      {vc.url}
                    </div>
                  </div>
                </div>
                <a
                  href={vc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-[#ecc078] px-3 py-2 text-[11px] font-black text-[#1a1206] transition-opacity hover:opacity-85"
                >
                  زيارة <ArrowRight className="h-3 w-3 rotate-180" />
                </a>
              </div>
            )}

            {neon && (
              <div className="glass-panel rounded-2xl p-4">
                <div className="mb-2 flex items-center gap-3">
                  <Database className="h-5 w-5 text-[#4fe0ee]" />
                  <div className="text-[11px] font-black text-emerald-400">
                    قاعدة بيانات Neon جاهزة — {neon.projectName}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-black/40 p-2.5">
                  <code dir="ltr" className="flex-1 truncate font-mono text-[10px] text-white/50">
                    {neon.connectionString}
                  </code>
                  <button
                    onClick={() => copy(neon.connectionString, 'neon')}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-white/8 px-2.5 py-1.5 text-[10px] font-bold text-white/70 hover:bg-white/15"
                  >
                    {copied === 'neon' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    نسخ
                  </button>
                </div>
              </div>
            )}

            {vc && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-[11px] font-semibold leading-relaxed text-amber-200/75">
                  البناء على Vercel بياخد دقيقة تقريباً. لو اللينك مافتحش من أول مرة، استنى شوية
                  وحدّث الصفحة.
                </p>
              </div>
            )}

            {gh && !vc && (
              <a
                href={`https://vercel.com/new/clone?repository-url=${encodeURIComponent(gh.htmlUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-black transition-opacity hover:opacity-85"
              >
                <VercelIcon className="h-3.5 w-3.5" />
                انشر على Vercel بضغطة واحدة
              </a>
            )}
          </div>
        )}

        {/* تذييل */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-bold text-white/25">
          <CheckCircle2 className="h-3.5 w-3.5" />
          كل العمليات بتتم مباشرة من متصفحك
        </div>
      </div>
    </div>
  );
}
