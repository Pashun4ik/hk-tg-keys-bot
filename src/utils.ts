import { Random } from 'random-js'
import { addHours, isAfter, startOfDay, subDays } from 'date-fns'

export const r = new Random()

export const getRandomItem = (list: any[]) => {
    const totalWeight = list.reduce((acc, { weight }) => acc + weight, 0);

    const n = r.integer(0, totalWeight - 1);

    let offset = 0;

    for (const item of list) {
        offset += item.weight;

        if (n < offset) {
            const { weight, ...props } = item;

            return props;
        }
    }
}

export function getToday() {
    const now = new Date()
    const threeAM = new Date()
    threeAM.setHours(3, 0, 0, 0)

    if (isAfter(now, threeAM)) {
        const todayStart = addHours(startOfDay(now), 3);
        return todayStart
    } else {
        const yesterdayStart = addHours(startOfDay(subDays(now, 1)), 3)
        return yesterdayStart
    }
}