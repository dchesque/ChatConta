import React, { useState, useRef, useEffect } from 'react';
import { Camera, User, Save, Shield, Loader2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useFormulario } from '@/hooks/useFormulario';
import { useMascaras } from '@/hooks/useMascaras';
import { useProfileData, type DadosPerfil } from '@/hooks/useProfileData';
import { InputValidacao } from '@/components/ui/InputValidacao';
import { VALIDACOES_COMUNS } from '@/utils/validacoes';
import { SecurityTab } from '@/components/configuracoes/SecurityTab';
import { ProfileHeader } from '@/components/configuracoes/ProfileHeader';

export default function MeuPerfil() {
  const { user } = useAuth();
  const { aplicarMascaraTelefone, aplicarMascaraCEP } = useMascaras();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    dadosPerfil,
    setDadosPerfil,
    carregando,
    salvando,
    uploadingAvatar,
    carregandoCEP,
    buscarEnderecoPorCEP,
    uploadAvatar,
    salvarPerfil
  } = useProfileData();

  // Esquema de validação
  const esquemaValidacao = {
    nome: [{ validador: VALIDACOES_COMUNS.NOME, mensagem: '' }],
    email: [{ validador: VALIDACOES_COMUNS.EMAIL, mensagem: '' }],
    telefone: [{ validador: VALIDACOES_COMUNS.TELEFONE, mensagem: '' }],
    whatsapp: [{ validador: VALIDACOES_COMUNS.TELEFONE, mensagem: '' }],
    cep: [{ validador: VALIDACOES_COMUNS.CEP, mensagem: '' }]
  };

  // Hook do formulário - sincronizar com dados do perfil
  const {
    dados,
    alterarCampo,
    alterarCampos,
    estaCarregando,
    salvar,
    erros
  } = useFormulario(
    dadosPerfil, // usar dados carregados do Supabase
    async (dadosForm) => {
      await salvarPerfil(dadosForm);
    },
    esquemaValidacao
  );

  // Flag para controlar sincronização inicial
  const [inicializado, setInicializado] = useState(false);

  // Sincronizar dados do perfil com o formulário APENAS na inicialização
  useEffect(() => {
    if (dadosPerfil && !inicializado && (dadosPerfil.email || Object.keys(dadosPerfil).some(key => dadosPerfil[key as keyof DadosPerfil]))) {
      // Sincronização inicial dos dados do perfil
      alterarCampos(dadosPerfil);
      setInicializado(true);
    }
  }, [dadosPerfil, inicializado, alterarCampos]);

  // Upload de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const avatarUrl = await uploadAvatar(file);
      if (avatarUrl) {
        alterarCampo('avatar_url', avatarUrl);
      }
    }
  };

  // Busca automática de endereço por CEP
  const handleCEPChange = async (value: string) => {
    const cepFormatado = aplicarMascaraCEP(value);
    
    // Atualizar o campo CEP no formulário imediatamente
    alterarCampo('cep', cepFormatado);
    
    if (cepFormatado.replace(/\D/g, '').length === 8) {
      // CEP completo, iniciando busca
      const endereco = await buscarEnderecoPorCEP(cepFormatado);
      
      if (endereco) {
        // Endereço encontrado, atualizando formulário
        alterarCampos({
          endereco: endereco.logradouro || '',
          cidade: endereco.cidade || '',
          estado: endereco.estado || ''
        });
      }
      // Silenciosamente falhar se endereço não encontrado
    }
  };

  const breadcrumb = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Meu Perfil', icon: <User className="w-4 h-4" /> }
  ];

  if (carregando) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Carregando dados do perfil...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={breadcrumb}
        title="Meu Perfil"
        subtitle="Gerencie suas informações pessoais e configurações"
        icon={<User className="w-6 h-6" />}
      />

      <ProfileHeader />

      <div className="space-y-6">
        <Tabs defaultValue="dados-pessoais" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 glassmorphism-card p-1">
            <TabsTrigger value="dados-pessoais" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Dados Pessoais</span>
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Segurança</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba: Dados Pessoais */}
          <TabsContent value="dados-pessoais" className="space-y-6">
            <Card className="glassmorphism-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e foto de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage 
                        src={dados.avatar_url} 
                        alt="Avatar do usuário" 
                      />
                      <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {dados.nome.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Label 
                      htmlFor="avatar-upload" 
                      className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 border border-gray-200"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-gray-600" />
                      )}
                    </Label>
                    <input
                      ref={fileInputRef}
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{dados.nome || 'Nome não informado'}</h3>
                    <p className="text-muted-foreground">{dados.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {uploadingAvatar ? 'Enviando imagem...' : 'Clique na câmera para alterar sua foto'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Formulário de dados pessoais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <InputValidacao
                      id="nome"
                      label="Nome Completo"
                      obrigatorio
                      value={dados.nome}
                      onChange={(e) => alterarCampo('nome', e.target.value)}
                      placeholder="Seu nome completo"
                      validacao={VALIDACOES_COMUNS.NOME}
                      erro={erros.nome}
                    />
                  </div>

                  <div className="space-y-2">
                    <InputValidacao
                      id="email"
                      label="Email"
                      type="email"
                      value={dados.email}
                      onChange={(e) => alterarCampo('email', e.target.value)}
                      placeholder="seu@email.com"
                      validacao={VALIDACOES_COMUNS.EMAIL}
                      erro={erros.email}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <InputValidacao
                      id="telefone"
                      label="Telefone"
                      value={dados.telefone}
                      onChange={(e) => alterarCampo('telefone', aplicarMascaraTelefone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      validacao={VALIDACOES_COMUNS.TELEFONE}
                      erro={erros.telefone}
                    />
                  </div>

                  <div className="space-y-2">
                    <InputValidacao
                      id="whatsapp"
                      label="WhatsApp"
                      value={dados.whatsapp}
                      onChange={(e) => alterarCampo('whatsapp', aplicarMascaraTelefone(e.target.value))}
                      placeholder="(11) 99999-9999"
                      validacao={VALIDACOES_COMUNS.TELEFONE}
                      erro={erros.whatsapp}
                    />
                  </div>

                   <div className="space-y-2">
                     <InputValidacao
                       id="cep"
                       label="CEP"
                       value={dados.cep}
                       onChange={(e) => handleCEPChange(e.target.value)}
                       placeholder="00000-000"
                       validacao={VALIDACOES_COMUNS.CEP}
                       erro={erros.cep}
                       isLoading={carregandoCEP}
                       loadingText="Buscando endereço..."
                     />
                   </div>

                  <div className="space-y-2">
                    <InputValidacao
                      id="endereco"
                      label="Endereço"
                      value={dados.endereco}
                      onChange={(e) => alterarCampo('endereco', e.target.value)}
                      placeholder="Rua, número, complemento"
                    />
                  </div>

                  <div className="space-y-2">
                    <InputValidacao
                      id="cidade"
                      label="Cidade"
                      value={dados.cidade}
                      onChange={(e) => alterarCampo('cidade', e.target.value)}
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div className="space-y-2">
                    <InputValidacao
                      id="estado"
                      label="Estado"
                      value={dados.estado}
                      onChange={(e) => alterarCampo('estado', e.target.value)}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={dados.bio || ''}
                      onChange={(e) => alterarCampo('bio', e.target.value)}
                      placeholder="Conte um pouco sobre você..."
                      rows={3}
                      maxLength={500}
                      className="bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-muted-foreground">
                      {(dados.bio || '').length}/500 caracteres
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => salvar()}
                    disabled={estaCarregando || salvando || uploadingAvatar}
                    className="btn-primary"
                  >
                    {(estaCarregando || salvando) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" />
                    {salvando ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}