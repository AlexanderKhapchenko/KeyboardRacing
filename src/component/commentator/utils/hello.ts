import { RandomInt, Car, NameChooser } from "./";

// Facade pattern
 export class Hello {
    sayAboutMe(username) {
        const randomInt = new RandomInt().get(3);
        const car = new Car().get(randomInt);
        const name = new NameChooser().getRand();
        return `Привет ${username} сегодня зови меня ${name}. Интересный факт моей, вроде ${randomInt+1}-ой машиной была ${car}`;
    }

    sayAboutUsers(objects) {
        let result: string[] = [];
        objects.forEach(obj => {
            const car = new Car().getRand();
            result.push(this.getRandAboutUser(obj, car));
        });

        return result.join('<br>');
    }

    getRandAboutUser(obj, car) {
        const text = [
            `- Видим как подъезжает ${obj.name} на ${car}.`,
            `- Рад снова видеть этого кента с ником ${obj.name} на ${car}.`,
            `- О новенький с инетересным ником ${obj.name} на хм а что это у нас, не могу поверить что он на ${car}.`,
            `- А это ${obj.name} на ${car} и на этом всё.`,
            `- Ну что ж ${obj.name} не заставил себя ждать приехава к нам на ${car}.`,
            `- Выдающийся молодой человек ${obj.name} привез на канате как игрушку за собой танк сидя на ${car}.`,
            `- Не знаю кто ты ${obj.name}, но если ты победишь на ${car}, то я потеряю 100$.`,
            `- ОГО да это же... ой перепутал это кто-то с ником ${obj.name} на ${car}.`
        ];

        const rand = new RandomInt().get(text.length);
        return `${text[rand]} У него это ${obj.totalRace} гонка`;
    }
}

 export type THello = InstanceType<typeof Hello>;