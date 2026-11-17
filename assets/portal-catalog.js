/* Local-only filter/export for the portal's existing authoritative visible list. */
(() => {
  'use strict';
  const panel = document.getElementById('catalog-tools');
  const section = document.getElementById('sites');
  if (!panel || !section) return;

  const search = document.getElementById('catalog-search');
  const category = document.getElementById('catalog-category');
  const count = document.getElementById('catalog-count');
  const empty = document.getElementById('catalog-empty');
  const reset = document.getElementById('catalog-reset');
  const exportButton = document.getElementById('catalog-export');
  const rows = Array.from(section.querySelectorAll(':scope > ul > li'));
  const groups = [
    ['career', /student|career|job|offer|salary|unemployment|executive|求职|职场/],
    ['tools', /free|photo|watermark|cover|gif|token|iptest|paper|工具/],
    ['business', /income|money|ecommerce|creator|wechat-account|threads|x-income|商业|变现/],
    ['workflow', /claude|workbuddy|doubao|grok|gemini|muse|skill|agent/],
    ['growth', /intj|infj|醒觉|成长/],
  ];
  const data = rows.map((node) => {
    const link = node.querySelector('a[href]');
    const title = link ? link.textContent.trim() : '';
    const href = link ? link.href : '';
    const hay = (node.textContent + ' ' + href).toLocaleLowerCase('zh-CN');
    const group = groups.find(([, re]) => re.test(hay));
    return {node, title, href, hay, category: group ? group[0] : 'other'};
  });
  let shown = data;

  function update() {
    const term = search.value.trim().toLocaleLowerCase('zh-CN');
    const selected = category.value;
    shown = data.filter((entry) => {
      const ok = (!term || entry.hay.includes(term)) &&
        (selected === 'all' || entry.category === selected);
      entry.node.hidden = !ok;
      return ok;
    });
    count.textContent = '显示 ' + shown.length + ' / ' + data.length + ' 个项目';
    empty.hidden = shown.length !== 0;
    exportButton.disabled = shown.length === 0;
  }
  search.addEventListener('input', update);
  category.addEventListener('change', update);
  reset.addEventListener('click', () => {
    search.value = '';
    category.value = 'all';
    update();
    search.focus();
  });
  exportButton.addEventListener('click', () => {
    if (!shown.length) return;
    const text = [
      'AI酋长Andy · 开源项目导航（当前筛选）',
      '公开目录：https://aipmandy.github.io/',
      '作者：AI酋长Andy · 星觉科技',
      '微信：AIPMAndy',
      '个人官网：https://metaver.vip/',
      '公司官网：https://www.a6no1.cn/',
      '咨询入口：https://metaver.vip/services',
      '仅记录网页当前显示的项目链接，不代表已验证所有外部链接的当前状态。',
      '',
      ...shown.flatMap((entry, i) => [(i + 1) + '. ' + entry.title, entry.href, ''])
    ].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', text], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'andy-open-source-directory.txt';
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  update();
})();
