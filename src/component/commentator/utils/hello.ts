import { RandomInt, Car, NameChooser } from "./";
import {IUser} from "../../../interfaces/user";

// Facade pattern
 export class Hello {
    sayAboutMe(username) {
        const randomInt = new RandomInt().get(3);
        const car = new Car().get(randomInt);
        const name = new NameChooser().getRand();
        return `Привет ${username} сегодня зови меня ${name}. Интересный факт моей, вроде ${randomInt+1}-ой машиной была ${car}`;
    }

    sayAboutUsers(users: IUser[]) {
        let result: string[] = [];
        users.forEach(obj => {
            const car = new Car().getRand();
            result.push(this.getRandAboutUser(obj, car));
        });

        return result.join('<br>');
    }

    getRandAboutUser(user: IUser, car) {
        const text = [
            `- Видим как подъезжает ${user.name} на ${car}.`,
            `- Рад снова видеть этого кента с ником ${user.name} на ${car}.`,
            `- О новенький с инетересным ником ${user.name} на хм а что это у нас, не могу поверить что он на ${car}.`,
            `- А это ${user.name} на ${car} и на этом всё.`,
            `- Ну что ж ${user.name} не заставил себя ждать приехава к нам на ${car}.`,
            `- Выдающийся молодой человек ${user.name} привез на канате как игрушку за собой танк сидя на ${car}.`,
            `- Не знаю кто ты ${user.name}, но если ты победишь на ${car}, то я потеряю 100$.`,
            `- ОГО да это же... ой перепутал это кто-то с ником ${user.name} на ${car}.`
        ];

        const rand = new RandomInt().get(text.length);
        return `${text[rand]} ${this.getTotalRace(user.totalRace)}`;
    }

    getTotalRace(totalRace: number) {
        return totalRace > 0 ? `У него это ${totalRace} гонка` : '';
    }
}

 export type THello = InstanceType<typeof Hello>;