export class RandomInt {
    get(max) {
        return Math.floor(Math.random() * max);
    }
}

export type TRandomInt = InstanceType<typeof RandomInt>;