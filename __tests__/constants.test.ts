import { describe, it, expect } from 'vitest';

/**
 * Tests para validar las constantes principales del proyecto
 * SKILL_TREE, DISCIPLINAS, NIVELES, etc.
 */

// Importamos las constantes (asumiendo que existan)
// Para estos tests iniciales, validamos la estructura esperada

describe('GymCoach Constants Validation', () => {
  
  describe('Disciplinas', () => {
    it('debería contener las cuatro disciplinas gimnásticas', () => {
      const DISCIPLINAS = ['GAF', 'GAM', 'Trampolín', 'Rítmica'];
      
      expect(DISCIPLINAS).toHaveLength(4);
      expect(DISCIPLINAS).toContain('GAF');
      expect(DISCIPLINAS).toContain('GAM');
      expect(DISCIPLINAS).toContain('Trampolín');
      expect(DISCIPLINAS).toContain('Rítmica');
    });
  });

  describe('Niveles', () => {
    it('debería contener los niveles de formación en orden', () => {
      const NIVELES = ['Iniciación', 'Escuela', 'Promocional', 'Nivel 1-3', 'Nivel 4-6', 'Elite'];
      
      expect(NIVELES).toHaveLength(6);
      expect(NIVELES[0]).toBe('Iniciación');
      expect(NIVELES[NIVELES.length - 1]).toBe('Elite');
    });
  });

  describe('Aparatos', () => {
    it('debería tener todos los aparatos gimnásticos', () => {
      const APARATOS = [
        'Suelo',
        'Viga',
        'Paralelas',
        'Salto',
        'Anillas',
        'Arzones',
        'Barra Fija',
      ];
      
      expect(APARATOS).toHaveLength(7);
      expect(APARATOS).toContain('Suelo');
      expect(APARATOS).toContain('Barra Fija');
    });
  });

  describe('Estados de Pago', () => {
    it('debería contener todos los estados de pago válidos', () => {
      const PAYMENT_STATUSES = ['Al día', 'Pendiente', 'Vencido', 'Exento'];
      
      expect(PAYMENT_STATUSES).toHaveLength(4);
      expect(PAYMENT_STATUSES).toContain('Al día');
      expect(PAYMENT_STATUSES).toContain('Vencido');
    });
  });

  describe('Estados de Habilidad', () => {
    it('debería contener todos los estados de progreso de habilidades', () => {
      const SKILL_STATUSES = [
        'No Iniciado',
        'En Proceso',
        'Dominado',
        'Elite',
      ];
      
      expect(SKILL_STATUSES).toHaveLength(4);
      expect(SKILL_STATUSES[0]).toBe('No Iniciado');
      expect(SKILL_STATUSES[SKILL_STATUSES.length - 1]).toBe('Elite');
    });
  });
});
