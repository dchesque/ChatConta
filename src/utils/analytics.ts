/**
 * 📊 SISTEMA DE ANALYTICS PREMIUM
 * Monitoramento completo e inteligente de todas as interações do usuário
 */
import { generateSecureSessionId } from '@/utils/cryptoUtils';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

interface PageViewEvent {
  page: string;
  title: string;
  userId?: string;
  referrer?: string;
  loadTime?: number;
}

interface UserIdentity {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  company?: string;
}

export class Analytics {
  private static instance: Analytics;
  private isEnabled: boolean = true;
  private sessionId: string;
  private userId?: string;
  private queue: AnalyticsEvent[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeOnlineDetection();
    this.processQueueWhenOnline();
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  // 🎯 EVENTOS PRINCIPAIS
  static track(event: AnalyticsEvent) {
    const analytics = Analytics.getInstance();
    
    const enrichedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: analytics.sessionId,
      userId: analytics.userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag && analytics.isEnabled) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        user_id: event.userId,
        session_id: analytics.sessionId,
        custom_parameters: event.metadata
      });
    }

    // Facebook Pixel (se configurado)
    if (typeof window !== 'undefined' && window.fbq && analytics.isEnabled) {
      window.fbq('track', event.action, event.metadata);
    }

    // Log estruturado para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Analytics Event: ${event.action}`, enrichedEvent);
    }

    // Armazenar para processamento offline
    analytics.storeEvent(enrichedEvent);
    
    // Adicionar à fila se offline
    if (!analytics.isOnline) {
      analytics.queue.push(enrichedEvent);
    }
  }

  // 📄 PAGE VIEWS
  static pageView(event: PageViewEvent) {
    const analytics = Analytics.getInstance();
    
    // Medir tempo de carregamento
    const loadTime = performance.now();
    
    const enrichedPageView = {
      ...event,
      loadTime,
      sessionId: analytics.sessionId,
      userId: analytics.userId,
      timestamp: new Date().toISOString()
    };

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: event.page,
        page_title: event.title,
        user_id: event.userId,
        session_id: analytics.sessionId,
        custom_map: {
          custom_load_time: loadTime
        }
      });
    }

    // Log de page view
    console.warn(`📄 Page View: ${event.page} - ${event.title} (${loadTime.toFixed(2)}ms)`);
    
    analytics.storePageView(enrichedPageView);
  }

  // 👤 IDENTIFICAÇÃO DE USUÁRIO
  static identify(user: UserIdentity) {
    const analytics = Analytics.getInstance();
    analytics.userId = user.userId;

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: user.userId,
        custom_map: {
          user_email: user.email,
          user_name: user.name,
          user_role: user.role,
          user_company: user.company
        }
      });
    }

    // Armazenar perfil do usuário
    try {
      localStorage.setItem('user_profile', JSON.stringify(user));
    } catch (error) {
      console.warn('Erro ao salvar perfil do usuário:', error);
    }

    console.warn(`👤 User Identified: ${user.name} (${user.email})`);
  }

  // 🎯 EVENTOS DE NEGÓCIO ESPECÍFICOS
  static business = {
    // Fornecedores
    fornecedorCriado: (sucesso: boolean, dados?: any) => Analytics.track({
      action: 'criar_fornecedor',
      category: 'cadastros',
      label: sucesso ? 'sucesso' : 'erro',
      metadata: {
        tipo_pessoa: dados?.tipo_pessoa,
        tem_email: !!dados?.email,
        tem_telefone: !!dados?.telefone
      }
    }),

    fornecedorEditado: (fornecedorId: string) => Analytics.track({
      action: 'editar_fornecedor',
      category: 'cadastros',
      label: 'fornecedor_editado',
      metadata: { fornecedor_id: fornecedorId }
    }),

    // Contas a Pagar
    contaCriada: (valor: number, categoria?: string) => Analytics.track({
      action: 'criar_conta_pagar',
      category: 'financeiro',
      label: 'conta_criada',
      value: valor,
      metadata: { categoria }
    }),

    contaPaga: (valor: number, metodoPagamento?: string) => Analytics.track({
      action: 'pagar_conta',
      category: 'financeiro',
      label: 'conta_paga',
      value: valor,
      metadata: { metodo_pagamento: metodoPagamento }
    }),

    contaVencida: (valor: number, diasAtraso: number) => Analytics.track({
      action: 'conta_vencida',
      category: 'financeiro',
      label: 'conta_venceu',
      value: valor,
      metadata: { dias_atraso: diasAtraso }
    }),

    // Relatórios
    relatorioExportado: (tipo: string, formato: string) => Analytics.track({
      action: 'exportar_relatorio',
      category: 'relatorios',
      label: tipo,
      metadata: { formato }
    }),

    relatorioVisualizado: (tipo: string, filtros?: any) => Analytics.track({
      action: 'visualizar_relatorio',
      category: 'relatorios',
      label: tipo,
      metadata: { filtros }
    }),

    // Performance
    performanceMeasure: (metrica: string, valor: number) => Analytics.track({
      action: 'performance_metric',
      category: 'performance',
      label: metrica,
      value: valor
    }),

    // Erros
    erroCapturado: (erro: string, componente?: string) => Analytics.track({
      action: 'erro_aplicacao',
      category: 'erros',
      label: erro,
      metadata: { componente }
    }),

    // Engajamento
    tempoNaPagina: (pagina: string, tempo: number) => Analytics.track({
      action: 'tempo_pagina',
      category: 'engajamento',
      label: pagina,
      value: tempo
    }),

    featureUsada: (feature: string, contexto?: string) => Analytics.track({
      action: 'feature_used',
      category: 'features',
      label: feature,
      metadata: { contexto }
    })
  };

  // 🔧 MÉTODOS PRIVADOS
  private generateSessionId(): string {
    return generateSecureSessionId();
  }

  private initializeOnlineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private processQueueWhenOnline() {
    setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.processQueue();
      }
    }, 5000); // Verificar a cada 5 segundos
  }

  private processQueue() {
    if (this.queue.length === 0) return;

    console.warn(`📤 Processando ${this.queue.length} eventos em fila...`);
    
    // Simular envio para servidor analytics
    this.queue.forEach(event => {
      // Aqui você enviaria para seu backend analytics
      console.warn('📤 Enviando evento:', event);
    });

    this.queue = [];
  }

  private storeEvent(event: any) {
    try {
      const events = JSON.parse(localStorage.getItem('app_analytics') || '[]');
      events.push(event);
      
      // Manter apenas últimos 500 eventos
      if (events.length > 500) {
        events.splice(0, events.length - 500);
      }
      
      localStorage.setItem('app_analytics', JSON.stringify(events));
    } catch (error) {
      console.warn('Erro ao armazenar evento:', error);
    }
  }

  private storePageView(pageView: any) {
    try {
      const pageViews = JSON.parse(localStorage.getItem('app_page_views') || '[]');
      pageViews.push(pageView);
      
      // Manter apenas últimas 100 page views
      if (pageViews.length > 100) {
        pageViews.splice(0, pageViews.length - 100);
      }
      
      localStorage.setItem('app_page_views', JSON.stringify(pageViews));
    } catch (error) {
      console.warn('Erro ao armazenar page view:', error);
    }
  }

  // 📊 MÉTODOS DE RELATÓRIO
  static getAnalyticsReport() {
    try {
      const events = JSON.parse(localStorage.getItem('app_analytics') || '[]');
      const pageViews = JSON.parse(localStorage.getItem('app_page_views') || '[]');
      
      return {
        totalEvents: events.length,
        totalPageViews: pageViews.length,
        topCategories: Analytics.getTopCategories(events),
        topActions: Analytics.getTopActions(events),
        averageSessionTime: Analytics.getAverageSessionTime(pageViews),
        dailyActivity: Analytics.getDailyActivity(events)
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return null;
    }
  }

  private static getTopCategories(events: any[]) {
    const categories = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10);
  }

  private static getTopActions(events: any[]) {
    const actions = events.reduce((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(actions)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 10);
  }

  private static getAverageSessionTime(pageViews: any[]) {
    if (pageViews.length === 0) return 0;
    
    const totalTime = pageViews.reduce((sum, pv) => sum + (pv.loadTime || 0), 0);
    return totalTime / pageViews.length;
  }

  private static getDailyActivity(events: any[]) {
    const daily = events.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30); // Últimos 30 dias
  }
}