import { test, expect } from '../support/fixtures'

test.describe('Checkout - validações', () => {
  test.beforeEach(async ({ page, app }) => {

    // 👇 injeta estado do carrinho ANTES da página carregar
    await page.addInitScript(() => {
      localStorage.setItem('cart', JSON.stringify([
        {
          id: 1,
          name: 'Bike Teste',
          price: 1000
        }
      ]))
    })

    // 👇 navega
    await page.goto('/order')

    // 👇 garante que NÃO houve redirect silencioso
    await page.goto('/order', { waitUntil: 'domcontentloaded' })

    // DEBUG útil
    console.log('URL atual:', page.url())

    // 👇 DEBUG (vai aparecer no pipeline)
    console.log('URL atual:', page.url())

    // 👇 valida carregamento
    await app.checkout.expectLoaded()
  })

  test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
    const alerts = app.checkout.elements.alerts

    await app.checkout.submit()

    await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
    await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    await expect(alerts.email).toHaveText('Email inválido')
    await expect(alerts.phone).toHaveText('Telefone inválido')
    await expect(alerts.document).toHaveText('CPF inválido')
    await expect(alerts.store).toHaveText('Selecione uma loja')
    await expect(alerts.terms).toHaveText('Aceite os termos')
  })

  test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {
    const alerts = app.checkout.elements.alerts

    await app.checkout.fillCustomerlData({
      name: 'A',
      lastname: 'B',
      email: 'papito@teste.com',
      document: '00000014141',
      phone: '(11) 99999-9999',
    })
    await app.checkout.submit()

    await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
    await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
  })

  test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
    const alerts = app.checkout.elements.alerts

    await app.checkout.fillCustomerlData({
      name: 'João',
      lastname: 'Silva',
      email: 'cliente@.com',
      document: '00000014141',
      phone: '(11) 99999-9999',
    })
    await app.checkout.submit()

    await expect(alerts.email).toHaveText('Email inválido')
  })

  test('deve exibir erro para CPF inválido', async ({ app }) => {
    const alerts = app.checkout.elements.alerts

    await app.checkout.fillCustomerlData({
      name: 'João',
      lastname: 'Silva',
      email: 'joao@email.com',
      document: '123',
      phone: '(11) 99999-9999',
    })
    await app.checkout.submit()

    await expect(alerts.document).toHaveText('CPF inválido')
  })

  test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {
    const alerts = app.checkout.elements.alerts

    await app.checkout.fillCustomerlData({
      name: 'João',
      lastname: 'Silva',
      email: 'joao.silva@email.com',
      document: '52998224725',
      phone: '(11) 99999-9999',
    })
    await app.checkout.selectStore('Velô Paulista')

    await expect(app.checkout.elements.terms).not.toBeChecked()
    await app.checkout.submit()

    await expect(alerts.terms).toHaveText('Aceite os termos')
  })
})