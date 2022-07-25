export class RandomInt {
    static generate({min = 0, max} : {min?: number, max: number}) {
        const rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }
}

export type TRandomInt = InstanceType<typeof RandomInt>;
