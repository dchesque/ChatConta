import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title: string;
  description: string;
  keywords?: string;
}

const routeSEOMap: Record<string, SEOData> = {
  '/': {
    title: 'Dashboard - JC Financeiro',
    description: 'Dashboard principal do sistema de gestão financeira JC Financeiro'
  },
  '/dashboard': {
    title: 'Dashboard - JC Financeiro',
    description: 'Visão geral das finanças, métricas e indicadores importantes'
  },
  '/contas-pagar': {
    title: 'Contas a Pagar - JC Financeiro',
    description: 'Gerencie suas contas a pagar, fornecedores e vencimentos'
  },
  '/contas-receber': {
    title: 'Contas a Receber - JC Financeiro',
    description: 'Controle suas contas a receber e pagadores'
  },
  '/bancos': {
    title: 'Bancos - JC Financeiro',
    description: 'Gerencie extratos bancários e conciliações financeiras'
  },
  '/contatos': {
    title: 'Contatos - JC Financeiro',
    description: 'Gerencie fornecedores, clientes e pagadores'
  },
  '/categorias': {
    title: 'Categorias - JC Financeiro',
    description: 'Organize suas categorias de receitas e despesas'
  },
  '/meu-perfil': {
    title: 'Meu Perfil - JC Financeiro',
    description: 'Gerencie suas informações pessoais e preferências'
  },
  '/configuracoes': {
    title: 'Configurações - JC Financeiro',
    description: 'Configure preferências do sistema e segurança'
  },
  '/assinatura': {
    title: 'Assinatura - JC Financeiro',
    description: 'Gerencie seu plano e assinatura do sistema'
  },
  '/nova-conta': {
    title: 'Nova Conta a Pagar - JC Financeiro',
    description: 'Cadastre uma nova conta a pagar no sistema'
  },
  '/novo-recebimento': {
    title: 'Novo Recebimento - JC Financeiro',
    description: 'Cadastre um novo recebimento no sistema'
  },
  '/auth': {
    title: 'Login - JC Financeiro',
    description: 'Acesse sua conta do sistema de gestão financeira'
  }
};

export function useSEO() {
  const location = useLocation();

  useEffect(() => {
    const currentRoute = location.pathname;
    const seoData = routeSEOMap[currentRoute] || {
      title: 'JC Financeiro - Sistema de Gestão Financeira',
      description: 'Sistema completo de controle financeiro para sua empresa'
    };

    // Atualizar título da página
    document.title = seoData.title;

    // Atualizar meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', seoData.description);

    // Atualizar Open Graph title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', seoData.title);

    // Atualizar Open Graph description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', seoData.description);

    // Atualizar URL canônica
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + currentRoute);

    // Atualizar keywords se existirem
    if (seoData.keywords) {
      let keywords = document.querySelector('meta[name="keywords"]');
      if (!keywords) {
        keywords = document.createElement('meta');
        keywords.setAttribute('name', 'keywords');
        document.head.appendChild(keywords);
      }
      keywords.setAttribute('content', seoData.keywords);
    }

  }, [location.pathname]);

  const updateSEO = (customSEO: Partial<SEOData>) => {
    if (customSEO.title) {
      document.title = customSEO.title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', customSEO.title);
    }

    if (customSEO.description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.setAttribute('content', customSEO.description);
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.setAttribute('content', customSEO.description);
    }

    if (customSEO.keywords) {
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) keywords.setAttribute('content', customSEO.keywords);
    }
  };

  return { updateSEO };
}