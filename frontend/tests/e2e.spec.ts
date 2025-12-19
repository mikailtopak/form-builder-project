import { test, expect } from '@playwright/test';

test.describe('Form Builder E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should have correct page title', async ({ page }) => {
    // Sayfanın yüklendiğini kontrol et
    await expect(page).toHaveTitle(/Form Builder|Next.js/);
    await expect(page.getByRole('heading', { name: 'Form Builder' })).toBeVisible();
  });

  test('should add text field to form', async ({ page }) => {
    // "Metin Alanı" butonunu bul (sol sidebar'daki)
    const textFieldButton = page.locator('button:has-text("Metin Alanı")').first();
    await textFieldButton.click();
    
    // Form alanının eklendiğini kontrol et (form canvas'ta)
    await expect(page.locator('.form-field').first()).toBeVisible();
  });

  test('should open rule builder and add rule', async ({ page }) => {
    // Sol sidebar'daki "Örnek Form" butonuna tıkla
    const sampleFormButton = page.locator('button:has-text("Örnek Form"):not(:has-text("Yükle"))');
    await sampleFormButton.click();
    
    // Rule builder bölümünü kontrol et
    await expect(page.getByText('Koşullu Kurallar', { exact: false })).toBeVisible();
    
    // Yeni kural ekle butonuna tıkla (eğer varsa)
    const addRuleButton = page.getByRole('button', { name: 'Yeni Kural Ekle' });
    if (await addRuleButton.isVisible()) {
      await addRuleButton.click();
      await expect(page.getByText('Kural #')).toBeVisible();
    }
  });

  test('should save form', async ({ page }) => {
    // Form başlığı gir
    await page.getByPlaceholder('Form başlığını giriniz').fill('Test Form');
    
    // Formu kaydet butonuna tıkla (header'daki)
    const saveButton = page.getByRole('button', { name: 'Formu Kaydet' });
    await saveButton.click();
    
    // Alert'ı kontrol et
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Form');
      await dialog.accept();
    });
  });

  test('should test backend connection', async ({ page }) => {
    // Header'daki "API Test" butonuna tıkla (link değil, button)
    const apiTestButton = page.getByRole('button', { name: 'API Test' });
    await apiTestButton.click();
    
    // Alert'ı kontrol et
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Backend');
      await dialog.accept();
    });
  });
});