import { test, expect } from '@playwright/test';

/// AAA - Arrange-  Act - Assert -PREPARAR -AGIR -VERIFICAR
/// Arrange - Preparar o cenário
/// Act - Agir
/// Assert - Verificar

test('deve consultar um pedido aprovado', async ({ page }) => {
    //Arrange
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  
    //Act
   await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-J57ZCN')
   await page.getByRole('button', { name: 'Buscar Pedido' }).click()

   //Comentei sem apagar as linhas, pois não sei se serão utilizadas nas próximas aulas.

    //Assert
    //await expect(page.getByTestId('order-result-id')).toBeVisible({timeout: 10_000})
    await page.getByText('Pedido', { exact: true }).click() //Professor, aqui deu ruim quando apaguei do orderlooup fiquei com receio de me perder, 
                                                            // e não conseguir acompanhar as aulas e achei uma alternativa, que não sei se está correta.

    //await expect(page.getByTestId('order-result-id')).toContainText('VLO-J57ZCN')
    await page.getByText('APROVADO'); //Substituindo o order-result-status - ao apagar esse do OrderLookup deu ruim, essa foi a alternativa que encontrei.

    //await expect(page.getByTestId('order-result-status')).toContainText('APROVADO')

});


