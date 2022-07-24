export class TimeInfo {
    everyone(obj) {
        obj.usersInRoom.sort((a, b) => a.progress < b.progress ? -1 : 1);
        let result: string[] = [];
        result.push('Боряться за первенство в такой последовательности')
        obj.usersInRoom.forEach(user => {
            if(user.progress < 100) {
                result.push(`${user.name}`);
            }
            else {
                result.push(`А через всего ${user.time} уже был на финише ${user.name}`);
            }
        });
        result.push(`Внимание до конца гонки уже менее ${obj.time} секунд`);
        return result.join('<br>');
    }
}

export type TTimeInfo = InstanceType<typeof TimeInfo>;