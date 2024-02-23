/**
 *   Wechaty Chatbot SDK - https://github.com/wechaty/wechaty
 *
 *   @copyright 2016 Huan LI (李卓桓) <https://github.com/huan>, and
 *                   Wechaty Contributors <https://github.com/wechaty>.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import {
  WechatyBuilder,
  ScanStatus,
  Message,
  Contact,
} from '../src/mods/mod.js' // from 'wechaty'

import qrTerm from 'qrcode-terminal'
import * as PUPPET from 'wechaty-puppet'
import {log} from 'wechaty-puppet'
import axios from 'axios';
import {FileBox} from "file-box";

/**
 *
 * 1. Declare your Bot!
 *
 */
const options = {
  name: 'ding-dong-bot',

  /**
   * You can specify different puppet for different IM protocols.
   * Learn more from https://wechaty.js.org/docs/puppet-providers/
   */
  // puppet: 'wechaty-puppet-whatsapp'

  /**
   * You can use wechaty puppet provider 'wechaty-puppet-service'
   *   which can connect to Wechaty Puppet Services
   *   for using more powerful protocol.
   * Learn more about services (and TOKEN)from https://wechaty.js.org/docs/puppet-services/
   */
  // puppet: 'wechaty-puppet-service'
  // puppetOptions: {
  //   token: 'xxx',
  // }
}

const bot = WechatyBuilder.build(options)

/**
 *
 * 2. Register event handlers for Bot
 *
 */
bot
  .on('logout', onLogout)
  .on('login', onLogin)
  .on('scan', onScan)
  .on('error', onError)
  .on('message', onMessage)
  /**
   *
   * 3. Start the bot!
   *
   */
  .start()
  .catch(async e => {
    console.error('Bot start() fail:', e)
    await bot.stop()
    process.exit(-1)
  })

/**
 *
 * 4. You are all set. ;-]
 *
 */

/**
 *
 * 5. Define Event Handler Functions for:
 *  `scan`, `login`, `logout`, `error`, and `message`
 *
 */
function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    qrTerm.generate(qrcode)

    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')

    console.info('onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
  } else {
    console.info('onScan: %s(%s)', ScanStatus[status], status)
  }

  // console.info(`[${ScanStatus[status]}(${status})] ${qrcodeImageUrl}\nScan QR Code above to log in: `)
}

function onLogin(user: Contact) {
  console.info(`${user.name()} login`)
}

function onLogout(user: Contact) {
  console.info(`${user.name()} logged out`)
}

function onError(e: Error) {
  console.error('Bot error:', e)
  /*
  if (bot.isLoggedIn) {
    bot.say('Wechaty error: ' + e.message).catch(console.error)
  }
  */
}

/**
 *
 * 6. The most important handler is for:
 *    dealing with Messages.
 *
 */
