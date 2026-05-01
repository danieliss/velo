import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  CarConfiguration,
  useConfiguratorStore,
  Order,
} from './configuratorStore';

describe('configuratorStore utilities', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate base price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      };
      // Base price is 40000
      expect(calculateTotalPrice(config)).toBe(40000);
    });

    it('should add sport wheels price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: [],
      };
      // Base (40000) + Sport Wheels (2000) = 42000
      expect(calculateTotalPrice(config)).toBe(42000);
    });

    it('should calculate optionals correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park'],
      };
      // Base (40000) + Precision Park (5500) = 45500
      expect(calculateTotalPrice(config)).toBe(45500);
    });

    it('should calculate multiple optionals and sport wheels correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: ['precision-park', 'flux-capacitor'],
      };
      // Base (40000) + Sport (2000) + Precision Park (5500) + Flux Capacitor (5000) = 52500
      expect(calculateTotalPrice(config)).toBe(52500);
    });
  });

  describe('calculateInstallment', () => {
    it('should calculate installment value with 2% interest over 12 months', () => {
      const total = 40000;
      // Formula: (40000 * 0.02 * Math.pow(1.02, 12)) / (Math.pow(1.02, 12) - 1)
      // = 3782.38
      const expected = 3782.38;
      expect(calculateInstallment(total)).toBe(expected);
    });
  });

  describe('formatPrice', () => {
    it('should format price correctly into BRL', () => {
      const price = 40000;
      const formatted = formatPrice(price);

      // Node's Intl format can output "R$ 40.000,00" or replace spaces with non-breaking spaces
      // So checking with a regex is safer.
      const normalized = formatted.replace(/\s|\u00A0|\u202F/g, ' ');

      expect(normalized).toMatch(/R\$\s?40\.000,00/);
    });
  });
});

describe('Store: Configuration Actions', () => {
  beforeEach(() => {
    // Reseta a store antes de cada teste
    useConfiguratorStore.getState().resetConfiguration();
  });

  it('deve adicionar e remover um opcional corretamente ao usar toggleOptional', () => {
    const store = useConfiguratorStore.getState();
    
    // Adiciona o opcional
    store.toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park');
    
    // Remove o opcional (toggle off)
    store.toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).not.toContain('precision-park');
  });

  it('deve restaurar a configuração inicial ao chamar resetConfiguration', () => {
    const store = useConfiguratorStore.getState();
    store.setExteriorColor('midnight-black');
    store.toggleOptional('flux-capacitor');
    
    store.resetConfiguration();
    
    const resetState = useConfiguratorStore.getState().configuration;
    expect(resetState.exteriorColor).toBe('glacier-blue');
    expect(resetState.optionals).toHaveLength(0);
  });
});

describe('Store: Orders and Authentication Flow', () => {
  beforeEach(() => {
    useConfiguratorStore.setState({ orders: [], currentUserEmail: null });
  });

  it('deve adicionar um pedido, autenticar o usuário e resgatar seu histórico', () => {
    const store = useConfiguratorStore.getState();
    
    const mockOrder: Order = {
      id: '123',
      configuration: {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      },
      totalPrice: 40000,
      customer: {
        name: 'Cliente',
        surname: 'Teste',
        email: 'cliente@teste.com',
        phone: '11999999999',
        cpf: '12345678900',
        store: 'Loja',
      },
      paymentMethod: 'avista',
      status: 'APROVADO',
      createdAt: new Date().toISOString(),
    };

    // 1. Adiciona o pedido
    store.addOrder(mockOrder);
    expect(useConfiguratorStore.getState().orders).toHaveLength(1);

    // 2. Tenta fazer login com email errado
    const failedLogin = useConfiguratorStore.getState().login('errado@teste.com');
    expect(failedLogin).toBe(false);

    // 3. Tenta fazer login com o email do pedido (Sucesso)
    const successLogin = useConfiguratorStore.getState().login('cliente@teste.com');
    expect(successLogin).toBe(true);
    expect(useConfiguratorStore.getState().currentUserEmail).toBe('cliente@teste.com');

    // 4. Busca os pedidos do usuário logado
    const userOrders = useConfiguratorStore.getState().getUserOrders();
    expect(userOrders).toHaveLength(1);
    expect(userOrders[0].customer.email).toBe('cliente@teste.com');
  });
});
