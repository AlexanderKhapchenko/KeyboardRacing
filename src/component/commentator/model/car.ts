import { ICar} from "../utils/car-interface";

export class Car implements ICar {
    public static readonly availableModels: string[] = ['ауди', 'тойота', 'лада', 'бэшка', 'газелька', 'альфа-ромео', 'нива'];

    constructor(private model: string) {
    }

    getModel(): string {
        return this.model;
    }
}

