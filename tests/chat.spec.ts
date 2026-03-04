import { test, expect } from '@playwright/test';
import { mockApi, mockChatError, mockChatWithMarkdown } from './helpers';

test.describe('Chat interactions', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
  });

  test('sends a message via send button and displays the response', async ({ page }) => {
    await page.fill('#messageInput', 'Hello bot');
    await page.click('#sendButton');

    // User message appears
    const userMsg = page.locator('.message.user .message-content');
    await expect(userMsg).toHaveText('Hello bot');

    // Assistant response appears (mocked echo)
    const assistantMsg = page.locator('.message.assistant .message-content');
    await expect(assistantMsg.last()).toContainText('Echo: Hello bot');
  });

  test('sends a message via Enter key', async ({ page }) => {
    await page.fill('#messageInput', 'Enter test');
    await page.press('#messageInput', 'Enter');

    await expect(page.locator('.message.user .message-content')).toHaveText('Enter test');
    await expect(page.locator('.message.assistant .message-content').last()).toContainText('Echo: Enter test');
  });

  test('does not send an empty message', async ({ page }) => {
    await page.click('#sendButton');

    // No messages should appear
    await expect(page.locator('.message')).toHaveCount(0);
  });

  test('clears input after sending', async ({ page }) => {
    await page.fill('#messageInput', 'Clear me');
    await page.click('#sendButton');

    await expect(page.locator('#messageInput')).toHaveValue('');
  });

  test('refocuses input after response completes', async ({ page }) => {
    await page.fill('#messageInput', 'Focus test');
    await page.click('#sendButton');

    // Wait for the assistant response to appear
    await expect(page.locator('.message.assistant .message-content').last()).toContainText('Echo:');

    await expect(page.locator('#messageInput')).toBeFocused();
  });

  test('displays user avatar initials on messages', async ({ page }) => {
    await page.fill('#messageInput', 'Avatar test');
    await page.click('#sendButton');

    const userAvatar = page.locator('.message.user .message-avatar');
    await expect(userAvatar).toBeVisible();
    // Should show initials from the user name
    const text = await userAvatar.textContent();
    expect(text!.length).toBeGreaterThan(0);
  });

  test('displays assistant avatar on responses', async ({ page }) => {
    await page.fill('#messageInput', 'Avatar test');
    await page.click('#sendButton');

    const assistantAvatar = page.locator('.message.assistant .message-avatar').last();
    await expect(assistantAvatar).toHaveText('E');
  });
});

test.describe('Chat error handling', () => {
  test('displays error from SSE error event', async ({ page }) => {
    // Mock session first, then override chat
    await mockApi(page);
    await mockChatError(page, 'Backend exploded');
    await page.goto('/');

    await page.fill('#messageInput', 'trigger error');
    await page.click('#sendButton');

    const error = page.locator('.error-message');
    await expect(error).toContainText('Backend exploded');
  });

  test('displays error when server returns non-200', async ({ page }) => {
    await page.route('**/api/sessions', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sessionId: 'test' }),
      }),
    );
    await page.route('**/api/chat', (route) =>
      route.fulfill({ status: 500, body: 'Internal Server Error' }),
    );
    await page.goto('/');

    await page.fill('#messageInput', 'will fail');
    await page.click('#sendButton');

    const error = page.locator('.error-message');
    await expect(error).toContainText('Server error: 500');
  });
});

test.describe('Markdown rendering', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('renders headings in assistant response', async ({ page }) => {
    await mockChatWithMarkdown(page, '## My Heading\nSome text');
    await page.goto('/');

    await page.fill('#messageInput', 'md test');
    await page.click('#sendButton');

    const h2 = page.locator('.message.assistant .message-content h2');
    await expect(h2).toHaveText('My Heading');
  });

  test('renders code blocks', async ({ page }) => {
    await mockChatWithMarkdown(page, '```js\nconsole.log("hi");\n```');
    await page.goto('/');

    await page.fill('#messageInput', 'code test');
    await page.click('#sendButton');

    const pre = page.locator('.message.assistant .message-content pre');
    await expect(pre).toBeVisible();
    await expect(pre).toContainText('console.log');
  });

  test('renders bold and italic text', async ({ page }) => {
    await mockChatWithMarkdown(page, '**bold** and *italic*');
    await page.goto('/');

    await page.fill('#messageInput', 'format test');
    await page.click('#sendButton');

    const content = page.locator('.message.assistant .message-content').last();
    await expect(content.locator('strong')).toHaveText('bold');
    await expect(content.locator('em')).toHaveText('italic');
  });

  test('renders lists', async ({ page }) => {
    await mockChatWithMarkdown(page, '- item one\n- item two\n- item three');
    await page.goto('/');

    await page.fill('#messageInput', 'list test');
    await page.click('#sendButton');

    const items = page.locator('.message.assistant .message-content li');
    await expect(items).toHaveCount(3);
  });
});
