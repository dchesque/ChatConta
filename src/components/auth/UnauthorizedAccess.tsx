import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export function UnauthorizedAccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Background abstratos */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-r from-red-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-md mx-auto text-center bg-white/90 backdrop-blur-md border border-white/30 rounded-3xl p-8 shadow-2xl">
        <div className="w-20 h-20 bg-red-100/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-red-200/50">
          <Shield className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acesso Negado
        </h1>
        
        <p className="text-gray-600 mb-2">
          Você não possui as permissões necessárias para acessar esta área do sistema.
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          Se você acredita que deveria ter acesso, entre em contato com o administrador do sistema.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full border-gray-200/80 hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-300"
          >
            Página Anterior
          </Button>
        </div>
      </div>
    </div>
  );
}