import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Transacao } from '../src/transacoes/transacao.schema';
import { calcularMetricas, TransacoesService } from '../src/transacoes/transacoes.service';

describe('calcularMetricas', () => {
  it('calcula saldo, total de despesas e gasto por impulso', () => {
    const r = calcularMetricas([
      { tipo: 'receita', valor: 3000, consumoConsciente: true },
      { tipo: 'despesa', valor: 800, consumoConsciente: true },
      { tipo: 'despesa', valor: 150.5, consumoConsciente: false },
      { tipo: 'despesa', valor: 49.5, consumoConsciente: false },
    ]);
    expect(r).toEqual({ saldoTotal: 2000, totalDespesas: 1000, totalGastoImpulso: 200 });
  });

  it('retorna zeros quando não há transações', () => {
    expect(calcularMetricas([])).toEqual({ saldoTotal: 0, totalDespesas: 0, totalGastoImpulso: 0 });
  });

  it('não conta receita como gasto por impulso', () => {
    const r = calcularMetricas([{ tipo: 'receita', valor: 100, consumoConsciente: false }]);
    expect(r.totalGastoImpulso).toBe(0);
  });
});

describe('TransacoesService', () => {
  it('findAll devolve historico e metricas', async () => {
    const docs = [
      { tipo: 'receita', valor: 500, consumoConsciente: true },
      { tipo: 'despesa', valor: 100, consumoConsciente: false },
    ];
    const model = { find: () => ({ sort: () => ({ exec: async () => docs }) }) };

    const moduleRef = await Test.createTestingModule({
      providers: [TransacoesService, { provide: getModelToken(Transacao.name), useValue: model }],
    }).compile();

    const res = await moduleRef.get(TransacoesService).findAll();
    expect(res.historico).toHaveLength(2);
    expect(res.metricas).toEqual({ saldoTotal: 400, totalDespesas: 100, totalGastoImpulso: 100 });
  });
});
