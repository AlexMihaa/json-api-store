import { Model } from './model.interface';

export type ModelType<T extends Model> = { new(): T; };