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
    test.setTimeout(60000);

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

  test('should drag gear from the gear library into the active list', async ({ page }) => {
    const now = Date.now();
    const username = `drag${now}`;
    const email = `drag+${now}@lighterpack.com`;
    const password = 'testtest';

    await registerUser(page, username, password, email);

    await page.locator('.lpCategoryName').fill('Kitchen');
    await page.locator('.lpAddItem').click();
    await page.locator('.lpItem input.lpName').fill('Stove');
    await page.locator('.lpItem input.lpWeight').fill('3');
    await expect(page.locator('#library .lpLibraryItem').filter({hasText: 'Stove'})).toBeVisible();

    await page.getByText('Add new list').first().click();
    await expect(page.locator('#library .lpLibraryItem').filter({hasText: 'Stove'})).toBeVisible();

    const handle = page.locator('.lpLibraryItem').filter({hasText: 'Stove'}).locator('.lpLibraryItemHandle');
    const target = page.locator('.lpItemsFooter').first();
    const handleBox = await handle.boundingBox();
    const targetBox = await target.boundingBox();

    expect(handleBox).not.toBeNull();
    expect(targetBox).not.toBeNull();

    await page.locator('.lpLibraryItem').filter({hasText: 'Stove'}).hover();
    await page.mouse.move(handleBox!.x + (handleBox!.width / 2), handleBox!.y + 8);
    await page.mouse.down();
    await page.mouse.move(targetBox!.x + 120, targetBox!.y + 10, {steps: 20});
    await page.mouse.up();

    await expect(page.locator('.lpItem input.lpName')).toHaveValue('Stove');
    await expect(page.locator('.lpItem input.lpName')).toHaveCount(1);
  });
});
