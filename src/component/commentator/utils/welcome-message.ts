import {CarFactory} from "../factory/car-factory";
import {RandomInt} from "./random-int";
import {ICar} from "./car-interface";
import {IUser} from "../../../interfaces/user";

export class WelcomeMessage {
    static forOne({username, name, carNumber, car}: {username: string, name: string, carNumber: number, car: string}) {
        return `Привет ${username} сегодня зови меня ${name}. Интересный факт моей, вроде ${carNumber}-ой машиной была ${car}`;
    }

    static forAll(users : IUser[]) {
        let result: string[] = [];
        users.forEach(user => {
            result.push(WelcomeMessage.getRandMsgAboutUser(user.name, user.totalRace, user.car.getModel()));
        });

        return result.join('<br>');
    }

    private static getRandMsgAboutUser(username, totalRace, car) {
        const text = [
            `- Видим как подъезжает ${username} на ${car}.`,
            `- Рад снова видеть этого кента с ником ${username} на ${car}.`,
            `- О новенький с инетересным ником ${username} на хм а что это у нас, не могу поверить что он на ${car}.`,
            `- А это ${username} на ${car} и на этом всё.`,
            `- Ну что ж ${username} не заставил себя ждать приехава к нам на ${car}.`,
            `- Выдающийся молодой человек ${username} привез на канате как игрушку за собой танк сидя на ${car}.`,
            `- Не знаю кто ты ${username}, но если ты победишь на ${car}, то я потеряю 100$.`,
            `- ОГО да это же... ой перепутал это кто-то с ником ${username} на ${car}.`
        ];

        const rand = RandomInt.generate({max: text.length - 1});
        return `${text[rand]} ${WelcomeMessage.formattedTotalRace(totalRace)}`;
    }

    private static formattedTotalRace(totalRace: number) {
        return totalRace > 0 ? `У него это ${totalRace} гонка` : '';
    }
}