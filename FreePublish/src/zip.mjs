/**
 * FreePublish offline ZIP writer (ZIP32 / STORE).
 * No remote services or third-party packages. Maximum 180 MiB per export.
 * Media stays in the user's browser until the user downloads the ZIP.
 */
const encoder = new TextEncoder();
const MAX_ARCHIVE_BYTES = 180 * 1024 * 1024;
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c >>> 0;
}
export function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
export function safeFileName(input) {
  const name = String(input || 'asset').replace(/[/\\:*?"<>|\u0000-\u001f\u007f]/g, '_')
    .replace(/^\.+/, '_').trim();
  return (name || 'asset').slice(0, 160);
}
function u16(view, off, n) { view.setUint16(off, n, true); }
function u32(view, off, n) { view.setUint32(off, n >>> 0, true); }
function timeAndDate(date) {
  let y = date.getFullYear();
  y = Math.max(1980, Math.min(y, 2107));
  return {
    dosTime: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    dosDate: ((y - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  };
}
function localHeader(nameLength, size, crc, t) {
  const arr = new Uint8Array(30);
  const v = new DataView(arr.buffer);
  u32(v, 0, 0x04034B50);
  u16(v, 4, 20); u16(v, 6, 0x0800); // UTF-8 names
  u16(v, 8, 0); u16(v, 10, t.dosTime); u16(v, 12, t.dosDate);
  u32(v, 14, crc); u32(v, 18, size); u32(v, 22, size);
  u16(v, 26, nameLength); u16(v, 28, 0);
  return arr;
}
function centralHeader(nameLength, size, crc, t, offset) {
  const arr = new Uint8Array(46);
  const v = new DataView(arr.buffer);
  u32(v, 0, 0x02014B50);
  u16(v, 4, 20); u16(v, 6, 20); u16(v, 8, 0x0800);
  u16(v, 10, 0); u16(v, 12, t.dosTime); u16(v, 14, t.dosDate);
  u32(v, 16, crc); u32(v, 20, size); u32(v, 24, size);
  u16(v, 28, nameLength); u16(v, 30, 0); u16(v, 32, 0);
  u16(v, 34, 0); u16(v, 36, 0); u32(v, 38, 0); u32(v, 42, offset);
  return arr;
}
function endOfCentral(count, size, offset) {
  const arr = new Uint8Array(22);
  const v = new DataView(arr.buffer);
  u32(v, 0, 0x06054B50); u16(v, 4, 0); u16(v, 6, 0);
  u16(v, 8, count); u16(v, 10, count);
  u32(v, 12, size); u32(v, 16, offset); u16(v, 20, 0);
  return arr;
}
/**
 * entries: {name: string, data: string | Uint8Array | Blob}[]
 * Return a ZIP blob; no network request, no credentials.
 */
export async function buildZip(entries) {
  if (!Array.isArray(entries) || entries.length === 0 || entries.length > 50)
    throw new Error('一个发布包必须包含 1～50 个文件。');
  const seen = new Set();
  const locals = [];
  const centers = [];
  let offset = 0;
  let centralBytes = 0;
  const t = timeAndDate(new Date());
  for (const entry of entries) {
    const name = safeFileName(entry.name);
    if (seen.has(name)) throw new Error('发布包存在重名文件：' + name);
    seen.add(name);
    const nameBytes = encoder.encode(name);
    const data = typeof entry.data === 'string' ? encoder.encode(entry.data)
      : entry.data instanceof Uint8Array ? entry.data
      : entry.data && typeof entry.data.arrayBuffer === 'function'
        ? new Uint8Array(await entry.data.arrayBuffer())
        : null;
    if (!data) throw new Error('无法读取发布包文件：' + name);
    if (data.byteLength > MAX_ARCHIVE_BYTES || offset + 30 + nameBytes.length + data.byteLength > MAX_ARCHIVE_BYTES)
      throw new Error('发布包超过 180MB 安全上限，请选择较小素材或只下载文字发布说明。');
    const crc = crc32(data);
    const header = localHeader(nameBytes.length, data.byteLength, crc, t);
    const central = centralHeader(nameBytes.length, data.byteLength, crc, t, offset);
    locals.push(header, nameBytes, data);
    centers.push(central, nameBytes);
    offset += header.length + nameBytes.length + data.byteLength;
    centralBytes += central.length + nameBytes.length;
  }
  if (offset + centralBytes + 22 > MAX_ARCHIVE_BYTES)
    throw new Error('发布包超过 180MB 安全上限。');
  return new Blob([...locals, ...centers, endOfCentral(entries.length, centralBytes, offset)], { type: 'application/zip' });
}
