import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { GLASSMORPHISM, ANIMATIONS } from '@/constants/designSystem';

export default function AuthConfirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    handleEmailConfirmation();
  }, [token_hash, type]);

  const handleEmailConfirmation = async () => {
    if (!token_hash || !type) {
      setStatus('error');
      setMessage('Link de confirmação inválido ou expirado.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      });

      if (error) {
        console.error('Erro na confirmação:', error);
        setStatus('error');
        setMessage(error.message || 'Erro ao confirmar email. Tente novamente.');
      } else if (data.user) {
        setStatus('success');
        setMessage('Email confirmado com sucesso!');
        
        // Aguardar um pouco e redirecionar
        setTimeout(() => {
          navigate(next);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setStatus('error');
      setMessage('Erro inesperado. Tente novamente.');
    }
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    
    try {
      // Para reenviar, precisaríamos do email do usuário
      // Como não temos acesso direto, vamos redirecionar para o signup
      toast.info('Redirecionando para criar uma nova conta...');
      navigate('/auth?mode=signup');
    } catch (error) {
      toast.error('Erro ao reenviar confirmação');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Blur backgrounds abstratos */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className={`${GLASSMORPHISM.card} ${ANIMATIONS.smooth} animate-scale-in`}>
            <CardHeader className="text-center space-y-4">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                status === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : status === 'error'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}>
                {status === 'loading' && (
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                )}
                {status === 'success' && (
                  <CheckCircle className="w-8 h-8 text-white" />
                )}
                {status === 'error' && (
                  <AlertCircle className="w-8 h-8 text-white" />
                )}
              </div>
              
              <div>
                <CardTitle className="text-xl font-semibold">
                  {status === 'loading' && 'Confirmando email...'}
                  {status === 'success' && 'Email confirmado!'}
                  {status === 'error' && 'Erro na confirmação'}
                </CardTitle>
                <CardDescription className="mt-2">
                  {message}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {status === 'success' && (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Redirecionando automaticamente...
                  </p>
                  <Button
                    onClick={() => navigate(next)}
                    className="w-full btn-primary"
                  >
                    Continuar para o ChatConta
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-3">
                  <Button
                    onClick={handleResendConfirmation}
                    className="w-full btn-primary"
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Reenviando...
                      </>
                    ) : (
                      'Tentar novamente'
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Button>
                </div>
              )}

              {status === 'loading' && (
                <div className="text-center">
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}