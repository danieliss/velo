import { test, expect } from '@playwright/test';

test('deve consultar um pedido aprovado', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  // checkpoint 1
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');

  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  //checkpoint 2
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido');
  //await page.getByTestId('search-order-id').click();
  await page.getByTestId('search-order-id').fill('VLO-G3DXFH');
  await page.getByTestId('search-order-button').click();
  await expect(page.getByTestId('order-result-id')).toContainText('VLO-G3DXFH');
  await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');

});
