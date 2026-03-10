import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {

    show(message: string) {

    const toast = document.createElement('div');

    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.background = '#dc3545';
    toast.style.color = 'white';
    toast.style.padding = '14px 18px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    toast.style.zIndex = '9999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';

    const text = document.createElement('span');
    text.innerText = message;

    const closeBtn = document.createElement('button');
    closeBtn.innerText = '✕';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.cursor = 'pointer';

    closeBtn.onclick = () => toast.remove();

    toast.appendChild(text);
    toast.appendChild(closeBtn);

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 7000);
}
}