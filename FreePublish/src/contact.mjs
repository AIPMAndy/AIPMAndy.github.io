/* FreePublish contact: copy only when the user explicitly clicks. */
const button = document.getElementById('copy-wechat');
const feedback = document.getElementById('contact-feedback');
async function copyWechat() {
  let field;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText('AIPMAndy');
    } else {
      field = document.createElement('textarea');
      field.value = 'AIPMAndy';
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
      document.body.appendChild(field);
      field.focus();
      field.select();
      if (!document.execCommand('copy')) throw new Error('copy denied');
    }
    feedback.textContent = '微信号已复制，可在微信搜索 AIPMAndy。';
  } catch {
    feedback.textContent = '复制失败，请手动输入微信号 AIPMAndy。';
  } finally {
    field?.remove();
  }
}
button?.addEventListener('click', copyWechat);
