import { test, expect } from '@playwright/test';

import { registerUser } from './auth-utils';

async function waitForSuccessfulSave(page) {
  const response = await page.waitForResponse((response) => (
    response.url().includes('/saveLibrary/')
    && response.request().method() === 'POST'
    && response.status() === 200
  ), { timeout: 40000 });

  await expect(page.getByRole('status')).toHaveText('Saved', { timeout: 10000 });
  return response;
}

test.describe('List tests', () => {
  test('should successfully get an external ID', async ({ page }) => {
    const now = Date.now();
    const username = `id${now}`;
    const email = `id+${now}@lighterpack.com`;
    const password = 'testtest';

    await registerUser(page, username, password, email);
    await page.getByText('Share', { exact: true }).hover();

    const shareUrlLocator = page.getByLabel('Share your list');
    await expect(shareUrlLocator).toHaveValue(/\S/);
    const shareUrl = await shareUrlLocator.inputValue();

    await expect(async () => {
        const response = await page.request.get(shareUrl);
        expect(response.status()).toBe(200);
    }).toPass();
    await page.goto(shareUrl);
  });

  test('should save list name', async ({ page }) => {
    const now = Date.now();
    const username = `name${now}`;
    const email = `name+${now}@lighterpack.com`;
    const password = 'testtest';
    const listName = 'Test List Name';

    await registerUser(page, username, password, email);
    await page.getByPlaceholder('List Name').fill(listName);
    await waitForSuccessfulSave(page);

    await page.reload();
    await expect(page.getByPlaceholder('List Name')).toHaveValue(listName);
  });

  test('should save changes made after a share URL is generated', async ({ page }) => {
    const now = Date.now();
    const username = `share${now}`;
    const email = `share+${now}@lighterpack.com`;
    const password = 'testtest';
    const listName = 'Shared Then Saved List';

    await registerUser(page, username, password, email);
    await page.getByText('Share', { exact: true }).hover();

    const shareUrlLocator = page.getByLabel('Share your list');
    await expect(shareUrlLocator).toHaveValue(/\S/);
    const shareUrl = await shareUrlLocator.inputValue();

    await page.getByPlaceholder('List Name').fill(listName);
    await waitForSuccessfulSave(page);

    await page.reload();
    await expect(page.getByPlaceholder('List Name')).toHaveValue(listName);

    await expect(async () => {
        const response = await page.request.get(shareUrl);
        expect(response.status()).toBe(200);
    }).toPass();

    await page.goto(shareUrl);
    await expect(page.getByRole('heading').filter({hasText: listName})).toBeVisible();
  });

  test('should keep pending changes and retry after a failed save', async ({ page }) => {
    const now = Date.now();
    const username = `retry${now}`;
    const email = `retry+${now}@lighterpack.com`;
    const password = 'testtest';
    const listName = 'Retry Saved List';
    let failedOnce = false;

    await registerUser(page, username, password, email);
    await page.route('**/saveLibrary/', async (route) => {
        if (!failedOnce) {
            failedOnce = true;
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Test save failure' }),
            });
            return;
        }

        await route.continue();
    });

    await page.getByPlaceholder('List Name').fill(listName);
    await expect(page.getByRole('status')).toHaveText('Save failed', { timeout: 40000 });
    await expect(page.getByRole('status')).toHaveAttribute('title', 'Test save failure');

    await waitForSuccessfulSave(page);
    await page.reload();
    await expect(page.getByPlaceholder('List Name')).toHaveValue(listName);
  });
});
