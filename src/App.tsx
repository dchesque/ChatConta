import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "sonner";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { Loader2 } from 'lucide-react';
import { StartupInitializer } from '@/components/layout/StartupInitializer';
import { SecurityGuard } from '@/components/auth/SecurityGuard';
import { FormSecurityProvider } from '@/components/ui/FormSecurityProvider';

// Páginas críticas - carregamento imediato (sem lazy loading)
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import AuthConfirm from '@/pages/AuthConfirm';
import AuthResetPassword from '@/pages/AuthResetPassword';
import NotFound from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';

// Páginas frequentemente usadas - carregamento imediato
import Dashboard from '@/pages/Dashboard';
import ContasPagar from '@/pages/ContasPagar';
import ContasReceber from '@/pages/ContasReceber';

// Páginas de cadastro - lazy loading agrupado
const CadastroPages = {
  NovaConta: lazy(() => import('@/pages/NovaConta')),
  NovoRecebimento: lazy(() => import('@/pages/NovoRecebimento')),
  Contatos: lazy(() => import('@/pages/Contatos')),
  Categorias: lazy(() => import('@/pages/Categorias')),
};

// Páginas de configuração/perfil - lazy loading agrupado
const ConfigPages = {
  MeuPerfil: lazy(() => import('@/pages/MeuPerfil')),
  Assinatura: lazy(() => import('@/pages/Assinatura')),
  Banks: lazy(() => import('@/pages/Banks')),
  Configuracoes: lazy(() => import('@/pages/Configuracoes')),
};

// Páginas administrativas - lazy loading (uso esporádico)
const AdminPages = {
  MonitoramentoPerformance: lazy(() => import('@/pages/MonitoramentoPerformanceMelhorado')),
  Administrador: lazy(() => import('@/pages/Administrador')),
  UsuariosAdmin: lazy(() => import('@/pages/UsuariosAdmin')),
  ConfiguracoesSistema: lazy(() => import('@/pages/ConfiguracoesSistema')),
  DesignSystemPreview: lazy(() => import('@/pages/DesignSystemPreview')),
};

// Componente de fallback para lazy loading
const PageFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Preload de páginas mais prováveis quando o usuário está logado
const preloadFrequentPages = () => {
  // Preload ContasPagar quando entrar no Dashboard (são as páginas mais acessadas)
  const preloadContasPagar = () => import('@/pages/ContasPagar');
  const preloadContasReceber = () => import('@/pages/ContasReceber');
  
  // Executa preload após um breve delay para não interferir no carregamento inicial
  setTimeout(() => {
    preloadContasPagar();
    preloadContasReceber();
  }, 1000);
};

// Preload baseado em mouse hover nos links do menu
const handleMenuHover = (pageName: string) => {
  switch (pageName) {
    case 'nova-conta':
      import('@/pages/NovaConta');
      break;
    case 'novo-recebimento':
      import('@/pages/NovoRecebimento');
      break;
    case 'contatos':
      import('@/pages/Contatos');
      break;
    case 'categorias':
      import('@/pages/Categorias');
      break;
    case 'bancos':
      import('@/pages/Banks');
      break;
    case 'meu-perfil':
      import('@/pages/MeuPerfil');
      break;
    case 'configuracoes':
      import('@/pages/Configuracoes');
      break;
    default:
      break;
  }
};

function App() {
  // Preload automático quando a aplicação inicializa
  useEffect(() => {
    // Executa preload após o app estar carregado
    preloadFrequentPages();
  }, []);

  return (
    <ErrorBoundary>
      <SecurityGuard>
        <FormSecurityProvider>
          <QueryClientProvider client={queryClient}>
            <StartupInitializer>
              <Router>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Rotas de autenticação - sem lazy loading */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/confirm" element={<AuthConfirm />} />
                <Route path="/auth/reset-password" element={<AuthResetPassword />} />
                
                {/* Páginas principais - sem lazy loading (carregamento imediato) */}
                <Route path="/" element={<ProtectedRoute><Layout><Index /></Layout></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/contas-pagar" element={<ProtectedRoute><Layout><ContasPagar /></Layout></ProtectedRoute>} />
                <Route path="/contas-receber" element={<ProtectedRoute><Layout><ContasReceber /></Layout></ProtectedRoute>} />
                
                {/* Páginas de cadastro - lazy loading */}
                <Route path="/nova-conta" element={<ProtectedRoute><Layout><CadastroPages.NovaConta /></Layout></ProtectedRoute>} />
                <Route path="/novo-recebimento" element={<ProtectedRoute><Layout><CadastroPages.NovoRecebimento /></Layout></ProtectedRoute>} />
                <Route path="/contatos" element={<ProtectedRoute><Layout><CadastroPages.Contatos /></Layout></ProtectedRoute>} />
                <Route path="/categorias" element={<ProtectedRoute><Layout><CadastroPages.Categorias /></Layout></ProtectedRoute>} />
                
                {/* Páginas de configuração - lazy loading */}
                <Route path="/bancos" element={<ProtectedRoute><Layout><ConfigPages.Banks /></Layout></ProtectedRoute>} />
                <Route path="/meu-perfil" element={<ProtectedRoute><Layout><ConfigPages.MeuPerfil /></Layout></ProtectedRoute>} />
                <Route path="/assinatura" element={<ProtectedRoute><Layout><ConfigPages.Assinatura /></Layout></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute><Layout><ConfigPages.Configuracoes /></Layout></ProtectedRoute>} />
                
                {/* Páginas administrativas - lazy loading */}
                <Route path="/design-system" element={<ProtectedRoute><Layout><AdminPages.DesignSystemPreview /></Layout></ProtectedRoute>} />
                <Route path="/monitoramento-performance" element={<AdminRoute><Layout><AdminPages.MonitoramentoPerformance /></Layout></AdminRoute>} />
                <Route path="/administrador" element={<AdminRoute><Layout><AdminPages.Administrador /></Layout></AdminRoute>} />
                <Route path="/administrador/usuarios" element={<AdminRoute><Layout><AdminPages.UsuariosAdmin /></Layout></AdminRoute>} />
                <Route path="/administrador/configuracoes-sistema" element={<AdminRoute><Layout><AdminPages.ConfiguracoesSistema /></Layout></AdminRoute>} />
                
                {/* Página não encontrada */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster 
              position="top-right"
              expand={false}
              richColors
              closeButton
              duration={4000}
              toastOptions={{
                style: {
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                },
                className: 'sonner-toast',
              }}
            />
            </Router>
            </StartupInitializer>
          </QueryClientProvider>
        </FormSecurityProvider>
      </SecurityGuard>
    </ErrorBoundary>
  );
}

// Exporta a função de preload para uso no Layout/Menu
export { handleMenuHover };

export default App;