import { collectRepoFiles } from './files';

export type Logger = (msg: string, kind?: 'info' | 'ok' | 'warn' | 'err') => void;

const GH = 'https://api.github.com';
const VC = 'https://api.vercel.com';
const NEON = 'https://console.neon.tech/api/v2';

async function ghFetch(token: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${GH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  return res;
}

/* ================================================================== */
/*  GitHub                                                             */
/* ================================================================== */

export interface GithubResult {
  owner: string;
  repo: string;
  repoId: number;
  htmlUrl: string;
}

export async function deployToGithub(
  token: string,
  repoName: string,
  isPrivate: boolean,
  log: Logger
): Promise<GithubResult> {
  log('جارٍ التحقق من توكن GitHub…');
  const userRes = await ghFetch(token, '/user');
  if (!userRes.ok) {
    throw new Error('توكن GitHub غير صالح. تأكد من نسخه كاملاً ومن تفعيل صلاحية repo.');
  }
  const user = await userRes.json();
  const owner: string = user.login;
  log(`تم الاتصال بحساب: ${owner}`, 'ok');

  // 1) إنشاء المستودع أو استخدام الموجود
  log(`جارٍ تجهيز المستودع: ${repoName}…`);
  let repoId = 0;
  let htmlUrl = `https://github.com/${owner}/${repoName}`;

  const createRes = await ghFetch(token, '/user/repos', {
    method: 'POST',
    body: JSON.stringify({
      name: repoName,
      description: 'بورتفوليو يحيى أحمد — مصمم ومطور منصات ومواقع وتطبيقات',
      private: isPrivate,
      auto_init: true,
    }),
  });

  if (createRes.ok) {
    const repo = await createRes.json();
    repoId = repo.id;
    htmlUrl = repo.html_url;
    log('تم إنشاء المستودع بنجاح.', 'ok');
    // مهلة بسيطة حتى يجهّز GitHub الفرع الأول
    await new Promise((r) => setTimeout(r, 1800));
  } else if (createRes.status === 422) {
    log('المستودع موجود بالفعل — سيتم تحديثه.', 'warn');
    const getRes = await ghFetch(token, `/repos/${owner}/${repoName}`);
    if (!getRes.ok) throw new Error('الاسم محجوز ولا يمكن الوصول للمستودع. جرّب اسماً آخر.');
    const repo = await getRes.json();
    repoId = repo.id;
    htmlUrl = repo.html_url;
  } else {
    const e = await createRes.json().catch(() => ({}));
    throw new Error(e.message || 'تعذّر إنشاء المستودع.');
  }

  // 2) تحديد الفرع الافتراضي والـ commit الأساسي
  const repoInfo = await (await ghFetch(token, `/repos/${owner}/${repoName}`)).json();
  const branch: string = repoInfo.default_branch || 'main';

  let baseCommitSha = '';
  let baseTreeSha = '';
  const refRes = await ghFetch(token, `/repos/${owner}/${repoName}/git/ref/heads/${branch}`);
  if (refRes.ok) {
    const ref = await refRes.json();
    baseCommitSha = ref.object.sha;
    const commit = await (
      await ghFetch(token, `/repos/${owner}/${repoName}/git/commits/${baseCommitSha}`)
    ).json();
    baseTreeSha = commit.tree.sha;
  }

  // 3) تجميع الملفات
  log('جارٍ تجميع ملفات المشروع…');
  const files = await collectRepoFiles(`${owner}/${repoName}`);
  log(`عدد الملفات المراد رفعها: ${files.length}`, 'ok');

  // 4) رفع كل ملف كـ blob
  const tree: { path: string; mode: '100644'; type: 'blob'; sha: string }[] = [];
  let done = 0;
  for (const f of files) {
    const blobRes = await ghFetch(token, `/repos/${owner}/${repoName}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: f.base64, encoding: 'base64' }),
    });
    if (!blobRes.ok) throw new Error(`تعذّر رفع الملف: ${f.path}`);
    const blob = await blobRes.json();
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    done++;
    if (done % 4 === 0 || done === files.length) {
      log(`رفع الملفات… ${done}/${files.length}`);
    }
  }

  // 5) إنشاء شجرة الملفات
  log('جارٍ إنشاء شجرة الملفات…');
  const treeRes = await ghFetch(token, `/repos/${owner}/${repoName}/git/trees`, {
    method: 'POST',
    body: JSON.stringify(baseTreeSha ? { base_tree: baseTreeSha, tree } : { tree }),
  });
  if (!treeRes.ok) throw new Error('تعذّر إنشاء شجرة الملفات.');
  const treeData = await treeRes.json();

  // 6) إنشاء commit
  const commitRes = await ghFetch(token, `/repos/${owner}/${repoName}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: 'رفع موقع البورتفوليو',
      tree: treeData.sha,
      parents: baseCommitSha ? [baseCommitSha] : [],
    }),
  });
  if (!commitRes.ok) throw new Error('تعذّر إنشاء الـ commit.');
  const commitData = await commitRes.json();

  // 7) تحديث الفرع
  const patchRes = await ghFetch(token, `/repos/${owner}/${repoName}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commitData.sha, force: true }),
  });
  if (!patchRes.ok) {
    await ghFetch(token, `/repos/${owner}/${repoName}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commitData.sha }),
    });
  }

  log('تم رفع المشروع كاملاً على GitHub.', 'ok');
  return { owner, repo: repoName, repoId, htmlUrl };
}

