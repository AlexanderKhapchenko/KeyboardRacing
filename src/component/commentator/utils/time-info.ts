import {IUser} from "../../../interfaces/user";

export class TimeInfo {
    everyone({usersInRoom, time} : {usersInRoom: IUser[], time: number}) {
        usersInRoom.sort((a, b) => a.progress < b.progress ? -1 : 1);
        let result: string[] = [];
        result.push('Боряться за первенство в такой последовательности')
        usersInRoom.forEach(user => {
            if(user.progress < 100) {
                result.push(`${user.name}`);
            }
            else {
                result.push(`А через всего ${user.time} уже был на финише ${user.name}`);
            }
        });
        result.push(`Внимание до конца гонки уже менее ${time} секунд`);
        return result.join('<br>');
    }
}

export type TTimeInfo = InstanceType<typeof TimeInfo>;