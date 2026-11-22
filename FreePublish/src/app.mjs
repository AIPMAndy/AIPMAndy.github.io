import {
  PLATFORMS, DEFAULT_PLATFORMS, createPost, ensureVariants, generateVariant,
  emptyState, review, canApprove, approve, isApproved, confirmPublished,
  variantStatus, visibleTitle, importState, exportState, auditEvent,
  validPublishUrl, charLength, finalChecklistDone, readyForManualPublish
} from './core.mjs';
import { buildZip, safeFileName } from './zip.mjs';
import { inspectMedia, summarizeMedia } from './media.mjs';
import { exportCalendar } from './calendar.mjs';

const STORE_KEY = 'freepublish.v1';
const workspace = document.getElementById('workspace');
const toastNode = document.getElementById('toast');
const importInput = document.getElementById('import-file');
const views = new Set(['dashboard', 'library', 'review', 'calendar', 'logs', 'about']);
let state = readLocal();
let currentView = 'dashboard';
let selectedId = state.posts[0] ? state.posts[0].id : '';
let selectedPlatform = 'xiaohongshu';
let toastTimer;
const mediaFiles = new Map(); // File objects exist only in memory, never saved to localStorage.
const mediaPreviews = new Map(); // Blob URLs revoked on replacement or import.
function releasePreview(postId) {
  const url = mediaPreviews.get(postId);
  if (url) URL.revokeObjectURL(url);
  mediaPreviews.delete(postId); mediaFiles.delete(postId);
}

