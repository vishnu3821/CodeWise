export const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error')
};

function showToast(msg, type) {
    const el = document.createElement('div');
    el.innerText = msg;
    el.style.position = 'fixed';
    el.style.bottom = '20px';
    el.style.right = '20px';
    el.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
    el.style.color = '#fff';
    el.style.padding = '12px 24px';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    el.style.zIndex = '9999';
    el.style.transition = 'opacity 0.3s ease';
    el.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    el.style.fontSize = '14px';
    document.body.appendChild(el);

    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
    }, 3000);
}
