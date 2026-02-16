import { test, expect } from '@playwright/test';
import { generateOrderCode} from '../support/helpers';
import { searchOrder } from '../support/helpers';
import { OrderLockupPage } from '../../src/pages/OrderLockupPage';


/// AAA - Arrange-  Act - Assert -PREPARAR -AGIR -VERIFICAR
/// Arrange - Preparar o cenário
/// Act - Agir 
/// Assert - Verificar

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
        //const order = 'VLO-ULUOXQ'
        const order = {
            number:'VLO-ULUOXQ',
            status: 'APROVADO',
            color: 'Midnight Black',
            wheels: 'aero Wheels',
            customer: {
                name: 'Machado De Assis',
                email:'machado@teste.com'
            },
            payment:'À Vista'
        }
        /// Act - Agir 

        const orderLockupPage = new OrderLockupPage(page)
        await orderLockupPage.searchOrder(order.number)

      await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
        - img
        - paragraph: Pedido
        - paragraph: ${order.number}
        - status:
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
        `)

       const statusBadge =  page.getByRole('status').filter({hasText: order.status})
       await expect(statusBadge).toHaveClass(/bg-green-100/)
       await expect(statusBadge).toHaveClass(/text-green-700/)
       
       const statusIcon = statusBadge.locator('svg')
       await expect(statusIcon).toHaveClass(/lucide-circle-check-big/)


    })

    test('deve consultar um pedido reprovado', async ({ page }) => {



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

    /// Act - Agir 
    const orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.searchOrder(order.number)

        await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.number}
            - status:
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
            `)
            const statusBadge =  page.getByRole('status').filter({hasText: order.status})
            await expect(statusBadge).toHaveClass(/bg-red-100/)
            await expect(statusBadge).toHaveClass(/text-red-700/)
            
            const statusIcon = statusBadge.locator('svg')
            await expect(statusIcon).toHaveClass(/lucide-circle-x/)

    })

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

        /// Act - Agir 
        const orderLockupPage = new OrderLockupPage(page)
        await orderLockupPage.searchOrder(order.number)


        await expect(page.getByTestId(`order-result-${order.number}`)).toMatchAriaSnapshot(`
            - img
            - paragraph: Pedido
            - paragraph: ${order.number}
            - status:
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
            `)

            const statusBadge =  page.getByRole('status').filter({hasText: order.status})
            await expect(statusBadge).toHaveClass(/bg-amber-100/)
            await expect(statusBadge).toHaveClass(/text-amber-700/)
            
            const statusIcon = statusBadge.locator('svg')
            await expect(statusIcon).toHaveClass(/lucide-clock-icon/)

    })

    test('deve exibir mensagem quando não é encontrado', async ({ page }) => {
        const order = generateOrderCode()
        //Arrange
        await page.goto('http://localhost:5173/')
        await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')

        await page.getByRole('link', { name: 'Consultar Pedido' }).click()
        await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

        //Act
        const orderLockupPage = new OrderLockupPage(page)
        await orderLockupPage.searchOrder(order)

        //Assert
        await expect(page.locator('#root')).toMatchAriaSnapshot(`
                     - img
                     - heading "Pedido não encontrado" [level=3]
                     - paragraph: Verifique o número do pedido e tente novamente
                     `);


    })
