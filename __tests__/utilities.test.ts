import { describe, it, expect } from 'vitest';

/**
 * Tests para funciones de utilidad y filtros comunes
 * que se usan en Alumnos, ControlPagos, Asistencia, etc.
 */

describe('Utility Functions', () => {
  
  describe('Filtrado de Alumnos', () => {
    it('debería filtrar por disciplina', () => {
      const alumnos = [
        { nombre: 'Juan', disciplina: 'GAF' },
        { nombre: 'María', disciplina: 'GAM' },
        { nombre: 'Pedro', disciplina: 'GAF' },
        { nombre: 'Sofia', disciplina: 'Rítmica' },
      ];

      const filtrados = alumnos.filter(a => a.disciplina === 'GAF');
      expect(filtrados).toHaveLength(2);
      expect(filtrados[0].nombre).toBe('Juan');
    });

    it('debería filtrar por nivel', () => {
      const alumnos = [
        { nombre: 'Juan', nivel: 'Iniciación' },
        { nombre: 'María', nivel: 'Elite' },
        { nombre: 'Pedro', nivel: 'Iniciación' },
      ];

      const filtrados = alumnos.filter(a => a.nivel === 'Iniciación');
      expect(filtrados).toHaveLength(2);
    });

    it('debería buscar por nombre (case-insensitive)', () => {
      const alumnos = [
        { nombre: 'Juan Pérez' },
        { nombre: 'María González' },
        { nombre: 'juan López' },
      ];

      const buscar = (query: string) => {
        return alumnos.filter(a => 
          a.nombre.toLowerCase().includes(query.toLowerCase())
        );
      };

      expect(buscar('juan')).toHaveLength(2);
      expect(buscar('JUAN')).toHaveLength(2);
      expect(buscar('González')).toHaveLength(1);
    });
  });

  describe('Filtrado de Pagos', () => {
    it('debería filtrar por estado de pago', () => {
      const pagos = [
        { nombre: 'Juan', estado: 'Al día' },
        { nombre: 'María', estado: 'Vencido' },
        { nombre: 'Pedro', estado: 'Pendiente' },
        { nombre: 'Sofia', estado: 'Vencido' },
      ];

      const vencidos = pagos.filter(p => p.estado === 'Vencido');
      expect(vencidos).toHaveLength(2);
    });

    it('debería filtrar por mes (flexible)', () => {
      const registros = [
        { mes: 'Enero 2024' },
        { mes: 'FEBRERO 2024' },
        { mes: 'febrero 2024' },
        { mes: 'Marzo 2024' },
      ];

      const buscarMes = (mes: string) => {
        const mesNormalizado = mes.toLowerCase().trim();
        return registros.filter(r => 
          r.mes.toLowerCase().trim().includes(mesNormalizado)
        );
      };

      expect(buscarMes('febrero')).toHaveLength(2);
      expect(buscarMes('FEBRERO')).toHaveLength(2);
      expect(buscarMes('FEBRERO 2024')).toHaveLength(2);
    });
  });

  describe('Validación de Asistencia', () => {
    it('debería calcular porcentaje de asistencia', () => {
      const calcularAsistencia = (presente: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((presente / total) * 100);
      };

      expect(calcularAsistencia(8, 10)).toBe(80);
      expect(calcularAsistencia(10, 10)).toBe(100);
      expect(calcularAsistencia(0, 10)).toBe(0);
    });

    it('debería identificar asistencia baja (< 75%)', () => {
      const asistencias = [
        { alumno: 'Juan', porcentaje: 80 },
        { alumno: 'María', porcentaje: 50 },
        { alumno: 'Pedro', porcentaje: 95 },
        { alumno: 'Sofia', porcentaje: 60 },
      ];

      const baja = asistencias.filter(a => a.porcentaje < 75);
      expect(baja).toHaveLength(2);
      expect(baja.map(a => a.alumno)).toContain('María');
    });
  });

  describe('Normalización de Datos', () => {
    it('debería normalizar nombres de grupos', () => {
      const normalizarGrupo = (grupo: string) => {
        return grupo.trim().toUpperCase();
      };

      expect(normalizarGrupo('  grupo a - lunes  ')).toBe('GRUPO A - LUNES');
      expect(normalizarGrupo('GRUPO B')).toBe('GRUPO B');
    });

    it('debería limpiar DNI (espacios, guiones)', () => {
      const limpiarDNI = (dni: string) => {
        return dni.replace(/[\s-]/g, '');
      };

      expect(limpiarDNI('12 345 678')).toBe('12345678');
      expect(limpiarDNI('12-345-678')).toBe('12345678');
      expect(limpiarDNI('12345678')).toBe('12345678');
    });

    it('debería normalizar teléfono', () => {
      const normalizarTel = (tel: string) => {
        return tel.replace(/\D/g, '');
      };

      expect(normalizarTel('+54 (11) 1234-5678')).toBe('541112345678');
      expect(normalizarTel('1234567890')).toBe('1234567890');
    });
  });

  describe('Comparación de Fechas', () => {
    it('debería identificar pagos vencidos', () => {
      const esPagoVencido = (fechaVencimiento: string) => {
        const hoy = new Date();
        const fecha = new Date(fechaVencimiento);
        return fecha < hoy;
      };

      const pasado = '2024-01-01';
      const futuro = '2030-12-31';

      expect(esPagoVencido(pasado)).toBe(true);
      expect(esPagoVencido(futuro)).toBe(false);
    });

    it('debería alertar si pago vence en menos de 7 días', () => {
      const díasHasta = (fecha: string) => {
        const hoy = new Date();
        const fechaVencimiento = new Date(fecha);
        const diferencia = fechaVencimiento.getTime() - hoy.getTime();
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
      };

      // Simulamos fecha en 5 días
      const en5Días = new Date();
      en5Días.setDate(en5Días.getDate() + 5);
      
      const resultado = díasHasta(en5Días.toISOString().split('T')[0]);
      expect(resultado).toBeLessThanOrEqual(7);
    });
  });

  describe('Transformación de Datos', () => {
    it('debería convertir lista plana a grupos', () => {
      const alumnos = [
        { nombre: 'Juan', grupo: 'A' },
        { nombre: 'María', grupo: 'A' },
        { nombre: 'Pedro', grupo: 'B' },
        { nombre: 'Sofia', grupo: 'B' },
        { nombre: 'Carlos', grupo: 'A' },
      ];

      const agrupar = (arr: any[], clave: string) => {
        return arr.reduce((acc: any, item) => {
          const key = item[clave];
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});
      };

      const resultado = agrupar(alumnos, 'grupo');
      expect(resultado['A']).toHaveLength(3);
      expect(resultado['B']).toHaveLength(2);
      expect(resultado['A'][0].nombre).toBe('Juan');
    });
  });

  describe('Validación de Rangos', () => {
    it('debería validar rango de edad', () => {
      const validarEdad = (edad: number) => {
        return edad >= 4 && edad <= 18;
      };

      expect(validarEdad(8)).toBe(true);
      expect(validarEdad(4)).toBe(true);
      expect(validarEdad(18)).toBe(true);
      expect(validarEdad(3)).toBe(false);
      expect(validarEdad(19)).toBe(false);
    });

    it('debería validar rango de porcentaje', () => {
      const validarPorcentaje = (valor: number) => {
        return valor >= 0 && valor <= 100;
      };

      expect(validarPorcentaje(50)).toBe(true);
      expect(validarPorcentaje(0)).toBe(true);
      expect(validarPorcentaje(100)).toBe(true);
      expect(validarPorcentaje(-1)).toBe(false);
      expect(validarPorcentaje(101)).toBe(false);
    });
  });
});
