import { RandomInt } from "./";

export class NameChooser {
    private readonly names = ['Саша', 'Паша', 'Влад', 'Лео', 'Арамис'];

    getRand() {
        const rand = new RandomInt().get(this.names.length);
        return this.names[rand];
    }
}

export type TNameChooser = InstanceType<typeof NameChooser>;