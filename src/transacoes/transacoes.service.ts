import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { Transacao, TransacaoDocument } from './transacao.schema';

export interface Metricas {
  saldoTotal: number;
  totalDespesas: number;
  totalGastoImpulso: number;
}

export function calcularMetricas(
  transacoes: Pick<Transacao, 'valor' | 'tipo' | 'consumoConsciente'>[],
): Metricas {
  let totalReceitas = 0;
  let totalDespesas = 0;
  let totalGastoImpulso = 0;

  for (const t of transacoes) {
    if (t.tipo === 'receita') {
      totalReceitas += t.valor;
    } else if (t.tipo === 'despesa') {
      totalDespesas += t.valor;
      if (t.consumoConsciente === false) totalGastoImpulso += t.valor;
    }
  }

  const arredondar = (n: number) => Math.round(n * 100) / 100;
  return {
    saldoTotal: arredondar(totalReceitas - totalDespesas),
    totalDespesas: arredondar(totalDespesas),
    totalGastoImpulso: arredondar(totalGastoImpulso),
  };
}

@Injectable()
export class TransacoesService {
  constructor(
    @InjectModel(Transacao.name) private readonly model: Model<TransacaoDocument>,
  ) {}

  create(dto: CreateTransacaoDto) {
    return this.model.create(dto);
  }

  async findAll() {
    const historico = await this.model.find().sort({ createdAt: -1 }).exec();
    return { historico, metricas: calcularMetricas(historico) };
  }
}
