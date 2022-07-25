import { RandomInt } from "./";

export class NameChooser {
    private static readonly names = ['Саша', 'Паша', 'Влад', 'Лео', 'Арамис'];

    static getRand() {
        const rand = RandomInt.generate({max: this.names.length - 1});
        return this.names[rand];
    }
}

export type TNameChooser = InstanceType<typeof NameChooser>;