function readLocal() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return parsed && parsed.version === 1 && Array.isArray(parsed.posts) && Array.isArray(parsed.audit)
      ? parsed : emptyState();
  } catch { return emptyState(); }
}
function persist() {
  try { localStorage.setItem(STORE_KEY, exportState(state)); }
  catch { showToast('本地存储空间不足或被浏览器阻止，请先导出备份。'); }
}
function e(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function pName(key) { return PLATFORMS[key] ? PLATFORMS[key].name : key; }
function prettyTime(s) {
  if (!s) return '未设置';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '时间无效' : d.toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function showToast(message) {
  toastNode.textContent = message;
  toastNode.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { toastNode.classList.remove('show'); }, 3300);
}
function selectedPost() {
  const post = state.posts.find(function(x) { return x.id === selectedId; });
  return post || state.posts[0] || null;
}
function setView(view) {
  if (!views.has(view)) return;
  currentView = view;
  document.querySelectorAll('[data-view]').forEach(function(btn) {
    const active = btn.dataset.view === currentView;
    btn.classList.toggle('active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
  render();
}
function header(kicker, title, subtitle, actions = '') {
  return '<div class="page-head"><div><div class="eyebrow">' + e(kicker) + '</div>' +
    '<h1 class="page-title">' + e(title) + '</h1><p class="page-desc">' + e(subtitle) + '</p></div>' +
    (actions ? '<div class="page-action">' + actions + '</div>' : '') + '</div>';
}
function empty(title, caption, action = '', small = false) {
  return '<div class="empty' + (small ? ' small' : '') + '"><div class="empty-icon">◎</div><h3>' + e(title) +
    '</h3><p>' + e(caption) + '</p>' + action + '</div>';
}
function labelForStatus(status) {
  const style = status.startsWith('已发布') ? 'chip-positive' : status.startsWith('已审核') ? 'chip-dark' : status.includes('修改') ? 'chip-warn' : '';
  return '<span class="chip ' + style + '">' + e(status) + '</span>';
}
function stats() {
  let variants = 0, approved = 0, published = 0, waiting = 0;
  state.posts.forEach(function(post) {
    Object.keys(post.variants).forEach(function(platform) {
      variants++;
      if (isApproved(post, platform)) approved++;
      if (post.variants[platform].publishedUrl) published++;
      if (!isApproved(post, platform) && !post.variants[platform].publishedUrl) waiting++;
    });
  });
  return { variants, approved, published, waiting };
}
function stat(label, num, desc) {
  return '<div class="stat"><div class="stat-label">' + e(label) + '</div><div class="stat-value">' + num +
    '</div><div class="stat-foot">' + e(desc) + '</div></div>';
}
function allQueues() {
  return state.posts.flatMap(function(post) {
    return Object.keys(post.variants).filter(function(key) { return PLATFORMS[key]; })
      .map(function(platform) { return { post, platform }; });
  });
}
function renderDashboard() {
  const s = stats();
  const recent = state.posts.slice(0, 6);
  const contentRows = recent.map(function(post) {
    const count = Object.keys(post.variants).length;
    return '<div class="row-item"><div><div class="row-title">' + e(visibleTitle(post)) + '</div><div class="row-sub">' +
      e(prettyTime(post.updatedAt)) + ' · ' + count + ' 个平台版本</div></div>' +
      '<button class="btn btn-small" type="button" data-action="select-post" data-id="' + e(post.id) + '">编辑内容</button></div>';
  }).join('');
  return header('OVERVIEW', '从内容到发布，安全地完成每一步',
    '一个地方管理内容、平台版本、审核意见与人工发布凭据。所有内容保存在当前浏览器，默认不连接任何平台账号。',
    '<button class="btn btn-primary" data-action="new" type="button">＋ 创建内容</button>') +
    '<section class="stats-grid">' + stat('内容项目', state.posts.length, '原始素材卡片') +
    stat('平台版本', s.variants, '可分别编辑') + stat('审核通过', s.approved, '内容改动会失效') +
    stat('已发布登记', s.published, '人工回填链接') + '</section>' +
    '<div class="two-panels"><section class="panel"><div class="panel-head"><h2 class="panel-title">最近内容</h2>' +
    '<button class="text-link" data-action="go-library" type="button">查看全部</button></div>' +
    (contentRows || empty('从第一条内容开始', '创建素材后生成小红书、抖音、视频号和 B 站版本。', '<button class="btn btn-primary" data-action="new" type="button">创建内容</button> <button class="btn" data-action="demo" type="button">载入体验示例</button>')) +
    '</section><section class="panel"><div class="panel-head"><h2 class="panel-title">推荐工作流</h2><span class="panel-subtitle">Human in the loop</span></div>' +
    '<div class="panel-body three-steps">' +
    '<div class="step"><span class="step-number">01</span><div><b>统一建档，分别改稿</b><p>先输入原始内容，再生成平台草稿。标题和正文由你最终定稿。</p></div></div>' +
    '<div class="step"><span class="step-number">02</span><div><b>风险预检 + 人工审批</b><p>权属、AI 内容标识、商业推广、疑似敏感措辞与重复内容。</p></div></div>' +
    '<div class="step"><span class="step-number">03</span><div><b>打开官方入口，人工发布</b><p>复制文案、手动上传、确认设置，再回填真实作品链接。</p></div></div>' +
    '<div class="callout"><strong>当前模式：</strong>不接管登录态、不执行网页点击、不做后台自动发布。计划时间仅在本地工作台记录。</div>' +
    '</div></section></div>';
}
function postCard(post) {
  const count = Object.keys(post.variants).length;
  const selected = selectedPost() && selectedPost().id === post.id;
  return '<button class="content-card ' + (selected ? 'selected' : '') + '" data-action="select-post" data-id="' + e(post.id) + '" type="button">' +
    '<div class="content-title">' + e(visibleTitle(post)) + '</div><div class="content-meta">' +
    '<span>' + e(prettyTime(post.updatedAt)) + '</span><span>·</span><span>' + count + ' 个平台</span></div></button>';
}
function platformTabs(post) {
  return '<div class="platform-tabs">' + Object.keys(PLATFORMS).map(function(key) {
    const exists = !!post.variants[key];
    return '<button type="button" class="platform-tab ' + (selectedPlatform === key ? 'selected ' : '') +
      (!exists ? 'no-version' : '') + '" data-action="choose-platform" data-platform="' + key + '">' +
      e(pName(key)) + (exists ? '' : ' ＋') + '</button>';
  }).join('') + '</div>';
}
function renderMainEditor(post) {
  return '<section class="panel"><div class="panel-head"><h2 class="panel-title">01 · 原始内容</h2><span class="panel-subtitle">保存在本地</span></div>' +
    '<div class="panel-body">' +
    '<div class="field"><label for="post-title">内容标题</label><input id="post-title" data-scope="post" data-field="title" value="' + e(post.title) + '" placeholder="例如：不买会员，也能批量处理图片"><span class="field-hint">统一内容母版，不等于最终平台标题。</span></div>' +
    '<div class="field"><label for="post-source">原始内容 / 主稿</label><textarea id="post-source" class="long" data-scope="post" data-field="source" placeholder="粘贴视频文案、正文或脚本，随后生成各平台版本……">' + e(post.source) + '</textarea></div>' +
    '<div class="form-grid"><div class="field"><label for="post-kind">素材类型</label><select id="post-kind" data-scope="post" data-field="kind">' +
    ['video', 'image', 'text'].map(function(value) { return '<option value="' + value + '"' + (post.kind === value ? ' selected' : '') + '>' +
      { video: '视频', image: '图文', text: '纯文本' }[value] + '</option>'; }).join('') + '</select></div>' +
    '<div class="field"><label for="post-rights">素材权属</label><select id="post-rights" data-scope="post" data-field="rights">' +
    '<option value="unknown"' + (post.rights === 'unknown' ? ' selected' : '') + '>尚未确认</option>' +
    '<option value="owned"' + (post.rights === 'owned' ? ' selected' : '') + '>本人原创 / 自有素材</option>' +
    '<option value="licensed"' + (post.rights === 'licensed' ? ' selected' : '') + '>已取得授权 / 可合法使用</option></select></div></div>' +
    '<label class="checkbox-line"><input type="checkbox" data-scope="post" data-field="aiUsed"' + (post.aiUsed ? ' checked' : '') + '> 内容包含需按平台规定声明的 AI 生成/合成部分</label>' +
    '<label class="checkbox-line"><input type="checkbox" data-scope="post" data-field="commercial"' + (post.commercial ? ' checked' : '') + '> 内容属于广告、带货或商业推广</label>' +
    '<div class="field"><label for="media-files">本地媒体素材 · 画幅/时长预检</label><input id="media-files" type="file" accept="image/*,video/*,.mp4,.mov,.webm,.png,.jpg,.jpeg,.webp" multiple>' +
    '<div class="field-hint">文件只在本机浏览器临时读取，元数据保存在内容库，不会上传服务器；刷新页面后需要重新选择原文件才能打包。</div>' +
    '<div class="media-meta">' + (post.mediaInfo?.length ? post.mediaInfo.map(function(item) { return '<div class="media-item">' + e(summarizeMedia(item)) + '</div>'; }).join('') : (post.mediaNames.length ? e(post.mediaNames.join(' · ')) : '尚未选择媒体，可先编辑纯文本。')) + '</div>' +
    (post.mediaNames.length && !mediaFiles.has(post.id) ? '<div class="callout warn">历史文件名还在，但文件本体不会保留。导出带媒体的 ZIP 前请重新选择素材。</div>' : '') +
    '</div>' +
    '<div class="btn-group"><button type="button" class="btn btn-primary" data-action="generate-all">生成四大平台初稿</button>' +
    '<button type="button" class="btn" data-action="save">保存修改</button>' +
    '<button type="button" class="btn btn-danger" data-action="delete">删除这条内容</button></div></div></section>';
}
function renderVariantEditor(post) {
  const v = post.variants[selectedPlatform];
  if (!v) return '<section class="panel"><div class="panel-head"><h2 class="panel-title">02 · 平台版本</h2></div><div class="panel-body">' +
    platformTabs(post) + empty('还没有这个平台的草稿', '可单独创建，或一键生成四个国内平台初稿。', '<button class="btn btn-primary" type="button" data-action="add-platform">创建' + e(pName(selectedPlatform)) + '版本</button>', true) + '</div></section>';
  const cfg = PLATFORMS[selectedPlatform];
  const status = variantStatus(post, selectedPlatform);
  return '<section class="panel"><div class="panel-head"><h2 class="panel-title">02 · 平台适配</h2>' + labelForStatus(status) + '</div><div class="panel-body">' +
    platformTabs(post) + '<hr class="group-divider">' +
    '<div class="field"><label for="variant-title">平台标题 ' + (cfg.titleLimit ? '· 当前 ' + charLength(v.title) + '/' + cfg.titleLimit + ' 字' : '') + '</label>' +
    '<input id="variant-title" data-scope="variant" data-field="title" value="' + e(v.title) + '" placeholder="针对该平台重写标题">' +
    '<span class="field-hint">字数阈值是本地预检规则，正式要求以官方创作页面为准。</span></div>' +
    '<div class="field"><label for="variant-body">平台正文</label><textarea id="variant-body" class="long" data-scope="variant" data-field="body" placeholder="根据平台用户习惯重写开头、表达和 CTA">' + e(v.body) + '</textarea></div>' +
    '<div class="field"><label for="variant-tags">话题标签</label><input id="variant-tags" data-scope="variant" data-field="tags" value="' + e(v.tags) + '" placeholder="#AI工具 #内容创作"></div>' +
    '<div class="field"><label for="variant-account">目标账号备注（仅填写昵称，不要填密码）</label><input id="variant-account" data-scope="variant" data-field="accountLabel" value="' + e(v.accountLabel || '') + '" placeholder="例如：醒觉官方号 @example">' +
    '<span class="field-hint">审批后修改目标账号将触发重新审核。</span></div>' +
    '<div class="field"><label for="variant-plan">计划发布时间（仅本地提醒信息）</label><input id="variant-plan" type="datetime-local" data-scope="variant" data-field="plannedAt" value="' + e(v.plannedAt) + '">' +
    '<span class="field-hint">此字段不会调用平台定时接口，也不会自动发送。需在平台官方页面自行设置定时。</span></div>' +
    '<label class="checkbox-line"><input type="checkbox" data-scope="variant" data-field="aiLabel"' + (v.aiLabel ? ' checked' : '') +
    '> 我已确认该平台的 AI 生成内容标识要求及发布时应选的标注</label>' +
    '<label class="checkbox-line"><input type="checkbox" data-scope="variant" data-field="commercialLabel"' + (v.commercialLabel ? ' checked' : '') +
    '> 我已确认该平台的广告/营销声明要求</label>' +
    '<hr class="group-divider"><div class="field-label" style="margin-bottom:12px">发布内容预览 <span class="panel-subtitle">· 文字模拟，非平台真实渲染</span></div>' +
    '<div class="preview-wrap"><div class="preview-phone"><div class="preview-top">' + e(pName(selectedPlatform)) + ' · 内容预览</div>' +
    '<div class="preview-media">' +
    (mediaPreviews.has(post.id) ? (post.mediaInfo?.[0]?.type === 'video' ?
      '<video controls preload="metadata" playsinline src="' + e(mediaPreviews.get(post.id)) + '"></video>' :
      '<img loading="lazy" alt="本地图片预览" src="' + e(mediaPreviews.get(post.id)) + '">') :
      (post.mediaNames.length ? e(post.mediaNames.join(' · ')) + '（重新选择文件才能预览）' : '媒体需在官方页面手动上传')) +
    '</div>' +
    '<div class="preview-copy"><b>' + e(v.title || '待填写标题') + '</b><p>' + e(v.body || '待填写正文') + '</p>' +
    '<span>' + e(v.tags) + '</span></div></div></div>' +
    '<hr class="group-divider"><div class="btn-group"><button class="btn btn-primary" data-action="go-review" type="button">进入安全审核 →</button>' +
    '<button class="btn" data-action="save" type="button">保存版本</button></div><p class="fine-print">保存或编辑后，旧审核状态将自动失效。AI/广告勾选是人工检查记录，并不会替你操作平台设置。</p></div></section>';
}
function renderLibrary() {
  const post = selectedPost();
  if (post && !state.posts.some(function(p) { return p.id === selectedId; })) selectedId = post.id;
  return header('CONTENT LIBRARY', '内容库', '整理一份主稿，分别编辑每个平台要发布的版本；初稿生成不使用第三方 AI 服务。') +
    '<div class="editor-layout"><div class="stack"><section class="panel list-panel">' +
    '<div class="panel-head"><h2 class="panel-title">所有内容</h2><button class="btn btn-small" data-action="new" type="button">＋ 新建</button></div>' +
    (state.posts.length ? state.posts.map(postCard).join('') : empty('内容库还是空的', '从一份文案或视频脚本开始。', '<button class="btn btn-primary" data-action="new" type="button">创建内容</button>', true)) +
    '</section><div class="callout"><strong>本地优先：</strong>浏览器仅存储文字、文件名和状态。请定期导出 JSON 备份，避免清理浏览器数据后丢失。</div></div>' +
    '<div class="stack">' + (post ? renderMainEditor(post) + renderVariantEditor(post) :
      '<section class="panel">' + empty('先选择或创建内容', '创建后才能生成平台版本。') + '</section>') +
    '</div></div>';
}
function issueMarkup(issues) {
  if (!issues.length) return '<div class="issue good"><span class="issue-symbol">✓</span><span>没有发现预设规则风险。仍需人工确认事实、版权、平台要求和素材预览。</span></div>';
  return issues.map(function(issue) {
    return '<div class="issue ' + (issue.severity === 'block' ? 'block' : 'warn') + '">' +
      '<span class="issue-symbol">' + (issue.severity === 'block' ? '×' : '!') + '</span><div>' +
      e(issue.message) + '</div></div>';
  }).join('');
}
function renderReviewDetail(post, platform) {
  const v = post.variants[platform];
  const issues = review(post, platform, state.posts);
  const blockers = issues.filter(function(i) { return i.severity === 'block'; }).length;
  const warnings = issues.filter(function(i) { return i.severity === 'warn'; }).length;
  const approved = isApproved(post, platform);
  const prepared = readyForManualPublish(post, platform);
  const checks = v.publishChecks || {};
  const status = variantStatus(post, platform);
  const ready = canApprove(post, platform, state.posts);
  const receipt = v.publishedUrl && validPublishUrl(platform, v.publishedUrl)
    ? '<a href="' + e(v.publishedUrl) + '" target="_blank" rel="noopener noreferrer" class="text-link">查看登记的作品链接 ↗</a>' : '';
  return '<div class="stack"><section class="panel"><div class="panel-head"><h2 class="panel-title">发布前审查 · ' + e(pName(platform)) + '</h2>' + labelForStatus(status) +
    '</div><div class="panel-body"><div class="row-title" style="font-size:18px">' + e(v.title || visibleTitle(post)) + '</div>' +
    '<div class="summary-tags"><span class="chip">' + blockers + ' 个阻断项</span><span class="chip">' + warnings + ' 个需人工判断项</span>' +
    '<span class="chip">' + e(post.kind === 'video' ? '视频' : post.kind === 'image' ? '图文' : '文本') + '</span></div>' +
    '<hr class="group-divider"><div class="issue-list">' + issueMarkup(issues) + '</div>' +
    (warnings ? '<label class="checkbox-line"><input type="checkbox" data-scope="variant" data-field="warningAcknowledged"' +
      (v.warningAcknowledged ? ' checked' : '') + '> 我已逐条核查上述提示的语境、事实、素材与平台规则，接受剩余风险。</label>' : '') +
    '<div class="btn-group"><button class="btn btn-primary" data-action="approve" type="button"' + (ready ? '' : ' disabled') +
    '>人工审核通过</button><button class="btn" data-action="edit-selected" type="button">返回编辑</button></div>' +
    '<p class="fine-print">审核需明确的人为确认；不会自动提交到任何平台。批准后如标题、正文、素材声明或计划变化，批准立即失效。</p></div></section>' +
    '<section class="panel"><div class="panel-head"><h2 class="panel-title">人工发布助手</h2><span class="panel-subtitle">不操作账号</span></div><div class="panel-body">' +
    (approved ? '<div class="callout"><strong>审核已通过。</strong>下面只会复制文字或打开官方创作中心。请你亲自检查登录账号、素材、可见范围、AI/商业声明和定时设置，并点击最终发布。</div>' :
      '<div class="callout warn"><strong>未获有效审核。</strong>请先完成预检并明确点击「人工审核通过」。修改内容也会触发重新审核。</div>') +
    (approved ? '<div class="final-checks"><div class="field-label">最后一步 · 请逐项人工核对</div>' +
      [
        ['account','我已在官方页面核对登录账号' + (v.accountLabel ? '（预期：' + e(v.accountLabel) + '）' : '')],
        ['media','我已核对原始素材、封面、字幕、音频与授权'],
        ['disclosures','我已核对 AI/广告/原创等必要标识'],
        ['visibility','我已核对可见范围、定时与最终预览']
      ].map(function(item) { return '<label class="checkbox-line"><input type="checkbox" data-scope="publish-check" data-field="' + item[0] + '"' + (checks[item[0]] ? ' checked' : '') + '> ' + item[1] + '</label>'; }).join('') +
      '</div>' : '') +
    '<div class="review-actions" style="margin-top:15px">' +
    '<button class="btn" data-action="copy-title" type="button"' + (approved ? '' : ' disabled') + '>复制标题</button>' +
    '<button class="btn" data-action="copy-body" type="button"' + (approved ? '' : ' disabled') + '>复制正文和话题</button>' +
    '<button class="btn" data-action="download-package" type="button"' + (approved ? '' : ' disabled') + '>下载发布说明</button>' +
    '<button class="btn" data-action="download-package-zip" type="button"' + (approved ? '' : ' disabled') + '>打包 ZIP（含已选素材）</button>' +
    '<button class="btn btn-primary" data-action="open-platform" type="button"' + (prepared ? '' : ' disabled') + '>打开官方创作中心 ↗</button></div>' +
    '<div class="receipt"><div class="field"><label for="receipt-url">发布后回填作品链接</label>' +
    '<input class="text-input" type="url" id="receipt-url" placeholder="https://…… 真实作品链接" aria-describedby="receipt-hint">' +
    '<span class="field-hint" id="receipt-hint">只验证 URL 所属域名，不爬取平台、不验证作品是否真的公开。</span></div>' +
    '<div class="btn-group"><button class="btn btn-primary" data-action="confirm-published" type="button"' + (prepared ? '' : ' disabled') +
    '>我已在平台发布，登记结果</button>' + receipt + '</div></div></div></section></div>';
}
function renderReview() {
  const queues = allQueues();
  const selected = selectedPost();
  let active = selected && selected.variants[selectedPlatform] ? { post: selected, platform: selectedPlatform } : queues[0];
  if (active) { selectedId = active.post.id; selectedPlatform = active.platform; }
  return header('REVIEW GATE', '审核与发布', '预检只是风险线索；每个版本都必须经过人工审核，最终发布只在官方页面由你亲自执行。') +
    '<div class="review-grid"><section class="panel"><div class="panel-head"><h2 class="panel-title">发布队列</h2><span class="panel-subtitle">' +
    queues.length + ' 个版本</span></div>' +
    (queues.length ? queues.map(function(x) {
      const activeItem = active.post.id === x.post.id && active.platform === x.platform;
      return '<button class="queue-item ' + (activeItem ? 'selected' : '') + '" type="button" data-action="select-queue" data-id="' + e(x.post.id) +
        '" data-platform="' + e(x.platform) + '"><div class="row-title">' + e(visibleTitle(x.post)) + '</div><div class="content-meta"><span>' +
        e(pName(x.platform)) + '</span><span>·</span><span>' + e(variantStatus(x.post, x.platform)) +
        '</span></div></button>';
    }).join('') : empty('还没有待发布版本', '先去内容库生成平台草稿。', '<button class="btn" data-action="go-library" type="button">前往内容库</button>', true)) +
    '</section>' + (active ? renderReviewDetail(active.post, active.platform) :
      '<section class="panel">' + empty('发布从审核开始', '准备内容后，此处会显示逐平台审核清单。') + '</section>') + '</div>';
}
function renderCalendar() {
  const planned = allQueues().filter(function(x) { return !!x.post.variants[x.platform].plannedAt; })
    .sort(function(a,b) { return new Date(a.post.variants[a.platform].plannedAt) - new Date(b.post.variants[b.platform].plannedAt); });
  const rows = planned.map(function(x) {
    const v = x.post.variants[x.platform];
    return '<tr><td><b>' + e(prettyTime(v.plannedAt)) + '</b></td><td>' + e(visibleTitle(x.post)) + '</td><td>' +
      e(pName(x.platform)) + '</td><td>' + labelForStatus(variantStatus(x.post, x.platform)) +
      '</td><td><button class="btn btn-small" data-action="select-queue" data-id="' + e(x.post.id) +
      '" data-platform="' + e(x.platform) + '" type="button">查看审核</button></td></tr>';
  }).join('');
  return header('PLANNING', '发布计划', '这是内容制作排期表，不是平台定时发布器。要真正定时，请到官方创作中心亲自设置。','<button class="btn btn-primary" type="button" data-action="export-ics">导出日历提醒 .ics</button>') +
    '<div class="callout warn" style="margin-bottom:18px"><strong>重要：</strong>计划时间只存于浏览器。即使你关机、离线或关闭网页，这里都不会向任何平台发送内容或定时任务。</div>' +
    '<section class="panel"><div class="panel-head"><h2 class="panel-title">计划中的发布</h2><span class="panel-subtitle">' +
    planned.length + ' 个平台版本</span></div>' +
    (planned.length ? '<div class="table-wrap"><table><thead><tr><th>计划时间</th><th>内容</th><th>平台</th><th>状态</th><th>操作</th></tr></thead><tbody>' +
      rows + '</tbody></table></div>' : empty('暂无排期', '到内容库给各平台版本设置计划时间。')) + '</section>';
}
function renderLogs() {
  const rows = state.audit.slice(0, 100).map(function(item) {
    return '<tr><td>' + e(prettyTime(item.at)) + '</td><td>' + e(item.type) + '</td><td><b>' +
      e(item.label) + '</b><div class="row-sub">' + e(item.detail || '') + '</div></td></tr>';
  }).join('');
  return header('AUDIT LOG', '操作记录', '记录重要人工动作及版本变化。本地日志可以被清理或修改，不能代替企业级不可抵赖审计。') +
    '<section class="panel"><div class="panel-head"><h2 class="panel-title">最近操作</h2><span class="panel-subtitle">最多保留 3000 条记录</span></div>' +
    (rows ? '<div class="table-wrap"><table><thead><tr><th>时间</th><th>操作</th><th>详细信息</th></tr></thead><tbody>' +
      rows + '</tbody></table></div>' : empty('还没有操作记录', '新建、审核、发布结果登记会自动记录在这里。')) + '</section>';
}
function renderAbout() {
  return header('SAFETY BY DESIGN', '安全原则与使用说明', 'FreePublish 的价值是减少重复劳动，同时把高风险和不可逆动作留给人。') +
    '<div class="two-panels"><section class="panel"><div class="panel-head"><h2 class="panel-title">它能做什么</h2></div><div class="panel-body three-steps">' +
    '<div class="step"><span class="step-number">✓</span><div><b>多平台初稿</b><p>一次建档，按配置生成各平台标题、正文和话题初稿，然后人工编辑。</p></div></div>' +
    '<div class="step"><span class="step-number">✓</span><div><b>阻断与提醒</b><p>版权归属、AI 标识、营销声明、长度、潜在敏感词和重复内容预检。</p></div></div>' +
    '<div class="step"><span class="step-number">✓</span><div><b>人工审核与留痕</b><p>内容修订后旧审批失效；登记人工确认的作品链接。</p></div></div>' +
    '<div class="step"><span class="step-number">✓</span><div><b>本地数据与备份</b><p>不需要平台账号密码或服务端数据库，可导出/导入 JSON。</p></div></div>' +
    '</div></section><section class="panel"><div class="panel-head"><h2 class="panel-title">它不会做什么</h2></div><div class="panel-body three-steps">' +
    '<div class="step"><span class="step-number">×</span><div><b>不代发、不模拟真人</b><p>不读取 Cookie，不注入 DOM，不让脚本替你点击、提交、点赞、私信。</p></div></div>' +
    '<div class="step"><span class="step-number">×</span><div><b>不自动运行排期</b><p>所填计划时间仅作为工作台记录，平台定时必须使用官方能力。</p></div></div>' +
    '<div class="step"><span class="step-number">×</span><div><b>不担保过审与不限流</b><p>规则可能调整，人工审批也不能替代平台审核或法律判断。</p></div></div>' +
    '<div class="step"><span class="step-number">×</span><div><b>不保存真实媒体文件</b><p>只保留名称和内容文字，上传时从自己的电脑选择素材。</p></div></div>' +
    '</div></section></div><div class="callout" style="margin-top:18px"><strong>备份提醒：</strong>导入将替换当前库，且出于安全原因，会清空导入数据中的旧审批及“已发布”标记。请重新审核、确认。完整实现、测试与路线图见 GitHub 的 docs/ARCHITECTURE.md。</div>';
}
function render() {
  const renderers = { dashboard: renderDashboard, library: renderLibrary, review: renderReview, calendar: renderCalendar, logs: renderLogs, about: renderAbout };
  workspace.innerHTML = renderers[currentView]();
}
function touch(post, contentChanged = true) {
  if (contentChanged) post.revision = (post.revision || 0) + 1;
  post.updatedAt = new Date().toISOString();
  persist();
}
function requirePost() {
  const post = selectedPost();
  if (!post) throw new Error('请先创建内容。');
  return post;
}
function requireApproved(post, platform) {
  if (!isApproved(post, platform)) throw new Error('版本尚未获有效的人工审核，请先审核。');
}
function download(name, text, type) {
  return downloadBlob(name, new Blob([text], { type: type || 'text/plain;charset=utf-8' }));
}
function downloadBlob(name, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
}
async function copyText(value) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      const element = document.createElement('textarea');
      element.value = value; element.style.position = 'fixed'; element.style.opacity = '0';
      document.body.appendChild(element);
      element.focus(); element.select();
      if (!document.execCommand('copy')) throw new Error('复制失败');
      element.remove();
    }
    showToast('已复制到剪贴板。请在官方平台亲自检查并粘贴。');
  } catch {
    showToast('浏览器无法复制，请手动选择编辑器中的文字。');
  }
}
function packageText(post, platform) {
  const v = post.variants[platform];
  return [
    'FreePublish · 人工发布说明（不是平台上传结果）',
    '内容：' + visibleTitle(post),
    '平台：' + pName(platform),
    '审核时间：' + v.approvedAt,
    '计划时间：' + (v.plannedAt || '未设置，平台定时需手动设置'),
    '目标账号备注：' + (v.accountLabel || '未填写'),
    '本地素材文件名：' + (post.mediaNames.join(', ') || '未登记'),
    '平台标题：', v.title, '平台正文：', v.body,
    '话题：', v.tags, '',
    '发布前人工核对：',
    '□ 当前登录的真实平台账号',
    '□ 视频/图片与封面、字幕、音频均正确',
    '□ 素材权利和授权证明',
    '□ AI 生成内容及商业推广声明',
    '□ 可见范围、原创声明及计划发布时间',
    '□ 点击官方平台的发布按钮后，回填作品链接',
    '',
    '官方入口：' + PLATFORMS[platform].url,
    '注意：此文件不构成自动发布、平台许可或平台审核结果。'
  ].join('\n');
}
function demo() {
  const post = createPost();
  post.title = '如何用开源工具做好内容生产';
  post.source = '这是一条演示文案，用来体验 FreePublish 的安全发布工作流。\n\n先准备内容，再针对不同平台重写开头、封面与表达，完成预检后由本人在官方创作中心发布。';
  post.kind = 'text';
  post.rights = 'unknown'; // example must not be pre-approved
  ensureVariants(post);
  state.posts.unshift(post);
  selectedId = post.id;
  auditEvent(state, '创建示例', post.title, '演示数据；不是实际已发布作品。');
  persist(); setView('library'); showToast('已创建示例。请核对权属，并自行编辑平台版本。');
}
async function action(name, dataset) {
  const post = selectedPost();
  if (name === 'new') {
    const item = createPost();
    state.posts.unshift(item); selectedId = item.id; selectedPlatform = 'xiaohongshu';
    auditEvent(state, '新建内容', '新增空白素材卡');
    persist(); setView('library'); return;
  }
  if (name === 'demo') { demo(); return; }
  if (name === 'backup') {
    download('FreePublish-backup-' + new Date().toISOString().slice(0, 10) + '.json', exportState(state), 'application/json;charset=utf-8');
    auditEvent(state, '导出备份', 'JSON 内容库备份'); persist();
    showToast('已下载本地 JSON 备份。'); return;
  }
  if (name === 'import') { importInput.click(); return; }
  if (name === 'go-library') { setView('library'); return; }
  if (name === 'go-review') { setView('review'); return; }
  if (name === 'select-post') {
    selectedId = dataset.id; selectedPlatform = 'xiaohongshu'; setView('library'); return;
  }
  if (name === 'choose-platform') {
    selectedPlatform = dataset.platform; render(); return;
  }
  if (name === 'select-queue') {
    selectedId = dataset.id; selectedPlatform = dataset.platform; setView('review'); return;
  }
  if (name === 'edit-selected') { setView('library'); return; }
  if (name === 'delete') {
    const item = requirePost();
    if (!confirm('确定删除「' + visibleTitle(item) + '」及所有平台版本？此操作不能撤销，请先导出备份。')) return;
    releasePreview(item.id);
    state.posts = state.posts.filter(function(x) { return x.id !== item.id; });
    auditEvent(state, '删除内容', visibleTitle(item));
    selectedId = state.posts[0] ? state.posts[0].id : '';
    persist(); render(); showToast('内容已从本机库中删除。'); return;
  }
  if (name === 'generate-all') {
    const item = requirePost();
    if (!item.title.trim() || !item.source.trim()) throw new Error('请先填写主标题和原始文案。');
    const count = ensureVariants(item, DEFAULT_PLATFORMS);
    auditEvent(state, '生成平台版本', visibleTitle(item), '创建 ' + count + ' 个新版本；现有版本不会被覆盖。');
    touch(item); render(); showToast(count ? '已创建 ' + count + ' 个平台初稿，请分别审核修改。' : '四大平台版本已存在，没有覆盖手工修改。'); return;
  }
  if (name === 'add-platform') {
    const item = requirePost();
    if (!item.title.trim() || !item.source.trim()) throw new Error('请先填写主标题和原始文案。');
    if (!item.variants[selectedPlatform]) item.variants[selectedPlatform] = generateVariant(item, selectedPlatform);
    auditEvent(state, '新增平台版本', visibleTitle(item), pName(selectedPlatform));
    touch(item); render(); return;
  }
  if (name === 'save') {
    const item = requirePost();
    auditEvent(state, '人工保存', visibleTitle(item), '保存当前内容与平台版本。');
    touch(item, false); render(); showToast('已保存在当前浏览器。'); return;
  }
  if (name === 'approve') {
    const item = requirePost();
    approve(item, selectedPlatform, state.posts);
    auditEvent(state, '人工审核通过', visibleTitle(item), pName(selectedPlatform));
    persist(); render(); showToast('审核完成。后续任何内容修改都会让审核失效。'); return;
  }
  if (name === 'copy-title' || name === 'copy-body') {
    const item = requirePost();
    requireApproved(item, selectedPlatform);
    const v = item.variants[selectedPlatform];
    await copyText(name === 'copy-title' ? v.title : v.body + (v.tags && !v.body.includes(v.tags) ? '\n\n' + v.tags : ''));
    return;
  }
  if (name === 'download-package') {
    const item = requirePost(); requireApproved(item, selectedPlatform);
    download('FreePublish-' + selectedPlatform + '-' + item.id.slice(0, 8) + '.txt', packageText(item, selectedPlatform));
    showToast('发布说明已下载，媒体文件仍需手动选择。'); return;
  }
  if (name === 'export-ics') {
    const result = exportCalendar(state.posts, PLATFORMS);
    if (!result.count) throw new Error('请先在内容库为平台版本设置计划发布时间。');
    download('FreePublish-发布提醒.ics', result.contents, 'text/calendar;charset=utf-8');
    showToast('已导出 ' + result.count + ' 个日历提醒；日历不会替你发帖。'); return;
  }
  if (name === 'download-package-zip') {
    const item = requirePost(); requireApproved(item, selectedPlatform);
    const files = mediaFiles.get(item.id) || [];
    if (item.mediaNames.length && !files.length) throw new Error('请先在内容库重新选择本地素材，才能打包真实媒体文件。');
    const entries = [
      { name: '发布说明.txt', data: packageText(item, selectedPlatform) },
      { name: '标题.txt', data: item.variants[selectedPlatform].title },
      { name: '正文.txt', data: item.variants[selectedPlatform].body }
    ];
    for (let i = 0; i < files.length; i++) entries.push({ name: '素材-' + (i + 1) + '-' + safeFileName(files[i].name), data: files[i] });
    const zipBlob = await buildZip(entries);
    downloadBlob('FreePublish-' + selectedPlatform + '-' + item.id.slice(0,8) + '.zip', zipBlob);
    auditEvent(state, '导出本地发布包', visibleTitle(item), pName(selectedPlatform) + ' · ' + files.length + ' 个媒体文件（未上传）');
    persist(); showToast('已在本地生成 ZIP。仍须人工在平台上传和发布。'); return;
  }
  if (name === 'open-platform') {
    const item = requirePost();
    if (!readyForManualPublish(item, selectedPlatform)) throw new Error('请先完成四项最终发布前核对。');
    window.open(PLATFORMS[selectedPlatform].url, '_blank', 'noopener,noreferrer');
    auditEvent(state, '打开官方入口', visibleTitle(item), pName(selectedPlatform) + ' · 不自动提交');
    persist(); showToast('已请求打开官方创作页面，最终发布需本人完成。'); return;
  }
  if (name === 'confirm-published') {
    const item = requirePost();
    const receipt = document.getElementById('receipt-url');
    confirmPublished(item, selectedPlatform, receipt ? receipt.value : '');
    auditEvent(state, '人工登记发布', visibleTitle(item), pName(selectedPlatform) + ' · 用户填写作品链接，平台状态未经独立验证');
    persist(); render(); showToast('已记录用户提供的作品链接（未向平台验证）。'); return;
  }
}
document.addEventListener('click', function(event) {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) { setView(viewButton.dataset.view); return; }
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  // Call synchronously inside the user gesture: window.open would otherwise be popup-blocked.
  action(button.dataset.action, button.dataset)
    .catch(function(error) { showToast(error && error.message ? error.message : '操作失败，请检查内容。'); });
});
document.addEventListener('input', function(event) {
  const input = event.target;
  if (!input.dataset || !input.dataset.field || !input.dataset.scope || input.type === 'checkbox') return;
  const post = selectedPost();
  if (!post) return;
  const obj = input.dataset.scope === 'post' ? post : post.variants[selectedPlatform];
  if (!obj) return;
  obj[input.dataset.field] = input.value;
  touch(post);
  if (input.id === 'variant-title') {
    const label = input.closest('.field').querySelector('label');
    const cfg = PLATFORMS[selectedPlatform];
    if (label) label.textContent = '平台标题 ' + (cfg.titleLimit ? '· 当前 ' + charLength(input.value) + '/' + cfg.titleLimit + ' 字' : '');
  }
});
document.addEventListener('change', function(event) {
  const input = event.target;
  if (!input.dataset || !input.dataset.field || !input.dataset.scope) {
    if (input.id === 'media-files') {
      const post = selectedPost();
      if (!post) return;
      const files = Array.from(input.files || []).slice(0, 30);
      if (!files.length) return;
      Promise.all(files.map(inspectMedia)).then(function(infos) {
        releasePreview(post.id);
        mediaFiles.set(post.id, files);
        mediaPreviews.set(post.id, URL.createObjectURL(files[0]));
        post.mediaNames = files.map(function(file) { return file.name; });
        post.mediaInfo = infos;
        auditEvent(state, '本地素材检测', visibleTitle(post), infos.length + ' 个文件，未上传服务器');
        touch(post); render(); showToast('素材规格已在本地读取。刷新页面后需重新选择原文件。');
      }).catch(function(error) { showToast(error.message || '读取素材失败。'); });
    }
    return;
  }
  // Text fields were already saved by the input event. A blur/change event must
  // not re-render the editor: replacing a focused textarea can discard typed text.
  if (input.type !== 'checkbox' && input.tagName !== 'SELECT' && input.type !== 'datetime-local') return;
  const post = selectedPost();
  if (!post) return;
  if (input.dataset.scope === 'publish-check') {
    if (!isApproved(post, selectedPlatform)) return;
    const v = post.variants[selectedPlatform];
    v.publishChecks ||= { account:false, media:false, disclosures:false, visibility:false };
    if (['account','media','disclosures','visibility'].includes(input.dataset.field)) v.publishChecks[input.dataset.field] = input.checked;
    persist(); render(); return;
  }
  const obj = input.dataset.scope === 'post' ? post : post.variants[selectedPlatform];
  if (!obj) return;
  obj[input.dataset.field] = input.type === 'checkbox' ? input.checked : input.value;
  touch(post); render();
});
importInput.addEventListener('change', async function() {
  const file = importInput.files && importInput.files[0];
  importInput.value = '';
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('备份超过 2MB，请拆分后导入。'); return; }
  try {
    const incoming = importState(JSON.parse(await file.text()));
    if (!confirm('导入将替换此浏览器中的整个内容库，同时清空导入数据的审批/发布状态。确定吗？请先导出旧库备份。')) return;
    for (const id of mediaPreviews.keys()) releasePreview(id);
    state = incoming;
    selectedId = state.posts[0] ? state.posts[0].id : '';
    selectedPlatform = 'xiaohongshu';
    auditEvent(state, '导入备份', '已导入 ' + state.posts.length + ' 条内容', '为安全起见，导入版本需重新审批');
    persist(); setView('library'); showToast('导入完成。请重新检查内容并完成审核。');
  } catch (error) { showToast(error.message || '导入失败，备份格式不正确。'); }
});
document.addEventListener('keydown', function(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    const post = selectedPost();
    if (post) { touch(post, false); showToast('本地已保存。'); }
  }
});
render();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('./sw.js').catch(function() { /* offline support is optional */ });
}
