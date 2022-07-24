import { RandomInt } from "./";

export class Car {
    private readonly models = ['ауди', 'тойота', 'лада', 'бэшка', 'газелька', 'альфа-ромео', 'нива'];
    private readonly adjectives = ['прекрасной', 'поношеной', 'дырявой', 'вымытой', 'ржавой'];

    getRand() {
        let rand = new RandomInt().get(this.models.length);
        const model = this.models[rand];
        rand = new RandomInt().get(this.adjectives.length);
        const adjective = this.adjectives[rand];
        return `${adjective} ${model}`;
    }
    get(index) {
        return this.models[index];
    }
}

export type TCar = InstanceType<typeof Car>;