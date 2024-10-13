import { Bot } from "grammy";
import { run } from "@grammyjs/runner"
import { MongoClient, ObjectId } from 'mongodb'
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import readline from "readline";
import { limit } from "@grammyjs/ratelimiter";

import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'

import { proxies } from "./proxies-list";
import { getRandomItem, getToday } from "./utils";

let rawProxies = [...proxies]

const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const tgClient = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

tgClient.start({
    phoneNumber: async () =>
        new Promise((resolve) =>
            rl.question("Please enter your number: ", resolve)
        ),
    password: async () =>
        new Promise((resolve) =>
            rl.question("Please enter your password: ", resolve)
        ),
    phoneCode: async () =>
        new Promise((resolve) =>
            rl.question("Please enter the code you received: ", resolve)
        ),
    onError: (err: any) => console.log(err),
}).catch(console.error).then(console.log)

const bot = new Bot(process.env.token); // <-- put your bot token between the "" (https://t.me/BotFather)

const client = new MongoClient('mongodb://localhost:27017/hamsterkeys?retryWrites=true&w=majority&appName=hamsterkeys')

client.connect()

// enabled flag

let bots: { buzy?: boolean, name: 'pinoutmaster' | 'countmasters' | 'hideball' | 'bouncemasters' | 'stoneage' | 'cube' | 'clone' | 'miner' | 'mergeaway' | 'twerkrace' | 'polysphere' | 'mowandtrim' | 'zoopolis' | 'tiletrio' | 'crusade', clientToken: string, appToken: string, promoId: string, keys: Set<string>, main?: boolean, lastTick: number }[] = [
]

function generateEventId() {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const digits = '0123456789';

    const firstPart = generateRandomString(characters, 8);
    const secondPart = generateRandomString(digits, 4);
    const thirdPart = generateRandomString(characters, 4);
    const fourthPart = generateRandomString(characters, 4);
    const fifthPart = generateRandomString(characters, 12);

    return `${firstPart}-${secondPart}-${thirdPart}-${fourthPart}-${fifthPart}`;
}

function generateRandomString(characters: string, length: number) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

let workingProxies: string[] = []

function generateClientId() {
    const timestamp = Date.now().toString();
    const randomDigits = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');

    return `${timestamp}-${randomDigits}`;
}

const apps: { name: 'pinoutmaster' | 'countmasters' | 'hideball' | 'bouncemasters' | 'stoneage' | 'cube' | 'miner' | 'mergeaway' | 'twerkrace' | 'polysphere' | 'mowandtrim' | 'zoopolis' | 'tiletrio' | 'crusade', token: string, promoId: string, weight: number }[] = [
    { name: 'cube', token: 'd1690a07-3780-4068-810f-9b5bbf2931b2', promoId: 'b4170868-cef0-424f-8eb9-be0622e8e8e3', weight: 6 },
    { name: 'miner', token: '82647f43-3f87-402d-88dd-09a90025313f', promoId: 'c4480ac7-e178-4973-8061-9ed5b2e17954', weight: 6 },
    { name: 'mergeaway', token: '8d1cc2ad-e097-4b86-90ef-7a27e19fb833', promoId: 'dc128d28-c45b-411c-98ff-ac7726fbaea4', weight: 6 },
    { name: 'twerkrace', token: '61308365-9d16-4040-8bb0-2f4a4c69074c', promoId: '61308365-9d16-4040-8bb0-2f4a4c69074c', weight: 6 },
    { name: 'polysphere', token: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71', promoId: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71', weight: 6 },
    { name: 'mowandtrim', token: 'ef319a80-949a-492e-8ee0-424fb5fc20a6', promoId: 'ef319a80-949a-492e-8ee0-424fb5fc20a6', weight: 6 },
    { name: 'zoopolis', token: 'b2436c89-e0aa-4aed-8046-9b0515e1c46b', promoId: 'b2436c89-e0aa-4aed-8046-9b0515e1c46b', weight: 6 },
    { name: 'tiletrio', token: 'e68b39d2-4880-4a31-b3aa-0393e7df10c7', promoId: 'e68b39d2-4880-4a31-b3aa-0393e7df10c7', weight: 6 },
    { name: 'crusade', token: '112887b0-a8af-4eb2-ac63-d82df78283d9', promoId: '112887b0-a8af-4eb2-ac63-d82df78283d9', weight: 13 },
    { name: 'stoneage', token: '04ebd6de-69b7-43d1-9c4b-04a6ca3305af', promoId: '04ebd6de-69b7-43d1-9c4b-04a6ca3305af', weight: 6 },
    { name: 'bouncemasters', token: 'bc72d3b9-8e91-4884-9c33-f72482f0db37', promoId: 'bc72d3b9-8e91-4884-9c33-f72482f0db37', weight: 6 },
    { name: 'hideball', token: '4bf4966c-4d22-439b-8ff2-dc5ebca1a600', promoId: '4bf4966c-4d22-439b-8ff2-dc5ebca1a600', weight: 6 },
    { name: 'pinoutmaster', token: 'd2378baf-d617-417a-9d99-d685824335f0', promoId: 'd2378baf-d617-417a-9d99-d685824335f0', weight: 8 },
    { name: 'countmasters', token: '4bdc17da-2601-449b-948e-f8c7bd376553', promoId: '4bdc17da-2601-449b-948e-f8c7bd376553', weight: 8 },
]

