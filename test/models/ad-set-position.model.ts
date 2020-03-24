import { AdPositionSet } from './ad-position-set.model';

export interface AdSetPosition {
    id: string;
    position: number;
    weight: number;
    code: string;
    description: string;
    status: string;
    adSet: AdPositionSet
}
