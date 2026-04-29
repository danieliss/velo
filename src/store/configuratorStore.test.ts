import { describe, it, expect } from 'vitest';
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  CarConfiguration,
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
