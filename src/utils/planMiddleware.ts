export const requiresPremium = (feature: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      // Verificar se o usuário tem plano premium
      const userPlan = localStorage.getItem('user_plan') || 'free';
      
      if (userPlan !== 'premium') {
        // Mostrar modal de upgrade com DOM seguro
        const upgradeModal = document.createElement('div');
        upgradeModal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white p-6 rounded-xl max-w-md mx-4';
        
        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold mb-2';
        title.textContent = 'Recurso Premium';
        
        const message = document.createElement('p');
        message.className = 'text-gray-600 mb-4';
        message.textContent = `O recurso "${feature}" está disponível apenas para assinantes Premium.`;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex space-x-3';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'px-4 py-2 bg-gray-200 rounded';
        cancelButton.textContent = 'Cancelar';
        cancelButton.addEventListener('click', () => {
          document.body.removeChild(upgradeModal);
        });
        
        const upgradeButton = document.createElement('button');
        upgradeButton.className = 'px-4 py-2 bg-blue-600 text-white rounded';
        upgradeButton.textContent = 'Fazer Upgrade';
        upgradeButton.addEventListener('click', () => {
          window.open('https://wa.me/5511999999999?text=Quero fazer upgrade para Premium', '_blank');
        });
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(upgradeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(message);
        modalContent.appendChild(buttonContainer);
        upgradeModal.appendChild(modalContent);
        document.body.appendChild(upgradeModal);
        return;
      }
      
      return originalMethod.apply(this, args);
    };
  };
};