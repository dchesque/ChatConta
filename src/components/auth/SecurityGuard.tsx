
import { ReactNode, useEffect } from 'react';
import { logService } from '@/services/logService';
import { auditService } from '@/services/auditService';
import { injectSecurityMetaTags, enforceFrameGuard, observeDangerousAttributes, setupPasteDropSanitizer, isLovableEnvironment } from '@/utils/domSecurity';
import { SECURITY_META_TAGS } from '@/utils/securityHeaders';

interface SecurityGuardProps {
  children: ReactNode;
}

/**
 * Componente de segurança que monitora atividades suspeitas
 * - Agora também injeta meta tags de segurança e reforça proteções no DOM
 */
export function SecurityGuard({ children }: SecurityGuardProps) {
  useEffect(() => {
    // 0) Meta tags de segurança e frame guard (sem quebrar preview)
    injectSecurityMetaTags();
    enforceFrameGuard();

    // 1) Monitor de tentativas de manipulação do DOM (childList)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Detectar scripts injetados
              if (node.tagName === 'SCRIPT' && !node.hasAttribute('data-allowed')) {
                logService.logError('Script injection attempt detected', 'SecurityGuard');
                auditService.log('update', 'system', 'system', 'system@app.com', {
                  description: 'Script injection blocked',
                  metadata: { element: node.outerHTML.substring(0, 200) },
                  severity: 'critical'
                });
                node.remove();
              }

              // Detectar iframes suspeitos (permitir no ambiente Lovable)
              if (node.tagName === 'IFRAME' && !node.hasAttribute('data-allowed') && !isLovableEnvironment()) {
                logService.logError('Iframe injection attempt detected', 'SecurityGuard');
                auditService.log('update', 'system', 'system', 'system@app.com', {
                  description: 'Iframe injection blocked',
                  metadata: { src: node.getAttribute('src') },
                  severity: 'critical'
                });
                node.remove();
              }

              // Remover handlers inline perigosos adicionados dinamicamente
              const attrs = Array.from(node.attributes || []);
              attrs.forEach(attr => {
                if (/^on\w+$/i.test(attr.name)) {
                  node.removeAttribute(attr.name);
                  auditService.log('update', 'system', 'system', 'system@app.com', {
                    description: 'Remoção de handler inline perigoso (nó novo)',
                    metadata: { tag: node.tagName, attr: attr.name },
                    severity: 'high'
                  });
                }
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 2) Monitor de mudanças de atributos perigosos (href/src/on*)
    const disconnectAttrObservers = observeDangerousAttributes();

    // 3) Sanitizar paste/drop de HTML perigoso globalmente
    const disconnectPasteDrop = setupPasteDropSanitizer();

    // 4) Monitor de eventos de console suspeitos
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      if (message.includes('Content Security Policy') || 
          message.includes('XSS') || 
          message.includes('script injection')) {
        logService.logError('Security violation detected in console', 'SecurityGuard', 'warn');
      }
      originalConsoleError.apply(console, args as any);
    };

    // 5) Log inicial para auditar ativação de proteções
    auditService.log('view', 'system', 'system', 'system@app.com', {
      description: 'SecurityGuard ativo',
      metadata: {
        metaTagsInjetadas: SECURITY_META_TAGS.map(t => t.httpEquiv || t.name).filter(Boolean),
        lovable: isLovableEnvironment()
      }
    });

    return () => {
      observer.disconnect();
      if (disconnectAttrObservers) disconnectAttrObservers();
      if (disconnectPasteDrop) disconnectPasteDrop();
      console.error = originalConsoleError;
    };
  }, []);

  return <>{children}</>;
}
