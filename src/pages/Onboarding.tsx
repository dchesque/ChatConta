import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserPlan, PLAN_CONFIGS } from '@/types/userProfile';
import { CheckCircle, Sparkles, Crown, Clock, DollarSign, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { GLASSMORPHISM, ANIMATIONS } from '@/constants/designSystem';
import { toast } from 'sonner';
// import Confetti from 'react-confetti';

interface OnboardingData {
  name: string;
  email: string;
  plan: UserPlan;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: '',
    email: '',
    plan: 'trial'
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step === 1) {
      if (!data.name.trim()) {
        toast.error('Por favor, digite seu nome');
        return;
      }
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePlanSelect = (plan: UserPlan) => {
    setData(prev => ({ ...prev, plan }));
    
    // Mostrar confetti para trial e premium
    if (plan === 'trial' || plan === 'premium') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    handleNext();
  };

  const handleFinish = async () => {
    setLoading(true);
    
    try {
      // Simular salvamento dos dados
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Conta configurada com sucesso!', {
        description: `Bem-vindo ao plano ${PLAN_CONFIGS[data.plan].name}!`
      });
      
      // Redirecionar para dashboard
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao finalizar configuração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Confetti - temporariamente desabilitado */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="text-4xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Blur backgrounds */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bem-vindo ao ChatConta! 🎉
            </h1>
              <p className="text-muted-foreground mt-2">
                Vamos configurar sua conta em 30 segundos
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Passo {step} de {totalSteps}
              </p>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`${GLASSMORPHISM.card} ${GLASSMORPHISM.cardHover} ${ANIMATIONS.smooth}`}>
              {step === 1 && (
                <>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>Vamos nos conhecer</CardTitle>
                    <CardDescription>
                      Conte um pouco sobre você
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                        className={GLASSMORPHISM.input}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email (opcional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                        className={GLASSMORPHISM.input}
                        placeholder="seu@email.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        Para receber relatórios e notificações
                      </p>
                    </div>

                    <Button
                      onClick={handleNext}
                      className="w-full btn-primary"
                      size="lg"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Continuar
                    </Button>
                  </CardContent>
                </>
              )}

              {step === 2 && (
                <>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>Escolha seu plano</CardTitle>
                    <CardDescription>
                      Selecione o plano ideal para você
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Trial Plan */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all duration-300 border-2 hover:border-blue-500 relative ${
                            data.plan === 'trial' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200'
                          }`}
                          onClick={() => handlePlanSelect('trial')}
                        >
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Recomendado
                          </div>
                          <CardHeader className="text-center">
                            <div className="mx-auto w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">Teste Grátis</CardTitle>
                            <div className="text-2xl font-bold text-blue-600">14 dias</div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center">
                                <Check className="w-3 h-3 text-green-600 mr-2" />
                                <span>50 contas a pagar</span>
                              </div>
                              <div className="flex items-center">
                                <Check className="w-3 h-3 text-green-600 mr-2" />
                                <span>20 fornecedores</span>
                              </div>
                              <div className="flex items-center">
                                <Check className="w-3 h-3 text-green-600 mr-2" />
                                <span>Relatórios básicos</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Free Plan */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all duration-300 border-2 hover:border-gray-500 ${
                            data.plan === 'free' ? 'border-gray-500 bg-gray-50/50' : 'border-gray-200'
                          }`}
                          onClick={() => handlePlanSelect('free')}
                        >
                          <CardHeader className="text-center">
                            <div className="mx-auto w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                              <CheckCircle className="w-4 h-4 text-gray-600" />
                            </div>
                            <CardTitle className="text-lg">Grátis</CardTitle>
                            <div className="text-2xl font-bold text-gray-600">R$ 0</div>
                            <p className="text-xs text-muted-foreground">para sempre</p>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center">
                                <Check className="w-3 h-3 text-green-600 mr-2" />
                                <span>10 contas/mês</span>
                              </div>
                              <div className="flex items-center">
                                <Check className="w-3 h-3 text-green-600 mr-2" />
                                <span>5 fornecedores</span>
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <span className="w-3 h-3 mr-2">✗</span>
                                <span>Relatórios limitados</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Premium Plan */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all duration-300 border-2 hover:border-yellow-500 ${
                            data.plan === 'premium' ? 'border-yellow-500 bg-yellow-50/50' : 'border-gray-200'
                          }`}
                          onClick={() => handlePlanSelect('premium')}
                        >
                          <CardHeader className="text-center">
                            <div className="mx-auto w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center mb-2">
                              <Crown className="w-4 h-4 text-white" />
                            </div>
                            <CardTitle className="text-lg">Premium</CardTitle>
                            <div className="text-2xl font-bold text-yellow-600">R$ 29,90</div>
                            <p className="text-xs text-muted-foreground">por mês</p>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center">
                                <Check className="w-3 h-3 text-green-600 mr-2" />
                                <span>Tudo ilimitado</span>
                              </div>
                              <div className="flex items-center">
                                <Check className="w-3 h-3 text-green-600 mr-2" />
                                <span>Todos os relatórios</span>
                              </div>
                              <div className="flex items-center">
                                <Check className="w-3 h-3 text-green-600 mr-2" />
                                <span>Exportação e backup</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </CardContent>
                </>
              )}

              {step === 3 && (
                <>
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Tudo pronto! 🚀</CardTitle>
                    <CardDescription>
                      Seu plano {PLAN_CONFIGS[data.plan].name} está configurado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-center">
                    <div className="bg-green-50/80 backdrop-blur-sm rounded-xl p-4 border border-green-200/50">
                      <h3 className="font-semibold text-green-800 mb-2">
                        Plano {PLAN_CONFIGS[data.plan].name} Ativado
                      </h3>
                      {data.plan === 'trial' && (
                        <p className="text-green-700 text-sm">
                          Você tem 14 dias para testar todas as funcionalidades
                        </p>
                      )}
                      {data.plan === 'premium' && (
                        <p className="text-green-700 text-sm">
                          Acesso completo a todas as funcionalidades premium
                        </p>
                      )}
                      {data.plan === 'free' && (
                        <p className="text-green-700 text-sm">
                          Comece a usar o plano gratuito agora mesmo
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleFinish}
                      className="w-full btn-primary"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Finalizando...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Ir para o Dashboard
                        </>
                      )}
                    </Button>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}