/* ================================================================== */
/*  Vercel                                                             */
/* ================================================================== */

export interface VercelResult {
  projectId: string;
  projectName: string;
  url: string;
  dashboard: string;
}

export async function deployToVercel(
  token: string,
  gh: GithubResult,
  log: Logger
): Promise<VercelResult> {
  const h = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  log('جارٍ التحقق من توكن Vercel…');
  const userRes = await fetch(`${VC}/v2/user`, { headers: h });
  if (!userRes.ok) throw new Error('توكن Vercel غير صالح.');
  const u = await userRes.json();
  log(`تم الاتصال بحساب Vercel: ${u.user?.username || u.user?.name || 'مستخدم'}`, 'ok');

  const projectName = gh.repo.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 52);

  // إنشاء المشروع مرتبطاً بمستودع GitHub
  log('جارٍ إنشاء مشروع Vercel وربطه بالمستودع…');
  let projectId = '';
  const createRes = await fetch(`${VC}/v10/projects`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      name: projectName,
      framework: 'vite',
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      gitRepository: { type: 'github', repo: `${gh.owner}/${gh.repo}` },
    }),
  });

  if (createRes.ok) {
    const proj = await createRes.json();
    projectId = proj.id;
    log('تم إنشاء مشروع Vercel وربطه بنجاح.', 'ok');
  } else {
    const err = await createRes.json().catch(() => ({}));
    const code = err?.error?.code;
    if (code === 'conflict' || createRes.status === 409) {
      log('المشروع موجود بالفعل على Vercel — سيتم استخدامه.', 'warn');
      const getRes = await fetch(`${VC}/v9/projects/${projectName}`, { headers: h });
      if (!getRes.ok) throw new Error('تعذّر الوصول لمشروع Vercel الموجود.');
      projectId = (await getRes.json()).id;
    } else if (code === 'not_authorized' || code === 'forbidden') {
      throw new Error(
        'Vercel غير مصرّح له بالوصول لحساب GitHub. افتح vercel.com/new وثبّت تطبيق GitHub مرة واحدة ثم أعد المحاولة.'
      );
    } else {
      throw new Error(err?.error?.message || 'تعذّر إنشاء مشروع Vercel.');
    }
  }

  // إطلاق أول عملية نشر
  log('جارٍ إطلاق عملية النشر…');
  const depRes = await fetch(`${VC}/v13/deployments`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      name: projectName,
      project: projectId,
      target: 'production',
      gitSource: {
        type: 'github',
        repo: `${gh.owner}/${gh.repo}`,
        repoId: gh.repoId,
        ref: 'main',
      },
    }),
  });

  if (depRes.ok) {
    log('بدأت عملية البناء على Vercel (تستغرق دقيقة تقريباً).', 'ok');
  } else {
    log('المشروع مرتبط — سيبدأ النشر تلقائياً خلال لحظات.', 'warn');
  }

  return {
    projectId,
    projectName,
    url: `https://${projectName}.vercel.app`,
    dashboard: `https://vercel.com/dashboard`,
  };
}

/* ================================================================== */
/*  Neon                                                               */
/* ================================================================== */

export interface NeonResult {
  projectName: string;
  connectionString: string;
  console: string;
}

export async function setupNeon(
  apiKey: string,
  dbName: string,
  log: Logger
): Promise<NeonResult> {
  const h = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  log('جارٍ التحقق من مفتاح Neon…');
  const listRes = await fetch(`${NEON}/projects`, { headers: h });
  if (!listRes.ok) throw new Error('مفتاح Neon غير صالح.');
  log('تم الاتصال بحساب Neon.', 'ok');

  log('جارٍ إنشاء قاعدة البيانات…');
  const createRes = await fetch(`${NEON}/projects`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      project: { name: dbName, pg_version: 16 },
    }),
  });

  if (!createRes.ok) {
    const e = await createRes.json().catch(() => ({}));
    throw new Error(e.message || 'تعذّر إنشاء قاعدة بيانات Neon.');
  }

  const data = await createRes.json();
  const conn: string =
    data.connection_uris?.[0]?.connection_uri || '(راجع لوحة Neon للحصول على رابط الاتصال)';

  log('تم إنشاء قاعدة البيانات بنجاح.', 'ok');
  return {
    projectName: data.project?.name || dbName,
    connectionString: conn,
    console: 'https://console.neon.tech',
  };
}

/** يضيف رابط قاعدة البيانات كمتغيّر بيئة في مشروع Vercel */
export async function addEnvToVercel(
  token: string,
  projectId: string,
  key: string,
  value: string,
  log: Logger
) {
  const res = await fetch(`${VC}/v10/projects/${projectId}/env`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key,
      value,
      type: 'encrypted',
      target: ['production', 'preview', 'development'],
    }),
  });
  if (res.ok) log(`تمت إضافة المتغيّر ${key} إلى Vercel.`, 'ok');
  else log(`تعذّرت إضافة المتغيّر ${key} تلقائياً — يمكنك إضافته يدوياً.`, 'warn');
}