async function main() {
    let s = 0

    proxies = [...rawProxies]

    for (let i = 0; i < 5; i++) {
        const app = apps[i]


        // console.log(app.name)

        await fetch('https://api.gamepromo.io/promo/login-client', {
            method: 'POST',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'Host': 'api.gamepromo.io',
                // 'Authorization': 'Bearer d28721be-fd2d-4b45-869e-9f253b554e50:deviceid:1722208960995-8529590076659775157:8B4vjh6mLSi:1722208961107',
            },
            body: JSON.stringify({
                appToken: app.token,
                clientId: generateClientId(),
                clientOrigin: 'deviceid'
            })
        }).then(x => x.json()).then(e => {
            // console.log(e)

            if (e.clientToken) {

                bots.push({
                    name: app.name,
                    clientToken: e.clientToken,
                    appToken: app.token,
                    promoId: app.promoId,
                    keys: new Set(),
                    main: true,
                    buzy: false,
                    lastTick: Date.now()
                })
            }

        }).catch(() => { })
        await new Promise(rs => setTimeout(rs, 300))
    }

    const limit = 9 + 420

    while (bots.length < limit) {
        if (bots.length % 20 === 0) console.log(bots.length)

        await Promise.allSettled(Array.from({ length: 10 }, async () => {
            const app = getRandomItem(apps) //apps[Math.floor(Math.random() * 4)]

            // console.log('get', app.name)

            const proxy = proxies[Math.floor(Math.random() * proxies.length)]
            const httpAgent = new HttpsProxyAgent(`http://` + proxy, { keepAlive: true });
            const httpsAgent = new HttpsProxyAgent(`http://` + proxy, { keepAlive: true });


            await Promise.race([
                axios({
                    // timeout: 1000,
                    url: 'https://api.gamepromo.io/promo/login-client',
                    method: 'POST',
                    data: {
                        appToken: app.token,
                        clientId: generateClientId(),
                        clientOrigin: 'deviceid'
                    },
                    headers: {
                        'content-type': 'application/json; charset=utf-8',
                        'Host': 'api.gamepromo.io',
                    },
                    httpAgent,
                    httpsAgent,
                }).then((x: any) => x.data).then((x: any) => {
                    workingProxies.push(proxy)
                    // s++
                    bots.push({
                        name: app.name,
                        clientToken: x.clientToken,
                        appToken: app.token,
                        promoId: app.promoId,
                        keys: new Set(),
                        lastTick: Date.now()
                    })

                    // console.log(bots)
                }).catch(e => {
                    proxies = proxies.filter(str => str !== proxy)
                    // console.log('error', e)
                }),
                new Promise(rs => setTimeout(rs, 500))
            ])
        }))

        // await new Promise(rs => setTimeout(rs, 10))
    }

}


setInterval(async () => {
    bots = bots.filter(bot => bot.keys.size <= 2 && !bot.buzy).filter(bot => !bot.main)
    main()
}, 21_000 * 5 * 4 + 5000)

main()

