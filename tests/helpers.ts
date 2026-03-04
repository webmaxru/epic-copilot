import type { Page } from '@playwright/test';

/**
 * Mocks the /api/sessions and /api/chat endpoints so tests
 * can run against the static HTML without the real backend.
 */
export async function mockApi(page: Page) {
  await page.route('**/api/sessions', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ sessionId: 'test-session-id' }),
    }),
  );

  await page.route('**/api/chat', (route) => {
    const body = route.request().postDataJSON() as { message: string };
    const reply = `Echo: ${body.message}`;
    const ssePayload = [
      `data: ${JSON.stringify({ type: 'delta', content: reply })}`,
      `data: ${JSON.stringify({ type: 'done' })}`,
      '',
    ].join('\n');

    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: ssePayload,
    });
  });
}

/**
 * Mocks /api/chat to return a streamed markdown response.
 */
export async function mockChatWithMarkdown(page: Page, markdown: string) {
  await page.route('**/api/chat', (route) => {
    const ssePayload = [
      `data: ${JSON.stringify({ type: 'delta', content: markdown })}`,
      `data: ${JSON.stringify({ type: 'done' })}`,
      '',
    ].join('\n');

    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: ssePayload,
    });
  });
}

/**
 * Mocks /api/chat to return an SSE error event.
 */
export async function mockChatError(page: Page, message = 'Something went wrong') {
  await page.route('**/api/chat', (route) => {
    const ssePayload = [
      `data: ${JSON.stringify({ type: 'error', message })}`,
      `data: ${JSON.stringify({ type: 'done' })}`,
      '',
    ].join('\n');

    route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: ssePayload,
    });
  });
}
