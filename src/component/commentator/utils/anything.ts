import {TJoke, TStory, TFact} from "./";
import { RandomInt } from "./";

// Proxy pattern
export class Anything {
    joke: TJoke;
    story: TStory;
    fact: TFact;

    constructor(joke: TJoke, story: TStory, fact: TFact) {
        this.joke = joke;
        this.story = story;
        this.fact = fact;
    }

    say() {
        const choose = new RandomInt().get(3);
        if(choose === 0)
            return this.joke.say();
        else if (choose === 1)
            return this.story.say();
        else if (choose === 2)
            return this.fact.say();
        else
            return 'Пытаюсь вспомнить историю...';
    }
}

export type TAnything = InstanceType<typeof Anything>;