type Task = {
    appName?: 'pinoutmaster' | 'countmasters' | 'hideball' | 'bouncemasters' | 'stoneage' | 'cube' | 'clone' | 'miner' | 'mergeaway' | 'twerkrace' | 'polysphere' | 'mowandtrim' | 'zoopolis' | 'tiletrio' | 'crusade',
    username?: string,
    createdAt: Date,
    completedAt?: Date,
    userId: number,
    duration: number,
    status: 'rejected' | 'resolved' | 'waiting' | 'pending',
    messageId?: number,
    pendingAt?: Date,
    promocode?: string
    clientToken?: string
}

bot.command("start", ctx => {
    // console.log(ctx.message?.from.id)

    // client.db().collection('users').insertOne({ id: ctx.message?.from.id })

    ctx.reply(`
        Канал: @hamsterkombatpromocodes
        Автор: @alexandarium
        Поддержать проект:
        Звёздами:
        /stars {количество} - например,
        <code>/stars 100</code>

        TON:
        <b>UQC1Pjbw22A1tLomaDIIlnn-Vy3nR-kHFFmvIQmIPdPHXTuN</b>
        
        USDT(trc20):
        <b>THsfcb33cVvKt91nSat5KomLDNjF8ecuCR</b>

        Тут ты найдешь промокоды для обмена на ключи в Hamster Kombat.
        Жми /cube - ключи для Chain Cube 2048
        Жми /miner - ключи для Train miner
        Жми /mergeaway - ключи для Merge Away
        Жми /twerkrace - ключи для Twerk Race
        Жми /polysphere - ключи для Polysphere
        Жми /mowandtrim - ключи для Mow and Trim
        Жми /zoopolis - ключи для Zoopolis
        Жми /tiletrio - ключи для Tile Trio
        Жми /stoneage - ключи для Stone Age
        Жми /bouncemasters - ключи для Bouncemasters
        Жми /hideball - ключи для Hide Ball
        Жми /pinoutmaster - ключи для Pin Out Master
        Жми /countmasters - ключи для Count Masters
        Жми /crusade - ключи для Fluff Crusade
        Жми /position, чтобы увидеть вашу позицию в очереди
        Жми /stats для просмотра статистики
        У вас будет 1.5 минуты, чтобы ввести промокод, всего за день дается возможность получить все 4 ключа
    `.trim().split('\n').map(x => x.trim()).join('\n'), { parse_mode: 'HTML' }).catch(() => { })
})

// client.db().collection('tasks').deleteMany({}).then(console.log)

