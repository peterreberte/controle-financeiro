import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransacaoDocument = HydratedDocument<Transacao>;

export const TIPOS_TRANSACAO = ['receita', 'despesa'] as const;
export type TipoTransacao = (typeof TIPOS_TRANSACAO)[number];

@Schema({ timestamps: true })
export class Transacao {
  @Prop({ required: true, trim: true })
  descricao: string;

  @Prop({ required: true, min: 0 })
  valor: number;

  @Prop({ required: true, enum: TIPOS_TRANSACAO })
  tipo: TipoTransacao;

  @Prop({ required: true, trim: true })
  categoria: string;

  // false = gasto por impulso; true = gasto essencial/consciente
  @Prop({ required: true, default: true })
  consumoConsciente: boolean;
}

export const TransacaoSchema = SchemaFactory.createForClass(Transacao);
