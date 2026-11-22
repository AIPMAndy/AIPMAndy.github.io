/**
 * Browser-local media inspection. Does not upload, persist or transcode media.
 * Metadata is descriptive: platform limits are always subject to official UI.
 */
const MAX_SIZE = 180 * 1024 * 1024;
function maybeType(file) {
  const mime = String(file.type || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  const ext = String(file.name || '').split('.').pop().toLowerCase();
  if (['jpg','jpeg','png','webp','gif','heic','avif'].includes(ext)) return 'image';
  if (['mp4','mov','webm','m4v'].includes(ext)) return 'video';
  return 'unsupported';
}
export function validateMedia(file) {
  if (!file || typeof file.name !== 'string' || typeof file.size !== 'number')
    throw new Error('无效的素材文件。');
  if (file.size === 0) throw new Error('不接受空文件：' + file.name);
  if (file.size > MAX_SIZE) throw new Error('单个素材超过 180MB 当前浏览器处理上限：' + file.name);
  const kind = maybeType(file);
  if (kind === 'unsupported') throw new Error('暂不支持此素材类型：' + file.name);
  return kind;
}
export function orientation(width, height) {
  if (!width || !height) return 'unknown';
  if (width > height * 1.07) return 'landscape';
  if (height > width * 1.07) return 'portrait';
  return 'square';
}
export function ratioLabel(width, height) {
  if (!width || !height) return '比例未知';
  const ratio = width / height;
  for (const [r, label] of [
    [9/16,'9:16 竖版'],[3/4,'3:4 竖版'],[1,'1:1 方形'],[4/3,'4:3 横版'],[16/9,'16:9 横版']
  ]) if (Math.abs(ratio - r) < 0.055) return label;
  return width + ':' + height;
}
function waitForMeta(kind, url) {
  return new Promise((resolve, reject) => {
    const el = kind === 'image' ? new Image() : document.createElement('video');
    let done = false;
    let timer;
    const finish = (err, data) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      el.onload = null; el.onerror = null;
      el.onloadedmetadata = null;
      if (kind === 'video') { el.removeAttribute('src'); el.load(); }
      err ? reject(err) : resolve(data);
    };
    timer = setTimeout(() => finish(new Error('媒体元数据读取超时。')), 11000);
    el.onerror = () => finish(new Error('无法读取素材元数据，可仅记录文件名。'));
    if (kind === 'image') {
      el.onload = () => finish(null, { width: el.naturalWidth, height: el.naturalHeight, duration: 0 });
    } else {
      el.preload = 'metadata';
      el.onloadedmetadata = () => finish(null, {
        width: el.videoWidth, height: el.videoHeight,
        duration: Number.isFinite(el.duration) ? Number(el.duration.toFixed(1)) : 0
      });
    }
    el.src = url;
  });
}
export async function inspectMedia(file) {
  const kind = validateMedia(file);
  const url = URL.createObjectURL(file);
  try {
    let props = { width: 0, height: 0, duration: 0 };
    try { props = await waitForMeta(kind, url); }
    catch { /* never block manual fallback when browser codec is unavailable */ }
    return {
      name: file.name.slice(0, 160),
      type: kind,
      bytes: file.size,
      width: props.width,
      height: props.height,
      duration: props.duration,
      ratio: ratioLabel(props.width, props.height),
      orientation: orientation(props.width, props.height)
    };
  } finally { URL.revokeObjectURL(url); }
}
export function summarizeMedia(item) {
  const size = (item.bytes / (1024 * 1024)).toFixed(1) + ' MB';
  const dims = item.width && item.height ? item.width + '×' + item.height : '尺寸待核实';
  const duration = item.type === 'video' && item.duration ? ' · ' + item.duration + ' 秒' : '';
  return item.name + ' · ' + size + ' · ' + dims + ' · ' + item.ratio + duration;
}
