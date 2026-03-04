import { test, expect } from '@playwright/test';
import { mockApi } from './helpers';

test.describe('Page layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
  });

  test('renders the header with logo and title', async ({ page }) => {
    await expect(page.locator('.header-logo')).toHaveText('E');
    await expect(page.locator('.header-title').first()).toContainText('Epic Copilot');
  });

  test('shows connected status indicator', async ({ page }) => {
    await expect(page.locator('.header-status')).toContainText('Connected');
    await expect(page.locator('.status-dot')).toBeVisible();
  });

  test('displays user name and avatar', async ({ page }) => {
    const userName = page.locator('#userName');
    await expect(userName).not.toHaveText('Loading...');
    await expect(page.locator('#userAvatar')).toBeVisible();
  });

  test('renders the sidebar with all sections', async ({ page }) => {
    await expect(page.locator('.sidebar')).toBeVisible();

    const sectionTitles = page.locator('.sidebar-section-title');
    await expect(sectionTitles).toHaveCount(3);
    await expect(sectionTitles.nth(0)).toHaveText('Custom Agents');
    await expect(sectionTitles.nth(1)).toHaveText('Saved Prompts');
    await expect(sectionTitles.nth(2)).toHaveText('Agent Skills');
  });

  test('renders six custom agents in the sidebar', async ({ page }) => {
    const agents = page.locator('.agent-item');
    await expect(agents).toHaveCount(6);
    await expect(agents.nth(0)).toContainText('Product Owner');
    await expect(agents.nth(5)).toContainText('DevOps Engineer');
  });

  test('renders six saved prompts', async ({ page }) => {
    const prompts = page.locator('.task-item');
    await expect(prompts).toHaveCount(6);
  });

  test('renders agent skills with badges', async ({ page }) => {
    const skills = page.locator('.skill-item');
    await expect(skills).toHaveCount(5);
    await expect(page.locator('.sidebar-badge.skill-tag').first()).toHaveText('built-in');
  });

  test('renders the welcome card', async ({ page }) => {
    await expect(page.locator('.welcome-card h2')).toHaveText('Welcome to Epic Copilot');
    await expect(page.locator('.welcome-card p')).toContainText('AI assistant');
  });

  test('renders four quick action buttons', async ({ page }) => {
    const actions = page.locator('.quick-action');
    await expect(actions).toHaveCount(4);
  });

  test('renders chat input and send button', async ({ page }) => {
    await expect(page.locator('#messageInput')).toBeVisible();
    await expect(page.locator('#sendButton')).toBeVisible();
  });

  test('chat input is focused on load', async ({ page }) => {
    await expect(page.locator('#messageInput')).toBeFocused();
  });

  test('renders toolbar with clear and new session buttons', async ({ page }) => {
    await expect(page.locator('#clearChatBtn')).toHaveText('Clear Chat');
    await expect(page.locator('#newSessionBtn')).toHaveText('New Session');
  });
});
