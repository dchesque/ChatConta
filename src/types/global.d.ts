// Declarações globais para Analytics e Performance

declare global {
  // Google Analytics gtag
  function gtag(command: string, targetId: string, config?: any): void;
  function gtag(command: 'event', eventName: string, eventParameters?: any): void;
  function gtag(command: 'config', targetId: string, config?: any): void;
  
  // Facebook Pixel
  function fbq(command: string, eventName: string, parameters?: any): void;
  
  // Performance API extensions
  interface PerformanceEntry {
    processingStart?: number;
    hadRecentInput?: boolean;
    value?: number;
  }
  
  interface Window {
    gtag?: typeof gtag;
    fbq?: typeof fbq;
    gc?: () => void;
  }
}

export {};