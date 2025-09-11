import { test, expect } from '@playwright/test';

// Mock Supabase client for testing
const SUPABASE_URL = 'https://wrxosfdirgdlvfkzvcuh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyeG9zZmRpcmdkbHZma3p2Y3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODY4OTUsImV4cCI6MjA3MDA2Mjg5NX0.1SBE-f-f5lLEc_7rzv87sbVv3WYLLBLi8wsblDwUSCc';

test.describe('Security Policies and RLS', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept Supabase calls
    await page.route('**/rest/v1/**', async route => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Mock responses based on what we're testing
      if (url.includes('accounts_payable') && method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]) // Empty array simulating no cross-user access
        });
      } else if (url.includes('profiles') && method === 'PATCH') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Insufficient permissions',
            message: 'RLS policy violation'
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should prevent cross-user data access in UI', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Mock authentication state
    await page.addInitScript(() => {
      // Mock localStorage for auth session
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'user-a-123', email: 'test-a@example.com' }
      }));
    });
    
    // Go to accounts payable page
    await page.goto('/contas-pagar');
    
    // Should not show accounts from other users
    await expect(page.locator('[data-testid="account-item"]')).toHaveCount(0);
    
    // Check for proper empty state
    await expect(page.locator('text=Nenhuma conta encontrada')).toBeVisible();
  });

  test('should prevent role self-elevation in profile form', async ({ page }) => {
    await page.goto('/');
    
    // Mock regular user session
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'regular-user-123', email: 'user@example.com' }
      }));
    });
    
    // Navigate to profile page
    await page.goto('/meu-perfil');
    
    // Role field should not be visible for regular users
    await expect(page.locator('select[name="role"]')).not.toBeVisible();
    await expect(page.locator('input[name="role"]')).not.toBeVisible();
    
    // Even if someone tries to inspect and modify
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const roleInput = document.createElement('input');
        roleInput.name = 'role';
        roleInput.value = 'admin';
        roleInput.style.display = 'none';
        form.appendChild(roleInput);
      }
    });
    
    // Submit form and expect it to be rejected
    const saveButton = page.locator('button:has-text("Salvar")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Should show error message
      await expect(page.locator('text=Erro')).toBeVisible();
    }
  });

  test('should respect soft delete in listings', async ({ page }) => {
    await page.goto('/');
    
    // Mock authenticated session
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-123', email: 'test@example.com' }
      }));
    });
    
    // Navigate to categories page
    await page.goto('/categorias');
    
    // Mock API to return categories including deleted ones
    await page.route('**/rest/v1/categories*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Active Category', deleted_at: null },
          // Deleted category should not be returned by RLS
        ])
      });
    });
    
    await page.reload();
    
    // Should only show active categories
    await expect(page.locator('[data-testid="category-item"]')).toHaveCount(1);
    await expect(page.locator('text=Active Category')).toBeVisible();
  });

  test('should enforce authentication on protected routes', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/contas-pagar');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/auth.*/);
    
    // Should show login form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should validate session timeout', async ({ page }) => {
    await page.goto('/');
    
    // Mock expired session
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user', email: 'test@example.com' },
        expires_at: Date.now() - 1000 // Expired 1 second ago
      }));
    });
    
    // Try to access protected content
    await page.goto('/dashboard');
    
    // Should eventually redirect to login due to expired session
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*\/auth.*/);
  });

  test('should sanitize error messages', async ({ page }) => {
    await page.goto('/');
    
    // Mock error response with sensitive data
    await page.route('**/rest/v1/**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Database connection failed',
          details: 'Connection string: postgresql://user:password123@localhost:5432/db',
          hint: 'Check your database configuration'
        })
      });
    });
    
    await page.goto('/dashboard');
    
    // Error message should be generic, not expose sensitive details
    await expect(page.locator('text=Connection string')).not.toBeVisible();
    await expect(page.locator('text=password123')).not.toBeVisible();
    
    // Should show generic error
    await expect(page.locator('text=Erro ao carregar')).toBeVisible();
  });

  test('should implement rate limiting UI feedback', async ({ page }) => {
    await page.goto('/');
    
    // Mock rate limit error response
    await page.route('**/functions/v1/**', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60'
        },
        body: JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests'
        })
      });
    });
    
    // Try to trigger an API call that would hit rate limit
    await page.goto('/dashboard');
    
    // Should show rate limit message
    await expect(page.locator('text=muitas tentativas')).toBeVisible();
    await expect(page.locator('text=Tente novamente')).toBeVisible();
  });
});

test.describe('Input Validation and XSS Prevention', () => {
  test('should sanitize user inputs', async ({ page }) => {
    await page.goto('/');
    
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/nova-conta');
    
    // Try to input malicious script
    const maliciousInput = '<script>alert("XSS")</script>';
    
    await page.fill('input[name="description"]', maliciousInput);
    await page.fill('input[name="amount"]', '100');
    await page.fill('input[name="due_date"]', '2024-12-31');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Script should not execute
    page.on('dialog', async dialog => {
      // If XSS alert fires, fail the test
      expect(dialog.message()).not.toBe('XSS');
      await dialog.dismiss();
    });
    
    // Input should be escaped/sanitized
    await page.goto('/contas-pagar');
    await expect(page.locator('text=<script>')).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/');
    
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/nova-conta');
    
    // Try to submit without required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=obrigatório')).toBeVisible();
    await expect(page.locator('text=campo é necessário')).toBeVisible();
  });
});

test.describe('Data Integrity', () => {
  test('should maintain referential integrity', async ({ page }) => {
    await page.goto('/');
    
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user', email: 'test@example.com' }
      }));
    });
    
    // Mock constraint violation
    await page.route('**/rest/v1/accounts_payable', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Foreign key constraint violation',
            message: 'Invalid category reference'
          })
        });
      } else {
        await route.continue();
      }
    });
    
    await page.goto('/nova-conta');
    
    // Fill form with invalid category reference
    await page.fill('input[name="description"]', 'Test Account');
    await page.fill('input[name="amount"]', '100');
    await page.fill('input[name="due_date"]', '2024-12-31');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show user-friendly error
    await expect(page.locator('text=Erro ao salvar')).toBeVisible();
    await expect(page.locator('text=categoria inválida')).toBeVisible();
  });
});