import { test, expect } from '../support/fixtures'

import { deleteOrderByEmail } from '../support/database/orderRepository'

type CheckoutCustomer = {
  name: string
  lastname: string
  email: string
  document: string
  phone: string
  store: string
  paymentMethod: string
  totalPrice: string
  downPayment?: string
}

test.describe('Checkout', () => {
  async function openCheckoutFromConfigurator(page: any, app: any, totalPrice: string) {
    await page.goto('/')
    await page.getByRole('link', { name: /Configure Agora/i }).click()
    await app.configurator.expectPrice(totalPrice)
    await app.configurator.finishConfigurator()
    await app.checkout.expectLoaded()
  }

  async function prepareCheckout(page: any, app: any, customer: CheckoutCustomer) {
    await deleteOrderByEmail(customer.email)
    await openCheckoutFromConfigurator(page, app, customer.totalPrice)
    await app.checkout.fillCustomerlData(customer)
    await app.checkout.selectStore(customer.store)
  }

  async function mockCreditAnalysis(page: any, score: number) {
    await page.route('**/functions/v1/credit-analysis', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'Done',
          score,
        }),
      })
    })
  }

  async function submitCheckout(app: any, customer: CheckoutCustomer) {
    await app.checkout.selectPaymentMethod(customer.paymentMethod)
    if (customer.downPayment) {
      await app.checkout.fillDownPayment(customer.downPayment)
    }
    await app.checkout.acceptTerms()
    await app.checkout.submit()
  }



  test.describe('Validações de campos obrigatórios', () => {

    let alerts: any

    test.beforeEach(async ({ page, app }) => {
      await page.goto('/order')
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

      alerts = app.checkout.elements.alerts
    })


    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.document).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

      const customer = {
        name: 'A',
        lastname: 'B',
        email: 'papito@teste.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@.com',
        document: '00000014141',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {

      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')
      await app.checkout.acceptTerms()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.document).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@test.com',
        document: '00000014199',
        phone: '(11) 99999-9999'
      }

      // Arrange
      await app.checkout.fillCustomerlData(customer)
      await app.checkout.selectStore('Velô Paulista')

      await expect(app.checkout.elements.terms).not.toBeChecked()

      // Act
      await app.checkout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamento e Confirmação', () => {

    test('deve criar um pedido com sucesso para pagamento à vista', async ({ page, app }) => {

      const customer = {
        name: 'Fernando',
        lastname: 'Papito',
        email: 'papito@teste.com',
        document: '05366127068',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'À Vista',
        totalPrice: 'R$ 40.000,00'
      }

      await prepareCheckout(page, app, customer)

      // Act
      await app.checkout.selectPaymentMethod(customer.paymentMethod)
      await app.checkout.expectSummaryTotal(customer.totalPrice)
      await app.checkout.acceptTerms()
      await app.checkout.submit()

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
    })

    test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento', async ({ page, app }) => {

      const customer = {
        name: 'Steve',
        lastname: 'Woz',
        email: 'woz@velo.dev',
        document: '65493881047',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await mockCreditAnalysis(page, 710)
      await prepareCheckout(page, app, customer)

      // Act
      await submitCheckout(app, customer)

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible()
    })

    test('deve encaminhar para análise de crédito quando o score do CPF for entre 501 e 700 no financiamento', async ({ page, app }) => {

      const customer = {
        name: 'Tony',
        lastname: 'Stark',
        email: 'tony@stark.com',
        document: '74690251037',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await mockCreditAnalysis(page, 600)
      await prepareCheckout(page, app, customer)

      // Act
      await submitCheckout(app, customer)

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: 'Pedido em Análise!' })).toBeVisible()
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ page, app }) => {

      const customer = {
        name: 'Clark',
        lastname: 'Kent',
        email: 'clark@dailyplanet.com',
        document: '52998224725',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00'
      }

      await mockCreditAnalysis(page, 500)
      await prepareCheckout(page, app, customer)

      // Act
      await submitCheckout(app, customer)

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Crédito Reprovado/i })).toBeVisible()
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada menor que 50%', async ({ page, app }) => {

      const customer = {
        name: 'Emma',
        lastname: 'Stone',
        email: 'emma@themiscira.com',
        document: '52998224725',
        phone: '(11) 95999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '10000'
      }

      await mockCreditAnalysis(page, 500)
      await prepareCheckout(page, app, customer)

      // Act
      await submitCheckout(app, customer)

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Crédito Reprovado/i })).toBeVisible()
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada igual a 50%', async ({ page, app }) => {

      const customer = {
        name: 'Curuwe',
        lastname: 'Basnu',
        email: 'Basnu@gmail.com',
        document: '74682489070',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '20000'
      }

      await mockCreditAnalysis(page, 450)
      await prepareCheckout(page, app, customer)

      // Act
      await submitCheckout(app, customer)

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Pedido Aprovado/i })).toBeVisible()
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento com entrada mair que 50%', async ({ page, app }) => {

      const customer = {
        name: 'Layen',
        lastname: 'Rubei',
        email: 'Rubei@gnr.com',
        document: '22368738088',
        phone: '(11) 99999-9999',
        store: 'Velô Paulista',
        paymentMethod: 'Financiamento',
        totalPrice: 'R$ 40.000,00',
        downPayment: '30000'
      }

      await mockCreditAnalysis(page, 300)
      await prepareCheckout(page, app, customer)

      // Act
      await submitCheckout(app, customer)

      // Assert
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByRole('heading', { name: /Pedido Aprovado/i })).toBeVisible()
    })

  })


})
