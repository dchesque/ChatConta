import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { DESIGN_SYSTEM, MENSAGENS, type StatusType } from '@/constants/designSystem';
import { formatarMoeda, formatarData, aplicarMascaraCPF, aplicarMascaraTelefone } from '@/lib/formatacaoBrasileira';
import { 
  Palette, 
  Eye, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  Play,
  Pause
} from 'lucide-react';

const statusOptions: StatusType[] = ['ativo', 'inativo', 'pendente', 'pago', 'vencido', 'cancelado', 'processando'];

export default function DesignSystemPreview() {
  const [modalAberto, setModalAberto] = useState(false);
  const [inputValues, setInputValues] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    valor: '',
    email: ''
  });

  return (
    <div className="min-h-screen bg-abstract-blur container-responsive">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Design System Premium
          </h1>
          <p className="text-lg text-gray-600">
            Padrões brasileiros com glassmorphism - Fase 1 Completa ✨
          </p>
        </div>

        {/* Seção 1: Botões */}
        <section className="glassmorphism-card p-8">
          <div className="flex items-center mb-6">
            <Palette className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold">Botões com Gradientes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="default">Primário</Button>
            <Button variant="success">Sucesso</Button>
            <Button variant="destructive">Erro</Button>
            <Button variant="warning">Aviso</Button>
            <Button variant="premium">Premium</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="secondary">Secundário</Button>
            <Button loading>Carregando...</Button>
          </div>
        </section>

        {/* Seção 2: Status Badges */}
        <section className="glassmorphism-card p-8">
          <div className="flex items-center mb-6">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-semibold">Status Badges Brasileiros</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {statusOptions.map((status) => (
              <Badge key={status} status={status} showDot>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            ))}
          </div>
        </section>

        {/* Seção 3: Cards Glassmorphism */}
        <section className="space-y-6">
          <div className="flex items-center mb-6">
            <CreditCard className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-2xl font-semibold">Cards com Glassmorphism</h2>
          </div>
          
          <div className="grid-responsive-cards">
            <Card variant="default" className="p-6 hover-lift">
              <h3 className="text-xl font-semibold mb-2">Card Padrão</h3>
              <p className="text-gray-600 mb-4">
                Com glassmorphism e hover effects automáticos
              </p>
              <div className="text-moeda text-2xl font-bold text-green-600">
                {formatarMoeda(12345.67)}
              </div>
            </Card>

            <Card variant="metric" className="hover-lift">
              <h3 className="text-lg font-semibold mb-2">Métrica</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatarMoeda(8750)}
              </div>
              <p className="text-sm text-gray-500">
                Atualizado em {formatarData(new Date())}
              </p>
            </Card>

            <Card variant="dashboard" className="p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Dashboard</h3>
                <Eye className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Receitas:</span>
                  <span className="text-moeda font-semibold text-green-600">
                    {formatarMoeda(15000)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Despesas:</span>
                  <span className="text-moeda font-semibold text-red-600">
                    {formatarMoeda(8500)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Seção 4: Inputs Brasileiros */}
        <section className="glassmorphism-card p-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
            <h2 className="text-2xl font-semibold">Inputs com Formatação Brasileira</h2>
          </div>
          
          <div className="grid-responsive-form space-y-4">
            <Input
              label="Nome Completo"
              placeholder="Digite seu nome"
              obrigatorio
              value={inputValues.nome}
              onChange={(e) => setInputValues(prev => ({ ...prev, nome: e.target.value }))}
            />
            
            <Input
              label="CPF"
              placeholder="000.000.000-00"
              obrigatorio
              mascara={aplicarMascaraCPF}
              value={inputValues.cpf}
              onChange={(e) => setInputValues(prev => ({ ...prev, cpf: e.target.value }))}
            />
            
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              mascara={aplicarMascaraTelefone}
              value={inputValues.telefone}
              onChange={(e) => setInputValues(prev => ({ ...prev, telefone: e.target.value }))}
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              helper="Usaremos para enviar notificações"
              value={inputValues.email}
              onChange={(e) => setInputValues(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </section>

        {/* Seção 5: Formatação Brasileira */}
        <section className="glassmorphism-card p-8">
          <div className="flex items-center mb-6">
            <Clock className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold">Formatação Brasileira</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Moeda</h4>
              <div className="text-moeda text-lg">
                {formatarMoeda(1234567.89)}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Data</h4>
              <div className="text-data">
                {formatarData(new Date())}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">CPF</h4>
              <div className="font-mono">
                {aplicarMascaraCPF('12345678901')}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Telefone</h4>
              <div className="font-mono">
                {aplicarMascaraTelefone('11999887766')}
              </div>
            </div>
          </div>
        </section>

        {/* Seção 6: Modal */}
        <section className="glassmorphism-card p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <XCircle className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-semibold">Modal Glassmorphism</h2>
            </div>
            <Button onClick={() => setModalAberto(true)}>
              Abrir Modal
            </Button>
          </div>
          
          <p className="text-gray-600">
            Modal com estrutura flex perfeita, backdrop-blur e responsividade mobile.
          </p>
        </section>

        {/* Seção 7: Responsividade */}
        <section className="glassmorphism-card p-8">
          <div className="flex items-center mb-6">
            <Play className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-semibold">Responsividade</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200/50">
              <strong>Mobile:</strong> &lt; 1024px (lg) - Layout stack, modals fullscreen
            </div>
            <div className="p-4 bg-green-50/80 rounded-xl border border-green-200/50">
              <strong>Desktop:</strong> ≥ 1024px (lg) - Layout grid, modals centrados
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            Design System Premium - Fase 1 100% Completa ✅
          </p>
        </div>
      </div>

      {/* Modal de Demonstração */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Modal Premium"
        subtitle="Demonstração do modal com glassmorphism"
        icon={<Palette className="w-6 h-6 text-blue-600" />}
        footer={
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModalAberto(false)}>
              Confirmar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Este modal demonstra todos os padrões implementados:
          </p>
          
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Glassmorphism com backdrop-blur-xl
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Estrutura flex perfeita (header/content/footer)
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Responsividade mobile completa
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Padrões brasileiros de formatação
            </li>
          </ul>
          
          <div className="p-4 bg-green-50/80 rounded-xl border border-green-200/50">
            <p className="text-sm font-medium text-green-800">
              ✨ Fase 1 - Design System Premium implementado com sucesso!
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}