import { RandomInt } from "./";

export class Joke {
    private readonly text = [
        'Беда не приходит одна - обычно с понятыми',
        'В сутках 24 часа, в ящике 24 бутылки пива. Случайность?',
        'Поскольку Бог не мог уследить за всем сам, он создал бабушек и лавочки',
        'Звонок в дверь, спрашиваю: "Кто?" Говорят: "Связисты". Открыл – связали',
        'Слон состоит из хобота, ушей и бегемота.'
    ];

    say() {
        const rand = new RandomInt().get(this.text.length);
        return this.text[rand];
    }
}

export type TJoke = InstanceType<typeof Joke>;