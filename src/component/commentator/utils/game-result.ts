import {IResult} from "../../../interfaces/result";

export class GameResult {
    static forAll(users: IResult[]) {
        let result: string[] = [];
        let place = 1;

        users.forEach(user => {
            if (place === 3)
                return;

                result.push(`На ${place}-${place == 3 ? 'ем' : 'ом'} месте игрок с ником ${user.name} закончил гонку за ${user.time.toFixed(2)} секунд`);
                place++;
        });

        return result.join('<br><br>');
    }

    static forOne(user: IResult) {
        return `Наконец-то гонка завершилась для ${user.name} за рекорные ${user.time.toFixed(2)}`;
    }
}

export type TGameResult = InstanceType<typeof GameResult>;
