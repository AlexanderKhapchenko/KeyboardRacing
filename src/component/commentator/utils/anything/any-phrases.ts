import { RandomInt } from "../index";
import { Phrases } from "./phrases";

export class AnyPhrases {
    static generate() {
        const choose = RandomInt.generate({max: 3});
        if(choose === 0)
            return Phrases.jokes[choose];
        else if (choose === 1)
            return Phrases.stories[choose];
        else if (choose === 2)
            return Phrases.facts[choose];
        else
            return 'Пытаюсь вспомнить историю...';
    }
}

export type TAnything = InstanceType<typeof AnyPhrases>;
