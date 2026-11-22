// FreePublish core — pure, dependency-free business rules.
// No account credentials, cookies, browser automation, or platform API calls.
export const PLATFORMS = Object.freeze({
  xiaohongshu: { name: '小红书', short: '小红书', url: 'https://creator.xiaohongshu.com', titleLimit: 20, titlePolicy: 'warn', type: 'mixed', domains: ['xiaohongshu.com', 'xhslink.com'] },
  douyin: { name: '抖音', short: '抖音', url: 'https://creator.douyin.com', titleLimit: 55, titlePolicy: 'warn', type: 'video', domains: ['douyin.com'] },
  channels: { name: '视频号', short: '视频号', url: 'https://channels.weixin.qq.com/platform/post/create', titleLimit: 16, titlePolicy: 'block', type: 'video', domains: ['weixin.qq.com', 'weixin.com', 'weishi.qq.com'] },
  bilibili: { name: '哔哩哔哩', short: 'B站', url: 'https://member.bilibili.com/platform/upload/video/frame', titleLimit: 80, titlePolicy: 'warn', type: 'video', domains: ['bilibili.com', 'b23.tv'] },
  threads: { name: 'Threads', short: 'Threads', url: 'https://www.threads.com', titleLimit: null, titlePolicy: 'warn', type: 'text', domains: ['threads.com', 'threads.net'] },
  x: { name: 'X', short: 'X', url: 'https://x.com/compose/post', titleLimit: null, titlePolicy: 'warn', type: 'text', domains: ['x.com', 'twitter.com'] }
});
export const DEFAULT_PLATFORMS = Object.freeze(['xiaohongshu', 'douyin', 'channels', 'bilibili']);
export const DATA_VERSION = 1;
const MAX_POSTS = 2000;
const MAX_EVENTS = 3000;
const TITLE_FALLBACK = '未命名内容';

