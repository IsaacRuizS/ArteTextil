import { Injectable } from '@angular/core';

type ToastType = 'error' | 'success' | 'warning';

const COLORS: Record<ToastType, string> = {
    error:   '#dc3545',
    success: '#198754',
    warning: '#ffc107'
};

const TEXT_COLORS: Record<ToastType, string> = {
    error:   'white',
    success: 'white',
    warning: '#212529'
};

@Injectable({ providedIn: 'root' })
export class NotificationService {

    show(message: string, type: ToastType = 'error') {

        const toast = document.createElement('div');

        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.background = COLORS[type];
        toast.style.color = TEXT_COLORS[type];
        toast.style.padding = '14px 18px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        toast.style.zIndex = '9999';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '10px';
        toast.style.maxWidth = '360px';
        toast.style.fontSize = '14px';

        const text = document.createElement('span');
        text.innerText = message;

        const closeBtn = document.createElement('button');
        closeBtn.innerText = '✕';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = 'none';
        closeBtn.style.color = TEXT_COLORS[type];
        closeBtn.style.fontSize = '16px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.marginLeft = 'auto';

        closeBtn.onclick = () => toast.remove();

        toast.appendChild(text);
        toast.appendChild(closeBtn);

        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 7000);
    }

    success(message: string) { this.show(message, 'success'); }
    error(message: string)   { this.show(message, 'error');   }
    warning(message: string) { this.show(message, 'warning'); }
}
