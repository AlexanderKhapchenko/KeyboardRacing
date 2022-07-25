import {Car} from "../model/car";
import {RandomInt} from "../utils";
import {ICar} from "../utils/car-interface";

export class CarFactory {
    static createRandom(): ICar {
        const rand = RandomInt.generate({max: Car.availableModels.length - 1});
        const model = Car.availableModels[rand];

        return new Car(model);
    }
}