async function onMessage(msg: Message) {
  console.info(msg.toString())

  if (msg.self()) {
    // console.info('Message discarded because its outgoing')
    return
  }

  if (msg.age() > 2 * 60) {
    console.info('信息超时过期')
    return
  }

  const room = msg.room();
  if (room) {
    // console.info(room);

    const payload = room.payload;
    if (!payload) {
      return
    }

    const mentionSelf = await msg.mentionSelf()

    console.info('群名：', payload.topic, '是否@我', mentionSelf);

    if (!mentionSelf) {
      return
    }
  }


  const msgType = msg.type();
  switch (msgType) {
    case PUPPET.types.Message.Text:
      // 过滤掉@信息后的文本内容
      const text = await msg.mentionText()

      console.info('文本内容：', text)

      // 文本过滤
      if (!/^(hi|hello)$/i.test(text)) {
        console.info('消息丢弃，匹配失败')
        return
      }

      // 1. 文本
      await msg.say('hello world')

      // 2. 文件/图片
      const fileBox = FileBox.fromFile('C:\\Users\\Administrator\\Pictures\\20230415项目爬山\\IMG_8800.JPG')
      await msg.say(fileBox)
      console.info('REPLY: %s', fileBox.toString())

      // 3.异步http
      axios.get('http://localhost:8000/a')
        .then(response => {
          console.log('发送了http请求,response:', response.data);
        })
        .catch(error => {
          console.error('There was a problem with the request:', error);
        });

      // 4. 联系人（免费版的傀儡不支持）    only supported by puppet-padplus
      // const contactCard = await bot.Contact.find({ name: msg.text() })
      // if (!contactCard) {
      //   console.info('not found contract:{}', msg.text())
      //   return
      // }
      // await msg.say(contactCard)

      // 5.url卡片（免费版的傀儡不支持）    only supported by puppet-padplus
      // const linkPayload = new bot.UrlLink ({
      //   description : 'WeChat Bot SDK for Individual Account, Powered by TypeScript, Docker, and Love',
      //   thumbnailUrl: 'https://avatars0.githubusercontent.com/u/25162437?s=200&v=4',
      //   title       : 'Welcome to Wechaty',
      //   url         : 'https://github.com/wechaty/wechaty',
      // })
      // await msg.say(linkPayload)

      // 6. 小程序（免费版的傀儡不支持）    only supported by puppet-padplus
      // const miniProgramPayload = new bot.MiniProgram ({
      //   username           : 'gh_xxxxxxx',     //get from mp.weixin.qq.com
      //   appid              : 'wx21c7506e98a2fe75',                  //optional, get from mp.weixin.qq.com
      //   title              : '来杯大师咖啡，开启一天好运',               //optional
      //   pagepath           : '',               //optional
      //   description        : '',               //optional
      //   thumbnailurl       : '',               //optional
      // })
      // await msg.say(miniProgramPayload)

      // 7. 位置（免费版的傀儡不支持）
      // const location = new bot.Location({
      //   accuracy: 15,
      //   address: '北京市北京市海淀区45 Chengfu Rd',
      //   latitude: 39.995120999999997,
      //   longitude: 116.334154,
      //   name: '东升乡人民政府(海淀区成府路45号)',
      // })
      // await msg.say(location)

      break

    case PUPPET.types.Message.Image:
    case PUPPET.types.Message.Attachment:
    case PUPPET.types.Message.Audio:
    case PUPPET.types.Message.Video:
    case PUPPET.types.Message.Emoticon:
      console.info(msg.toFileBox())
      break

    case PUPPET.types.Message.Contact:
      msg.toContact().then((result) => {
        console.info('收到联系人：', result)
      })
      break

    case PUPPET.types.Message.Url:
      msg.toUrlLink().then((result) => {
        console.info('收到url：', result)
      })
      break

    case PUPPET.types.Message.MiniProgram:
      msg.toMiniProgram().then((result) => {
        console.info('收到小程序：', result)
      })
      break

    case PUPPET.types.Message.Location:
      msg.toLocation().then((result) => {
        console.info('收到位置：', result)
      })
      break

    case PUPPET.types.Message.Post:
      msg.toPost().then((result) => {
        console.info('收到卡片：', result)
      })
      break

    default:
      log.warn('Wechaty',
        'toSayable() can not convert not re-sayable type: %s(%s) for %s\n%s',
        PUPPET.types.Message[msgType],
        msgType,
        msg,
        new Error().stack,
      )
      return undefined
  }
  return
}

/**
 *
 * 7. Output the Welcome Message
 *
 */
const welcome = `
| __        __        _           _
| \\ \\      / /__  ___| |__   __ _| |_ _   _
|  \\ \\ /\\ / / _ \\/ __| '_ \\ / _\` | __| | | |
|   \\ V  V /  __/ (__| | | | (_| | |_| |_| |
|    \\_/\\_/ \\___|\\___|_| |_|\\__,_|\\__|\\__, |
|                                     |___/

=============== Powered by Wechaty ===============
-------- https://github.com/wechaty/wechaty --------
          Version: ${bot.version()}

I'm a bot, my superpower is talk in Wechat.

If you send me a 'ding', I will reply you a 'dong'!
__________________________________________________

Hope you like it, and you are very welcome to
upgrade me to more superpowers!

Please wait... I'm trying to login in...

`
console.info(welcome)
