import { Injectable } from '@angular/core';

type ToastType = 'error' | 'success' | 'warning';

const ACCENT_COLORS: Record<ToastType, string> = {
    error:   '#dc3545',
    success: '#198754',
    warning: '#ffc107'
};

const DEFAULT_DURATION_MS = 12000;

@Injectable({ providedIn: 'root' })
export class NotificationService {

    // Toasts apilan uno debajo del otro dentro de este contenedor en vez de
    // superponerse todos en el mismo punto de la pantalla.
    private container: HTMLDivElement | null = null;

    private getContainer(): HTMLDivElement {
        if (this.container && document.body.contains(this.container)) {
            return this.container;
        }

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        container.style.maxWidth = '360px';

        document.body.appendChild(container);
        this.container = container;
        return container;
    }

    show(message: string, type: ToastType = 'error', durationMs = DEFAULT_DURATION_MS) {

        const toast = document.createElement('div');

        // Fondo claro con acento de color en el borde en vez de un bloque
        // sólido del color, para que sea menos intrusivo visualmente.
        toast.style.background = '#fff';
        toast.style.color = '#212529';
        toast.style.borderLeft = `4px solid ${ACCENT_COLORS[type]}`;
        toast.style.padding = '12px 14px';
        toast.style.borderRadius = '6px';
        toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '10px';
        toast.style.fontSize = '14px';

        const text = document.createElement('span');
        text.innerText = message;
        text.style.flex = '1';

        const closeBtn = document.createElement('button');
        closeBtn.innerText = '✕';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = 'none';
        closeBtn.style.color = '#6c757d';
        closeBtn.style.fontSize = '14px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.marginLeft = 'auto';

        closeBtn.onclick = () => toast.remove();

        toast.appendChild(text);
        toast.appendChild(closeBtn);

        this.getContainer().appendChild(toast);

        setTimeout(() => toast.remove(), durationMs);
    }

    success(message: string, durationMs?: number) { this.show(message, 'success', durationMs); }
    error(message: string, durationMs?: number)   { this.show(message, 'error', durationMs);   }
    warning(message: string, durationMs?: number) { this.show(message, 'warning', durationMs); }
}
