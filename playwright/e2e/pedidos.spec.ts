import { test, expect } from '@playwright/test';
import { generateOrderCode } from '../support/helpers';

/// AAA - Arrange-  Act - Assert -PREPARAR -AGIR -VERIFICAR
/// Arrange - Preparar o cenário
/// Act - Agir 
/// Assert - Verificar

// test.describe('Consulta de Pedido', () => {
//     test('deve consultar um pedido aprovado', async ({ page }) => {   
    

    // const order = 'VLO-7QZPJJ'

    // await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
    // await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    //  })
    //Grupo

    test.beforeAll(async () => {
        console.log(
            'beforeAll: roda uma vez antes de todos os testes.'
        )
    })

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/')
        await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
        await page.getByRole('link', { name: 'Consultar Pedido' }).click()
        await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

    })

    test('deve consultar um pedido aprovado', async ({ page }) => {

        //Test Data
        //const order = 'VLO-7QZPJJ'
        const order = {
            number:'VLO-7QZPJJ',
            status: 'APROVADO',
            color: 'Midnight Black',
            wheels: 'aero Wheels',
            customer: {
                name: 'Victor Granell dos Santos Barbadillo',
                email:'victorgsbarba@gmail.com'
            },
            payment:'À Vista'
        }

        await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
        await page.getByRole('button', { name: 'Buscar Pedido' }).click()



    //     const containerPedido = page.getByRole('paragraph')
    //         .filter({ hasText: /^Pedido$/ })
    //         .locator('..') //sobe para o elemento pai-a div que agrupa ambos

    //     await expect(containerPedido).toContainText(order, { timeout: 10_000 })

    //     await expect(page.getByText('APROVADO')).toBeVisible()


      await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
        - img
        - paragraph: Pedido
        - paragraph: ${order.number}
        - img
        - text: ${order.status}
        - img "Velô Sprint"
        - paragraph: Modelo
        - paragraph: Velô Sprint
        - paragraph: Cor
        - paragraph: ${order.color}
        - paragraph: Interior
        - paragraph: cream
        - paragraph: Rodas
        - paragraph: ${order.wheels}
        - heading "Dados do Cliente" [level=4]
        - paragraph: Nome
        - paragraph: ${order.customer.name}
        - paragraph: Email
        - paragraph: ${order.customer.email}
        - paragraph: Loja de Retirada
        - paragraph
        - paragraph: Data do Pedido
        - paragraph: /\\d+\\/\\d+\\/\\d+/
        - heading "Pagamento" [level=4]
        - paragraph: ${order.payment}
        - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
        `);

    });
    test('deve consultar um pedido reprovado', async ({ page }) => {

        //Test Data
        // const order = 'VLO-RJXU15'


        const order = {
            number:'VLO-RJXU15',
            status: 'REPROVADO',
            color: 'Midnight Black',
            wheels: 'sport Wheels',
            customer: {
                name: 'Silvester Stallone',
                email:'silvester@stallone.com'
            },
            payment:'À Vista'
        }


        await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
        await page.getByRole('button', { name: 'Buscar Pedido' }).click()


    //     const containerPedido = page.getByRole('paragraph')
    //         .filter({ hasText: /^Pedido$/ })
    //         .locator('..') //sobe para o elemento pai-a div que agrupa ambos

    //     await expect(containerPedido).toContainText(order, { timeout: 10_000 })

    //     await expect(page.getByText('APROVADO')).toBeVisible()
        //assert

        await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.number}
            - img
            - text: ${order.status}
            - img "Velô Sprint"
            - paragraph: Modelo
            - paragraph: Velô Sprint
            - paragraph: Cor
            - paragraph: ${order.color}
            - paragraph: Interior
            - paragraph: cream
            - paragraph: Rodas
            - paragraph: ${order.wheels}
            - heading "Dados do Cliente" [level=4]
            - paragraph: Nome
            - paragraph: ${order.customer.name}
            - paragraph: Email
            - paragraph: ${order.customer.email}
            - paragraph: Loja de Retirada
            - paragraph
            - paragraph: Data do Pedido
            - paragraph: /\\d+\\/\\d+\\/\\d+/
            - heading "Pagamento" [level=4]
            - paragraph: ${order.payment}
            - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
            `);

    });

    test('deve consultar um pedido em analise', async ({ page }) => {

        //Test Data
        // const order = 'VLO-RJXU15'


        const order = {
            number:'VLO-G1YP6D',
            status: 'EM_ANALISE',
            color: 'Lunar White',
            wheels: 'aero Wheels',
            customer: {
                name: 'Courteney Cox',
                email:'courteney@cox.com'
            },
            payment:'À Vista'
        }


        await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order.number)
        await page.getByRole('button', { name: 'Buscar Pedido' }).click()


        await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.number}
            - img
            - text: ${order.status}
            - img "Velô Sprint"
            - paragraph: Modelo
            - paragraph: Velô Sprint
            - paragraph: Cor
            - paragraph: ${order.color}
            - paragraph: Interior
            - paragraph: cream
            - paragraph: Rodas
            - paragraph: ${order.wheels}
            - heading "Dados do Cliente" [level=4]
            - paragraph: Nome
            - paragraph: ${order.customer.name}
            - paragraph: Email
            - paragraph: ${order.customer.email}
            - paragraph: Loja de Retirada
            - paragraph
            - paragraph: Data do Pedido
            - paragraph: /\\d+\\/\\d+\\/\\d+/
            - heading "Pagamento" [level=4]
            - paragraph: ${order.payment}
            - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
            `);

    });



    test('deve exibir mensagem quando não é encontrado', async ({ page }) => {
        const order = generateOrderCode()
        //Arrange
        await page.goto('http://localhost:5173/')
        await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

        await page.getByRole('link', { name: 'Consultar Pedido' }).click()
        await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

        //Act
        await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order)
        await page.getByRole('button', { name: 'Buscar Pedido' }).click()

        //Assert
        await expect(page.locator('#root')).toMatchAriaSnapshot(`
                     - img
                     - heading "Pedido não encontrado" [level=3]
                     - paragraph: Verifique o número do pedido e tente novamente
                     `);


    })
