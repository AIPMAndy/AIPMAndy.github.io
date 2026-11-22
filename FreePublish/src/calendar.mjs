/** RFC 5545 iCalendar export. Creates reminders, NEVER publishes to a social platform. */
function escapeIcs(value) {
  return String(value == null ? '' : value)
    .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
}
function utc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
function safeUid(id, platform) {
  return (String(id) + '-' + String(platform)).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
}
export function exportCalendar(posts, platforms) {
  const now = utc(new Date());
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//FreePublish//Human Approved Publishing Plan//ZH-CN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:FreePublish 手动发布提醒'
  ];
  let count = 0;
  for (const post of posts) {
    for (const [platform, v] of Object.entries(post.variants || {})) {
      if (!platforms[platform] || !v.plannedAt || !v.title) continue;
      const when = new Date(v.plannedAt);
      if (!Number.isFinite(when.getTime())) continue;
      count++;
      const stamp = utc(when);
      const end = utc(new Date(when.getTime() + 20 * 60000));
      const summary = '[人工发布] ' + platforms[platform].name + ' · ' + v.title;
      lines.push('BEGIN:VEVENT',
        'UID:' + safeUid(post.id, platform) + '@freepublish.local',
        'DTSTAMP:' + now, 'DTSTART:' + stamp, 'DTEND:' + end,
        'SUMMARY:' + escapeIcs(summary),
        'DESCRIPTION:' + escapeIcs('请打开 ' + platforms[platform].url + '，人工复审、上传、发布。FreePublish 不会自动发帖。'),
        'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY',
        'DESCRIPTION:' + escapeIcs(summary),'END:VALARM','END:VEVENT');
    }
  }
  lines.push('END:VCALENDAR');
  return { contents: lines.join('\r\n') + '\r\n', count };
}
