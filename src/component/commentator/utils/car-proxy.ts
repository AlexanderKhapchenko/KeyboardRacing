import {ICar} from "./car-interface";
import {CarFactory} from "../factory/car-factory";

export class CarProxy implements ICar {
    private car: ICar | null = null;

    getModel(): string {
        return this.getCar().getModel();
    }

    private getCar(): ICar {
        if (this.car === null) {
            this.car = CarFactory.createRandom();
        }

        return this.car;
    }
}