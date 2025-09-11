import React from 'react';
import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Mock do useToast
const mockToast = {
  toast: vi.fn(),
  dismiss: vi.fn(),
  update: vi.fn()
};

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => mockToast,
  toast: mockToast.toast
}));

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({
        data: [],
        error: null
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      }))
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({
        data: { session: null },
        error: null
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    }
  }
}));

// Mock do React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default'
    })
  };
});

// Mock do Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => React.createElement('div', props),
    span: (props: any) => React.createElement('span', props),
    button: (props: any) => React.createElement('button', props)
  },
  AnimatePresence: (props: any) => props.children
}));

// Mock de APIs do navegador
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock do IntersectionObserver  
(global as any).IntersectionObserver = class {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
  takeRecords() { return []; }
};

// Mock do ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Limpar mocks após cada teste
afterEach(() => {
  vi.clearAllMocks();
});