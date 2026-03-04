import { test, expect } from '@playwright/test';
import { mockApi } from './helpers';

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
  });

  test('clicking an agent fills the chat input with its prompt', async ({ page }) => {
    const productOwner = page.locator('.agent-item').first();
    await productOwner.click();

    const input = page.locator('#messageInput');
    await expect(input).toHaveValue(/Product Owner/);
    await expect(input).toBeFocused();
  });

  test('clicking a saved prompt fills the chat input', async ({ page }) => {
    const retro = page.locator('.task-item').first();
    await retro.click();

    await expect(page.locator('#messageInput')).toHaveValue(/sprint retrospective/i);
  });

  test('clicking a skill fills the chat input', async ({ page }) => {
    const adoSkill = page.locator('.skill-item').first();
    await adoSkill.click();

    await expect(page.locator('#messageInput')).toHaveValue(/Azure DevOps/i);
  });

  test('each agent has a colored avatar badge', async ({ page }) => {
    const avatars = page.locator('.agent-item .agent-avatar');
    await expect(avatars).toHaveCount(6);

    const labels = ['PO', 'SM', 'TL', 'QA', 'UX', 'DO'];
    for (let i = 0; i < labels.length; i++) {
      await expect(avatars.nth(i)).toHaveText(labels[i]);
    }
  });

  test('add new skill button opens prompt dialog', async ({ page }) => {
    // Mock window.prompt to return a skill name, then empty for description
    await page.evaluate(() => {
      let callCount = 0;
      window.prompt = () => {
        callCount++;
        if (callCount === 1) return 'My Skill';
        return 'Does things';
      };
    });

    await page.click('#addSkillBtn');

    // New skill item should appear in sidebar
    const newSkill = page.locator('.skill-item').last();
    await expect(newSkill).toContainText('My Skill');
    await expect(newSkill.locator('.skill-tag')).toHaveText('custom');
  });

  test('newly added skill populates input when clicked', async ({ page }) => {
    await page.evaluate(() => {
      let callCount = 0;
      window.prompt = () => {
        callCount++;
        if (callCount === 1) return 'Analytics';
        return 'Generates analytics';
      };
    });

    await page.click('#addSkillBtn');

    const newSkill = page.locator('.skill-item').last();
    await newSkill.click();

    await expect(page.locator('#messageInput')).toHaveValue(/Analytics/);
  });

  test('add skill dialog cancelled produces no new item', async ({ page }) => {
    await page.evaluate(() => {
      window.prompt = () => null;
    });

    const countBefore = await page.locator('.skill-item').count();
    await page.click('#addSkillBtn');
    const countAfter = await page.locator('.skill-item').count();

    expect(countAfter).toBe(countBefore);
  });
});