bot.command('cube', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'cube',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'cube',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'cube',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'cube', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('stoneage', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'stoneage',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'stoneage',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'stoneage',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'stoneage', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('bouncemasters', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'bouncemasters',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'bouncemasters',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'bouncemasters',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'bouncemasters', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('hideball', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'hideball',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'hideball',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'hideball',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'hideball', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('pinoutmaster', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'pinoutmaster',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'pinoutmaster',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'pinoutmaster',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'pinoutmaster', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('countmasters', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'countmasters',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'countmasters',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'countmasters',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'countmasters', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('miner', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'miner',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'miner',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'miner',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'miner', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('mergeaway', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'mergeaway',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'clone',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'mergeaway',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'mergeaway', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('twerkrace', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'twerkrace',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'clone',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'twerkrace',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'twerkrace', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('polysphere', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'polysphere',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'clone',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'polysphere',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'polysphere', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('mowandtrim', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'mowandtrim',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'clone',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'mowandtrim',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'mowandtrim', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('zoopolis', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'zoopolis',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'clone',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'zoopolis',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'zoopolis', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('tiletrio', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'tiletrio',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'clone',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 5) {
        ctx.reply("Вы забрали все (5/5) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'tiletrio',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'tiletrio', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('crusade', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    try {
        const isUserChecked = (await client.db().collection<{ userId: number }>('participants').countDocuments({ userId: ctx.message.from.id })) > 0

        if (!isUserChecked && ctx.message.from.username) {

            await Promise.race([
                tgClient.invoke(
                    new Api.channels.GetParticipant({
                        // channel: -1002167344942,
                        // participant: ctx.message.from.id
                        channel: "@hamsterkombatpromocodes",
                        participant: ctx.message.from.username
                    })
                ),
                new Promise(rs => setTimeout(rs, 5000))
            ])

            client.db().collection<{ userId: number }>('participants').insertOne({ userId: ctx.message.from.id })
        }

        // console.log(x)
    } catch (e: any) {
        // console.log(e)

        if (e.toString().includes('USER_NOT_PARTICIPANT') && ctx.message.from.username) {
            ctx.reply("Подпишитесь на канал @hamsterkombatpromocodes чтобы иметь возможность получать ключи").catch(() => { })
            return
        }
    }

    const count = await client.db().collection<Task>('tasks').countDocuments({
        appName: 'crusade',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        // appName: 'clone',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (waitingCount) {
        ctx.reply("Ваш ключ обрабатывается/дождитесь 1.5 минуты пока ключ исчезнет").catch(() => { })
        return
    }

    if (count >= 12) {
        ctx.reply("Вы забрали все (8/12) ежедневные ключи").catch(() => { })
        return
    }

    const taskId = new ObjectId()

    await client.db().collection<Task>('tasks').insertOne({
        appName: 'crusade',
        _id: taskId,
        status: 'waiting',
        userId: ctx.message.from.id,
        duration: 90000,
        createdAt: new Date(),
        username: ctx.message.from.username
        // messageId: ctx.message!.message_id
    })

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: 'crusade', $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(taskId))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { })
})

bot.command('position', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    // const count = await client.db().collection<Task>('tasks').countDocuments({
    //     userId: ctx.message?.from.id,
    //     createdAt: { $gte: getToday() }
    // })

    const waitingTask = await client.db().collection<Task>('tasks').findOne({
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })

    if (!waitingTask) {
        ctx.reply('У вас нет ключа в обработке').catch(() => { })
        return
    }

    const waitingTasks = await client.db().collection<Task>('tasks').find({ appName: waitingTask.appName, $or: [{ status: 'waiting' }] }).sort({ createdAt: 1 }).toArray()

    const idx = waitingTasks.findIndex(x => x._id.equals(waitingTask._id))

    ctx.reply(`Ваше место в очереди: ${idx + 1}`).catch(() => { }).catch(() => { })
})

bot.command('stats', async ctx => {
    if (!ctx.message?.from.id) {
        ctx.reply("юзера не найдено").catch(() => { })
        return
    }

    const keysCount = await client.db().collection<Task>('tasks').countDocuments({ $or: [{ status: 'rejected' }, { status: 'resolved' }] })

    const dailyKeysCount = await client.db().collection<Task>('tasks').countDocuments({
        createdAt: { $gte: getToday() },
        $or: [{ status: 'rejected' }, { status: 'resolved' }]
    })


    const count = await client.db().collection<Task>('tasks').countDocuments({
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })

    const queueLength = await client.db().collection<Task>('tasks').countDocuments({
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })

    ctx.reply(`
        Выдано промокодов: ${keysCount} всего / ${dailyKeysCount} за день
        Текущая длина очереди: ${queueLength}
        Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}
        Вы забрали (${count}/${8 * 5 + 7})
        
        Chain Cube 2048 (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'cube',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
        Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'cube',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
        Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'cube',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Train miner (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'miner',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
        Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'miner',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
        Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'miner',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}
    
        Merge away (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'mergeaway',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
        Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'mergeaway',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
        Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'mergeaway',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Twerk Race (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'twerkrace',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
        Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'twerkrace',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
        Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'twerkrace',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Polysphere (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'polysphere',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
            Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'polysphere',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
            Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'polysphere',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Mow and Trim (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'mowandtrim',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
            Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'mowandtrim',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
            Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'mowandtrim',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Zoopolis (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'zoopolis',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
            Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'zoopolis',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
            Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'zoopolis',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Tile Trio (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'tiletrio',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
            Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'tiletrio',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
            Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'tiletrio',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Stone Age (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'stoneage',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
        Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'stoneage',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
        Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'stoneage',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Bouncemasters (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'bouncemasters',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
        Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'bouncemasters',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
        Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'bouncemasters',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Hide Ball (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'hideball',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
        Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'hideball',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
        Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'hideball',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Pin Out Master (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'pinoutmaster',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
        Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'pinoutmaster',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
        Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'pinoutmaster',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Count Masters (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'countmasters',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/5)
        Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'countmasters',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
        Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'countmasters',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}

        Fluff Crusade (${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'crusade',
        userId: ctx.message?.from.id,
        createdAt: { $gte: getToday() }
    })}/8)
            Длина очереди: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'crusade',
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }]
    })}
            Вводят кодов прямо сейчас: ${await client.db().collection<Task>('tasks').countDocuments({
        appName: 'crusade',
        createdAt: { $gte: getToday() }, $or: [{ status: 'pending' }]
    })}
        
    `.trim().split('\n').map(x => x.trim()).join('\n')).catch(() => { })
})

bot.command('donate', (ctx) => {
    ctx.reply(`
        Поддержать проект:
        Звёздами:
        /stars {количество} - например,
        <code>/stars 100</code>

        TON:
        <b>UQC1Pjbw22A1tLomaDIIlnn-Vy3nR-kHFFmvIQmIPdPHXTuN</b>
        
        USDT(trc20):
        <b>THsfcb33cVvKt91nSat5KomLDNjF8ecuCR</b>
    `.trim().split('\n').map(x => x.trim()).join('\n'), { parse_mode: 'HTML' }).catch(() => { })
})

bot.command('stars', ctx => {
    const stars = Math.round(+ctx.match)

    if (!Number.isNaN(stars) && stars > 0) {
        return ctx.replyWithInvoice('Поддержать проект', 'Поддержать проект', JSON.stringify(stars), 'XTR', [{ label: 'XTR', amount: stars }])
    }
})


bot.on('pre_checkout_query', ctx => {
    client.db().collection('pre_checkout_query').insertOne({ ctx })

    return ctx
        .answerPreCheckoutQuery(true, "В настоящее время совершить покупку")
        .catch((err: any) => console.error(` [x] - Failed to handle pre-checkout of user[${ctx.from.id}]: ${err}`))
})

bot.on(':successful_payment', async ctx => {
    client.db().collection('successful_payments').insertOne({ ctx })

    ctx.reply('Спасибо!')
})

bot.on("message", (ctx) => {
    ctx.reply(`
        Канал: @hamsterkombatpromocodes
        Автор: @alexandarium
        Поддержать проект:
        Звёздами:
        /stars {количество} - например,
        <code>/stars 100</code>

        TON:
        <b>UQC1Pjbw22A1tLomaDIIlnn-Vy3nR-kHFFmvIQmIPdPHXTuN</b>
        
        USDT(trc20):
        <b>THsfcb33cVvKt91nSat5KomLDNjF8ecuCR</b>

        Тут ты найдешь промокоды для обмена на ключи в Hamster Kombat.
        Жми /cube - ключи для Chain Cube 2048
        Жми /miner - ключи для Train miner
        Жми /mergeaway - ключи для Merge Away
        Жми /twerkrace - ключи для Twerk Race
        Жми /polysphere - ключи для Polysphere
        Жми /mowandtrim - ключи для Mow and Trim
        Жми /zoopolis - ключи для Zoopolis
        Жми /tiletrio - ключи для Tile Trio
        Жми /stoneage - ключи для Stone Age
        Жми /bouncemasters - ключи для Bouncemasters
        Жми /hideball - ключи для Hide Ball
        Жми /pinoutmaster - ключи для Pin Out Master
        Жми /countmasters - ключи для Count Masters
        Жми /crusade - ключи для Fluff Crusade
        Жми /position, чтобы увидеть вашу позицию в очереди
        Жми /stats для просмотра статистики
        У вас будет 1.5 минуты, чтобы ввести промокод, всего за день дается возможность получить все 4 ключа
    `.trim().split('\n').map(x => x.trim()).join('\n'), { parse_mode: 'HTML' }).catch(() => { }).catch(() => { })
});

bot.catch(err => {
    console.error(err)
    setTimeout(() => run(bot), 5000)
})

bot.use(
    limit({
        // Allow only 3 messages to be handled every 2 seconds.
        timeFrame: 2000,
        limit: 5,

        // This is called when the limit is exceeded.
        onLimitExceeded: async (ctx) => {
            await ctx.reply("Слишком много запросов!");
        },

        // Note that the key should be a number in string format such as "123456789".
        keyGenerator: (ctx) => {
            return ctx.from?.id.toString();
        },
    })
);

run(bot);

const excludedTasks: ObjectId[] = []

async function checkCode(bikeBot: { buzy?: boolean, name: string, clientToken: string, promoId: string }) {
    return fetch('https://api.gamepromo.io/promo/register-event', {
        method: 'POST',
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'Host': 'api.gamepromo.io',
            'Authorization': 'Bearer ' + bikeBot.clientToken,

        },
        body: JSON.stringify({ 'promoId': bikeBot.promoId, 'eventId': generateEventId(), 'eventOrigin': 'undefined' })
    }).then(x => x.json()).then(async e => {
        if (e.hasCode) return false

        if (!e.hasCode) {
            return true
        }
    }).catch(() => false)
}

setInterval(async () => {
    const waitingCount = await client.db().collection<Task>('tasks').countDocuments({
        createdAt: { $gte: getToday() }, $or: [{ status: 'waiting' }, { status: 'pending' }]
    })
    if (waitingCount === 0) return

    const timeout: Record<'pinoutmaster' | 'countmasters' | 'hideball' | 'bouncemasters' | 'stoneage' | 'clone' | 'cube' | 'miner' | 'mergeaway' | 'twerkrace' | 'polysphere' | 'mowandtrim' | 'zoopolis' | 'tiletrio' | 'crusade', number> = {
        clone: 22000,
        cube: 22000,
        miner: 22000,
        mergeaway: 22000,
        twerkrace: 22000,
        polysphere: 22000,
        mowandtrim: 22000,
        zoopolis: 22000,
        tiletrio: 22000,
        stoneage: 22000,
        bouncemasters: 22000,
        hideball: 22000,
        crusade: 22000,
        pinoutmaster: 22000,
        countmasters: 22000
    }

    for (const bikeBot of bots.filter(bot => (Date.now() - bot.lastTick) > (timeout[bot.name] || 23000))) {
        bikeBot.lastTick = Date.now()

        await fetch('https://api.gamepromo.io/promo/register-event', {
            method: 'POST',
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'Host': 'api.gamepromo.io',
                'Authorization': 'Bearer ' + bikeBot.clientToken,

            },
            body: JSON.stringify({ 'promoId': bikeBot.promoId, 'eventId': generateEventId(), 'eventOrigin': 'undefined' })
        }).then(x => x.json()).then(async e => {
            if (e.hasCode) {
                fetch('https://api.gamepromo.io/promo/create-code', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json; charset=utf-8',
                        'Host': 'api.gamepromo.io',
                        'Authorization': 'Bearer ' + bikeBot.clientToken,
                    },
                    body: JSON.stringify({ 'promoId': bikeBot.promoId })
                }).then(x => x.json()).then(async code => {
                    // console.log({ code }, bikeBot.name)

                    if (code.promoCode) {
                        if (await client.db().collection<Task>('tasks').findOne({ status: { $ne: 'resolved' }, promocode: code.promoCode })) return
                        bikeBot.keys.add(code.promoCode)


                        const task = await client.db().collection<Task>('tasks').findOne({
                            appName: bikeBot.name,
                            status: 'waiting'
                        }, { sort: { createdAt: 1 } })

                        const taskAppName = task?.appName || 'bike'

                        if (task && taskAppName === bikeBot.name) {
                            if (excludedTasks.some(x => x.equals(task._id))) return
                            excludedTasks.push(task._id)
                            client.db().collection<Task>('tasks').updateOne({
                                _id: task._id,
                            }, {
                                $set: {
                                    promocode: code.promoCode,
                                    status: 'pending',
                                    pendingAt: new Date(),
                                    clientToken: bikeBot.clientToken
                                }
                            })

                            bikeBot.buzy = true

                            const count = await client.db().collection<Task>('tasks').countDocuments({
                                appName: task.appName,
                                userId: task.userId,
                                createdAt: { $gte: getToday() }
                            })

                            try {
                                const msg = await bot.api.sendMessage(task.userId, `<code>${code.promoCode}</code>`, { parse_mode: 'HTML' })

                                bot.api.sendMessage(task.userId, `Ваш промокод (${taskAppName}) (${count}/${task.appName === 'crusade' ? 8 : 5})\nУ вас есть 1.5 минуты, чтобы ввести его, или он перейдет другому \nПоддержать проект /donate`).catch(() => { })
                                // bot.api.sendMessage(task.userId, `Ваш промокод (${count}/4): ${code.promoCode}.\n У вас есть 2 минуты, чтобы ввести его, или он перейдет другому \nПоддержать проект (ton): UQC1Pjbw22A1tLomaDIIlnn-Vy3nR-kHFFmvIQmIPdPHXTuN`)
                                client.db().collection<Task>('tasks').updateOne({
                                    _id: task._id,
                                }, {
                                    $set: {
                                        messageId: msg.message_id
                                    }
                                })
                            } catch (e) {
                                console.error(e)
                            }

                            let tm1 = setTimeout(async () => {
                                const codeEntered = await checkCode(bikeBot)

                                if (codeEntered) {
                                    const task = await client.db().collection<Task>('tasks').findOne({
                                        clientToken: bikeBot.clientToken,
                                        appName: bikeBot.name,
                                        status: 'pending'
                                    })

                                    if (task && task.messageId) {
                                        bikeBot.buzy = false
                                        clearTimeout(tm2)
                                        clearTimeout(tm3)

                                        await client.db().collection<Task>('tasks').updateOne({
                                            _id: task._id,
                                        }, {
                                            $set: {
                                                status: 'resolved'
                                            }
                                        })
                                        bot.api.deleteMessage(task.userId, task.messageId).catch(console.log)
                                        bot.api.sendMessage(task.userId, `Вы активировали код, и можете получить следующий\n<code>/stars 1</code>`, { parse_mode: 'HTML' }).catch(console.log)
                                    }
                                }
                            }, 20000)

                            let tm2 = setTimeout(async () => {
                                const codeEntered = await checkCode(bikeBot)

                                if (codeEntered) {
                                    const task = await client.db().collection<Task>('tasks').findOne({
                                        clientToken: bikeBot.clientToken,
                                        appName: bikeBot.name,
                                        status: 'pending'
                                    })

                                    if (task && task.messageId) {
                                        bikeBot.buzy = false
                                        clearTimeout(tm3)

                                        await client.db().collection<Task>('tasks').updateOne({
                                            _id: task._id,
                                        }, {
                                            $set: {
                                                status: 'resolved'
                                            }
                                        })
                                        bot.api.deleteMessage(task.userId, task.messageId).catch(console.log)
                                        bot.api.sendMessage(task.userId, `Вы активировали код, и можете получить следующий\n<code>/stars 1</code>`, { parse_mode: 'HTML' }).catch(console.log)
                                    }
                                }
                            }, 40000)

                            let tm3 = setTimeout(async () => {
                                const codeEntered = await checkCode(bikeBot)

                                if (codeEntered) {
                                    const task = await client.db().collection<Task>('tasks').findOne({
                                        clientToken: bikeBot.clientToken,
                                        appName: bikeBot.name,
                                        status: 'pending'
                                    })

                                    if (task && task.messageId) {
                                        bikeBot.buzy = false
                                        // clearTimeout(tm2)

                                        await client.db().collection<Task>('tasks').updateOne({
                                            _id: task._id,
                                        }, {
                                            $set: {
                                                status: 'resolved'
                                            }
                                        })
                                        bot.api.deleteMessage(task.userId, task.messageId).catch(console.log)
                                        bot.api.sendMessage(task.userId, `Вы активировали код, и можете получить следующий\n<code>/stars 1</code>`, { parse_mode: 'HTML' }).catch(console.log)
                                    }
                                }
                            }, 60000)

                        }
                    }
                }).catch((e) => { console.error(e) })
            }
        }).catch((e) => { console.error(e) })

        await new Promise(rs => setTimeout(rs, 1500))
    }
}, 1000)

setInterval(async () => {
    const pendingTasks = await client.db().collection<Task>('tasks').find({
        status: 'pending'
    }).sort('createdAt').toArray()

    for (const task of pendingTasks) {
        // console.log(task.userId, task.messageId)
        if (Date.now() - task.pendingAt!.getTime() > task.duration) {
            if (bots.find(b => b.clientToken === task.clientToken && b.name === task.appName)) {
                bots.find(b => b.clientToken === task.clientToken && b.name === task.appName)!.buzy = false
            }

            if (task.messageId) {
                bot.api.deleteMessage(task.userId, task.messageId).catch(console.log)
                bot.api.sendMessage(task.userId, `Вы активировали код, и можете получить следующий\n<code>/stars 1</code>`, { parse_mode: 'HTML' }).catch(console.log)
            }
            client.db().collection<Task>('tasks').updateOne({
                _id: task._id,
            }, {
                $set: {
                    status: 'resolved'
                }
            })
        }
    }
}, 5000)