import { test, expect } from '@playwright/test';
import { mockApi } from './helpers';

test.describe('Quick actions', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
  });

  test('clicking a quick action sends its text as a message', async ({ page }) => {
    const firstAction = page.locator('.quick-action').first();
    const actionText = (await firstAction.textContent())!.trim();

    await firstAction.click();

    // User message should appear with the quick action text
    const userMsg = page.locator('.message.user .message-content');
    await expect(userMsg).toContainText(actionText.slice(0, 20)); // check beginning

    // Assistant response should appear
    const assistantMsg = page.locator('.message.assistant .message-content').last();
    await expect(assistantMsg).toBeVisible();
  });

  test('each quick action has an icon', async ({ page }) => {
    const icons = page.locator('.quick-action .quick-action-icon');
    await expect(icons).toHaveCount(4);
  });
});

test.describe('Toolbar actions', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
  });

  test('clear chat removes all messages and welcome card', async ({ page }) => {
    // Send a message first
    await page.fill('#messageInput', 'Before clear');
    await page.click('#sendButton');
    await expect(page.locator('.message')).not.toHaveCount(0);

    // Clear chat
    await page.click('#clearChatBtn');

    // All messages removed (including welcome card)
    await expect(page.locator('.message')).toHaveCount(0);
    await expect(page.locator('.welcome-card')).toHaveCount(0);
  });

  test('new session clears chat and creates a fresh session', async ({ page }) => {
    let sessionRequests = 0;
    await page.route('**/api/sessions', (route) => {
      sessionRequests++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sessionId: `session-${sessionRequests}` }),
      });
    });

    // Wait for initial session
    await page.waitForTimeout(500);

    // Send a message
    await page.fill('#messageInput', 'Before new session');
    await page.click('#sendButton');
    await expect(page.locator('.message.user')).toHaveCount(1);

    // Click new session
    await page.click('#newSessionBtn');

    // Chat should be cleared
    await expect(page.locator('.message')).toHaveCount(0);

    // A second session request should have been made
    expect(sessionRequests).toBeGreaterThanOrEqual(2);
  });
});
