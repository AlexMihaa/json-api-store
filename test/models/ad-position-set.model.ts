import { AdSetPosition } from './ad-set-position.model';

export interface AdPositionSet {
    id: string;
    name: string;
    positions: AdSetPosition[];
}
