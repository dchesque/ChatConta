
/**
 * Utilitários de segurança do DOM (frontend)
 * - Comentários e mensagens em português (padrão do projeto)
 */

import { SECURITY_META_TAGS } from '@/utils/securityHeaders';
import { auditService } from '@/services/auditService';

/**
 * Detecta se é ambiente Lovable/Desenvolvimento para evitar frame-busting no preview/iframe do builder
 */
export const isLovableEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.includes('lovable') || hostname.includes('localhost') || hostname.includes('127.0.0.1');
};

/**
 * Injeta meta tags de segurança no <head> (somente se não existirem)
 */
export const injectSecurityMetaTags = () => {
  try {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    SECURITY_META_TAGS.forEach((tag) => {
      const selector = tag.httpEquiv
        ? `meta[http-equiv="${tag.httpEquiv}"]`
        : tag.name
          ? `meta[name="${tag.name}"]`
          : null;

      if (selector && head.querySelector(selector)) {
        return;
      }

      const meta = document.createElement('meta');
      if (tag.httpEquiv) meta.setAttribute('http-equiv', tag.httpEquiv);
      if (tag.name) meta.setAttribute('name', tag.name);
      if (tag.content) meta.setAttribute('content', tag.content);
      head.appendChild(meta);
    });
  } catch (error) {
    console.warn('Falha ao injetar meta tags de segurança:', error);
  }
};

/**
 * Proteção contra clickjacking.
 * - Evita "frame busting" no ambiente de preview (Lovable/localhost)
 */
export const enforceFrameGuard = () => {
  try {
    if (isLovableEnvironment()) {
      // No preview, permitir iframe para não quebrar a visualização.
      return;
    }
    if (window.top !== window.self) {
      // Fora do preview, tenta sair de iframes não autorizados
      window.top!.location.href = window.location.href;
    }
  } catch {
    // Algumas políticas de navegador bloqueiam acessar window.top
    // Aqui apenas silenciamos.
  }
};

/**
 * Observa alterações de atributos para bloquear injeções perigosas (javascript:, on*)
 */
export const observeDangerousAttributes = () => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
        const el = mutation.target;
        const attrName = mutation.attributeName || '';
        const attrValue = (el.getAttribute(attrName) || '').trim();

        // Bloquear javascript: em atributos sensíveis
        const isUrlAttr = ['href', 'src', 'xlink:href'].includes(attrName);
        const hasJsProto = /^javascript:/i.test(attrValue);

        // Bloquear event handlers inline (on*)
        const isInlineHandler = /^on\w+$/i.test(attrName);

        if ((isUrlAttr && hasJsProto) || isInlineHandler) {
          // Remover atributo perigoso
          el.removeAttribute(attrName);

          // Logar auditoria (sem vazar dados sensíveis)
          auditService.log('update', 'system', 'system', 'system@app.com', {
            description: 'Remoção de atributo perigoso no DOM',
            metadata: {
              tag: el.tagName,
              attr: attrName,
              valueSample: attrValue.substring(0, 50)
            },
            severity: 'high'
          });

          console.warn('Atributo perigoso removido:', { tag: el.tagName, attrName, attrValue });
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'src', 'xlink:href'] // handlers on* são muitos; observar tudo pode ser custoso
  });

  // Observador adicional só para on* (sem attributeFilter)
  const handlerObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
        const attr = mutation.attributeName || '';
        if (/^on\w+$/i.test(attr)) {
          (mutation.target as HTMLElement).removeAttribute(attr);
          auditService.log('update', 'system', 'system', 'system@app.com', {
            description: 'Remoção de handler inline perigoso',
            metadata: { tag: (mutation.target as HTMLElement).tagName, attr },
            severity: 'high'
          });
        }
      }
    }
  });

  handlerObserver.observe(document.documentElement, {
    subtree: true,
    attributes: true
  });

  return () => {
    observer.disconnect();
    handlerObserver.disconnect();
  };
};

/**
 * Bloqueia colar/soltar de HTML potencialmente malicioso em toda a página
 * (permite texto puro).
 */
export const setupPasteDropSanitizer = () => {
  const handlePaste = (e: ClipboardEvent) => {
    const html = e.clipboardData?.getData('text/html');
    if (html && /<script|on\w+=|javascript:/i.test(html)) {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
      console.warn('Conteúdo HTML potencialmente perigoso bloqueado no paste');
    }
  };

  const handleDrop = (e: DragEvent) => {
    const html = e.dataTransfer?.getData('text/html');
    if (html && /<script|on\w+=|javascript:/i.test(html)) {
      e.preventDefault();
      console.warn('Conteúdo HTML potencialmente perigoso bloqueado no drop');
    }
  };

  window.addEventListener('paste', handlePaste);
  window.addEventListener('drop', handleDrop);

  return () => {
    window.removeEventListener('paste', handlePaste);
    window.removeEventListener('drop', handleDrop);
  };
};