export function createPost(id = makeId()) {
  return {
    id, revision: 0, title: '', source: '', kind: 'video', mediaNames: [], mediaInfo: [],
    rights: 'unknown', aiUsed: false, commercial: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    variants: {}
  };
}
export function makeId() {
  return (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID() : 'fp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}
export function emptyState() { return { version: DATA_VERSION, posts: [], audit: [] }; }
export function visibleTitle(post) { return post.title.trim() || TITLE_FALLBACK; }
export function charLength(value) { return Array.from(String(value || '')).length; }
export function clipText(text, limit) {
  const chars = Array.from(String(text || '').trim());
  return limit && chars.length > limit ? chars.slice(0, limit).join('') : chars.join('');
}
export function extractTags(text) {
  return Array.from(new Set((String(text || '').match(/#[^\s#，。！!？?,，]+/g) || []).slice(0, 12)));
}
export function generateVariant(post, platform) {
  const cfg = PLATFORMS[platform];
  if (!cfg) throw new Error('不支持的平台：' + platform);
  return {
    title: clipText(post.title, cfg.titleLimit),
    body: String(post.source || '').trim(),
    tags: extractTags(post.source).join(' '),
    plannedAt: '',
    accountLabel: '',
    aiLabel: false,
    commercialLabel: false,
    warningAcknowledged: false,
    publishChecks: { account: false, media: false, disclosures: false, visibility: false },
    approvedFingerprint: '',
    approvedAt: '',
    reviewer: '',
    publishedUrl: '',
    publishedAt: '',
    publishedFingerprint: ''
  };
}
export function ensureVariants(post, platforms = DEFAULT_PLATFORMS) {
  let created = 0;
  for (const platform of platforms) {
    if (PLATFORMS[platform] && !post.variants[platform]) {
      post.variants[platform] = generateVariant(post, platform);
      created++;
    }
  }
  return created;
}
// This is an edit-revision marker, NOT a cryptographic signature or proof of identity.
export function fingerprint(post, platform) {
  const v = post.variants[platform];
  if (!v) return '';
  const payload = JSON.stringify([
    post.revision || 0, post.title, post.source, post.kind, post.mediaNames, post.mediaInfo, post.rights,
    post.aiUsed, post.commercial,
    v.title, v.body, v.tags, v.plannedAt, v.accountLabel, v.aiLabel, v.commercialLabel
  ]);
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
export function isApproved(post, platform) {
  const v = post.variants[platform];
  return !!(v && v.approvedFingerprint && v.approvedFingerprint === fingerprint(post, platform));
}
export function finalChecklistDone(post, platform) {
  const c = post?.variants?.[platform]?.publishChecks;
  return !!(c && c.account === true && c.media === true && c.disclosures === true && c.visibility === true);
}
export function readyForManualPublish(post, platform) {
  return isApproved(post, platform) && finalChecklistDone(post, platform);
}
export function normalizeText(text) {
  return String(text || '').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
}
export function review(post, platform, allPosts = [], now = new Date()) {
  const issues = [];
  const v = post.variants[platform];
  const cfg = PLATFORMS[platform];
  if (!cfg || !v) {
    return [{ code: 'not-ready', severity: 'block', message: '尚未生成该平台版本。' }];
  }
  const add = (code, severity, message) => issues.push({ code, severity, message });
  if (!v.title.trim()) add('title-missing', 'block', '缺少平台标题。');
  if (!v.body.trim()) add('body-missing', 'block', '缺少发布正文。');
  if (post.rights !== 'owned' && post.rights !== 'licensed') add('rights', 'block', '必须确认素材原创或已获授权，不能默认勾选。');
  if (post.aiUsed && !v.aiLabel) add('ai-label', 'block', '已声明使用生成式 AI，请确认平台 AI 内容标识（具体适用范围以平台规定为准）。');
  if (post.commercial && !v.commercialLabel) add('commercial-label', 'block', '商业推广内容需要确认广告/营销声明。');
  if (cfg.titleLimit && charLength(v.title) > cfg.titleLimit) {
    add('title-too-long', cfg.titlePolicy, '标题超出' + cfg.name + '配置阈值 ' + cfg.titleLimit + ' 字，请按平台实际编辑器核对。');
  }
  if (/(加我微信|微信联系|vx[:：]?[\w-]{4,}|私下交易|站外购买)/i.test(v.title + ' ' + v.body)) {
    add('off-platform', 'warn', '出现站外联系方式/交易引导，请人工核对平台营销规范。');
  }
  if (/(稳赚不赔|百分百有效|绝对安全|保过|躺赚|零风险|全网最低)/i.test(v.title + ' ' + v.body)) {
    add('absolute-claim', 'warn', '检测到绝对化/收益保证措辞；关键词命中仅是线索，需结合语境判断。');
  }
  if (/(治疗|治愈|处方|收益率|年化收益|包就业|保录取)/i.test(v.title + ' ' + v.body)) {
    add('regulated-claim', 'warn', '可能涉及医疗、金融或招聘效果声明，请核查证据、资质与适用规则。');
  }
  if (!post.mediaNames.length && cfg.type === 'video') {
    add('media-missing', 'warn', '未登记视频文件；正式发布前必须在官方页面亲自核对素材。');
  }
  if (Array.isArray(post.mediaInfo)) for (const item of post.mediaInfo) {
    if (item.width && item.height && Math.min(item.width, item.height) < 640)
      add('low-resolution', 'warn', '素材 '+item.name+' 的短边小于 640px；请在官方页面核对画质要求。');
    if (item.type === 'video' && item.duration && item.duration > 900)
      add('long-video', 'warn', '素材 '+item.name+' 超过 15 分钟；请按平台真实规格核对。');
  }
  if (v.plannedAt) {
    const planned = new Date(v.plannedAt);
    if (Number.isNaN(planned.getTime())) add('invalid-date', 'block', '计划时间无效。');
    else if (planned.getTime() < now.getTime()) add('past-date', 'warn', '计划时间早于现在；这里只记录计划，不会自动定时发布。');
  }
  const dupInPost = Object.entries(post.variants).some(([key, other]) =>
    key !== platform && normalizeText(other.body) && normalizeText(other.body) === normalizeText(v.body));
  if (dupInPost) add('same-content', 'warn', '不同平台正文完全相同，建议按平台受众重写开头与表达。');
  const dupOther = allPosts.some(other => other.id !== post.id &&
    Object.values(other.variants || {}).some(otherV =>
      normalizeText(otherV.body) && normalizeText(otherV.body) === normalizeText(v.body)));
  if (dupOther) add('duplicate-post', 'warn', '内容库已有相同正文，请确认不是重复发布。');
  if (/https?:\/\/\S+/i.test(v.body)) add('external-link', 'warn', '正文含外链，可能受平台展示与推广规则限制。');
  return issues;
}
export function canApprove(post, platform, allPosts = []) {
  const v = post.variants[platform];
  if (!v) return false;
  const issues = review(post, platform, allPosts);
  return !issues.some(i => i.severity === 'block') &&
    (!issues.some(i => i.severity === 'warn') || v.warningAcknowledged === true);
}
export function approve(post, platform, allPosts = [], reviewer = '人工审核') {
  if (!canApprove(post, platform, allPosts)) throw new Error('审核未通过或尚未确认提示项。');
  const v = post.variants[platform];
  v.publishChecks = { account: false, media: false, disclosures: false, visibility: false };
  v.approvedFingerprint = fingerprint(post, platform);
  v.approvedAt = new Date().toISOString();
  v.reviewer = String(reviewer || '人工审核').slice(0, 60);
  post.updatedAt = new Date().toISOString();
  return v.approvedFingerprint;
}
export function validPublishUrl(platform, raw) {
  if (!PLATFORMS[platform]) return false;
  try {
    const parsed = new URL(String(raw).trim());
    return parsed.protocol === 'https:' && PLATFORMS[platform].domains.some(
      domain => parsed.hostname === domain || parsed.hostname.endsWith('.' + domain));
  } catch { return false; }
}
export function confirmPublished(post, platform, url) {
  const v = post.variants[platform];
  if (!readyForManualPublish(post, platform)) throw new Error('请先完成有效人工审核和全部发布前核对项。');
  if (!validPublishUrl(platform, url)) throw new Error('请填写该平台真实的 HTTPS 作品链接。');
  v.publishedUrl = url.trim();
  v.publishedAt = new Date().toISOString();
  v.publishedFingerprint = fingerprint(post, platform);
  post.updatedAt = new Date().toISOString();
}
export function variantStatus(post, platform) {
  const v = post.variants[platform];
  if (!v) return '未准备';
  if (v.publishedUrl) return v.publishedFingerprint === fingerprint(post, platform) ? '已发布·人工登记' : '已发布·有新修改';
  if (isApproved(post, platform)) return finalChecklistDone(post, platform) ? '已核对·待手动发布' : '已审核·待最终核对';
  if (v.approvedFingerprint) return '修改后待复审';
  return '待审核';
}
export function auditEvent(state, type, label, detail = '') {
  state.audit.unshift({
    id: makeId(), at: new Date().toISOString(),
    type: String(type).slice(0, 50),
    label: String(label).slice(0, 180),
    detail: String(detail).slice(0, 500)
  });
  state.audit.length = Math.min(state.audit.length, MAX_EVENTS);
}
export function importState(value) {
  if (!value || typeof value !== 'object' || value.version !== DATA_VERSION || !Array.isArray(value.posts) || !Array.isArray(value.audit)) throw new Error('不是兼容的 FreePublish V1 数据。');
  if (value.posts.length > MAX_POSTS || value.audit.length > MAX_EVENTS) throw new Error('备份记录超过本地安全上限。');
  const cleanStr = (s, max = 50000) => typeof s === 'string' ? s.slice(0, max) : '';
  const seen = new Set();
  const posts = value.posts.map(raw => {
    if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || seen.has(raw.id)) throw new Error('内容 ID 缺失或重复。');
    seen.add(raw.id);
    const post = createPost(raw.id);
    post.title = cleanStr(raw.title, 500);
    post.source = cleanStr(raw.source);
    post.kind = ['video', 'image', 'text'].includes(raw.kind) ? raw.kind : 'text';
    post.mediaNames = Array.isArray(raw.mediaNames) ? raw.mediaNames.filter(x => typeof x === 'string').slice(0, 30).map(x => cleanStr(x, 200)) : [];
    post.mediaInfo = Array.isArray(raw.mediaInfo) ? raw.mediaInfo.slice(0, 30).filter(x => x && typeof x === 'object').map(x => ({
      name: cleanStr(x.name, 160), type: ['image','video'].includes(x.type) ? x.type : 'unknown',
      bytes: Number.isFinite(x.bytes) ? Math.max(0, Math.min(200000000, x.bytes)) : 0,
      width: Number.isFinite(x.width) ? Math.max(0, Math.min(100000, x.width)) : 0,
      height: Number.isFinite(x.height) ? Math.max(0, Math.min(100000, x.height)) : 0,
      duration: Number.isFinite(x.duration) ? Math.max(0, Math.min(86400, x.duration)) : 0,
      ratio: cleanStr(x.ratio, 60), orientation: cleanStr(x.orientation, 30)
    })) : [];
    post.rights = ['owned', 'licensed', 'unknown'].includes(raw.rights) ? raw.rights : 'unknown';
    post.aiUsed = raw.aiUsed === true;
    post.commercial = raw.commercial === true;
    post.createdAt = cleanStr(raw.createdAt, 50) || post.createdAt;
    post.updatedAt = cleanStr(raw.updatedAt, 50) || post.updatedAt;
    for (const [platform, old] of Object.entries(raw.variants || {})) {
      if (!PLATFORMS[platform] || !old || typeof old !== 'object') continue;
      const v = generateVariant(post, platform);
      for (const field of ['title', 'body', 'tags', 'plannedAt', 'approvedFingerprint', 'approvedAt', 'reviewer', 'publishedUrl', 'publishedAt', 'publishedFingerprint'])
        v[field] = cleanStr(old[field], field === 'body' ? 50000 : 1000);
      v.accountLabel = cleanStr(old.accountLabel, 120);
      v.aiLabel = old.aiLabel === true;
      v.commercialLabel = old.commercialLabel === true;
      v.warningAcknowledged = old.warningAcknowledged === true;
      v.publishChecks = { account: false, media: false, disclosures: false, visibility: false };
      // Never trust imported approvals/publication receipts as verified facts.
      v.approvedFingerprint = '';
      v.approvedAt = '';
      v.reviewer = '';
      v.publishedUrl = '';
      v.publishedAt = '';
      v.publishedFingerprint = '';
      post.variants[platform] = v;
    }
    return post;
  });
  return { version: DATA_VERSION, posts, audit: [] }; // import never replays untrusted audit events
}
export function exportState(state) {
  return JSON.stringify({ version: DATA_VERSION, posts: state.posts, audit: state.audit }, null, 2);
}
