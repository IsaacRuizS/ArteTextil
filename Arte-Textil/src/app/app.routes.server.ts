import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas públicas estáticas → pre-renderizar (SEO)
  { path: 'login',       renderMode: RenderMode.Prerender },
  { path: 'marketplace', renderMode: RenderMode.Prerender },
  { path: 'cart',        renderMode: RenderMode.Prerender },
  { path: 'quoate',      renderMode: RenderMode.Prerender },

  // Ruta pública dinámica → SSR por petición
  { path: 'product/:id', renderMode: RenderMode.Server },

  // Rutas protegidas (CMS/admin) → solo cliente
  // El AuthGuard corre en el browser antes de renderizar, sin flash
  { path: '**', renderMode: RenderMode.Client }
];
