import {IResult} from "../../../interfaces/result";

export class GameOver {
    everyone(obj: IResult[]) {
        let result: string[] = [];
        let place = 1;
        console.log("usersArray", obj);

        obj.forEach(user => {
            if (place === 3)
                return;

            // if(user.progress < 100) {
            //     result.push(`${user.name} Не смог увы финишировать ахах, и прошел аж ${user.progress.toFixed(2)}% гонки, может в слудующий раз выйдет лучше`);
            // }
            // else {
                result.push(`На ${place}-${place == 3 ? 'ем' : 'ом'} месте игрок с ником ${user.name} закончил гонку за ${user.time.toFixed(2)} секунд`);
                //result.push(`На ${place}-${place == 3 ? 'ем' : 'ом'} месте игрок с ником ${userName} закончил гонку`);

            place++;
            // }
            //
        });

        return result.join('<br><br>');
    }

    one(obj) {
        return `Наконец-то гонка завершилась для ${obj.name} за рекорные ${obj.time.toFixed(2)}`;
    }
}

export type TGameOver = InstanceType<typeof GameOver>;