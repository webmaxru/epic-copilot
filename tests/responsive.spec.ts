import { test, expect } from '@playwright/test';
import { mockApi } from './helpers';

test.describe('Responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('sidebar is visible on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('sidebar is hidden on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    await page.goto('/');

    await expect(page.locator('.sidebar')).toBeHidden();
  });

  test('main content fills width when sidebar is hidden', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    await page.goto('/');

    const main = page.locator('.main-content');
    const box = await main.boundingBox();
    expect(box!.x).toBeLessThanOrEqual(5); // should start at or near left edge
  });

  test('chat input and send button remain usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('#messageInput')).toBeVisible();
    await expect(page.locator('#sendButton')).toBeVisible();

    await page.fill('#messageInput', 'mobile message');
    await page.click('#sendButton');

    await expect(page.locator('.message.user .message-content')).toHaveText('mobile message');
  });
});
