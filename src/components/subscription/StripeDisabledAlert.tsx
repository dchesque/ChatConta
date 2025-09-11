import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageCircle, ExternalLink } from 'lucide-react';

export function StripeDisabledAlert() {
  const handleContactSupport = () => {
    const message = encodeURIComponent(
      'Olá! Gostaria de informações sobre os planos Premium e como realizar o pagamento.'
    );
    window.open(`https://wa.me/5544999999999?text=${message}`, '_blank');
  };

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <div className="font-medium mb-1">
              Pagamentos em configuração
            </div>
            <div className="text-sm">
              O sistema de pagamentos está sendo configurado. 
              Entre em contato conosco pelo WhatsApp para assinar o plano Premium.
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleContactSupport}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}