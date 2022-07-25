import { IUser } from "../../interfaces/user";
import {AnyPhrases, GameResult, TimeInfo} from "./utils";
import {IResult} from "../../interfaces/result";
import {WelcomeMessage} from "./utils/welcome-message";
import {ICar} from "./utils/car-interface";

export class Commentator {
    constructor(
        private name: string,
        private car: ICar,
        private carNumber: number,
    ) {
    }

    getHello(username: string) {
        return WelcomeMessage.forOne({
            username,
            name: this.name,
            car: this.car.getModel(),
            carNumber: this.carNumber
        });
    }

    getHelloForAll(users : IUser[]) {
        return WelcomeMessage.forAll(users);
    }

    getTimeInfo({usersInRoom, time} : {usersInRoom: IUser[], time: number}) {
        return TimeInfo.generate({usersInRoom, time});
    }

    getSymbolInfo(name: string) {
        return `А вот ${name} до конца гонки на расстоянии уже менее 30ти символов`;
    }

    getAnyPhrases() {
        return AnyPhrases.generate();
    }

    getResultForOne(user: IResult) {
        return GameResult.forOne(user);
    }

    getResultForAll(users: IResult[]) {
        return GameResult.forAll(users);
    }
}

export type TCommentator = InstanceType<typeof Commentator>;
