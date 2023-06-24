import { telegramBotKey, telegramChatId } from './config.js';
import { TelegramClient } from './telegram.js';

import fs from 'fs';
import moment from 'moment-timezone'


import { drawGraph } from './graph.js';
import { readAvgHistory, readTmp } from './readCsv.js';
import schedule from 'node-schedule';
import { loadCsvMail } from './loadCsvMail.js'
import { analysisMessage } from './csvToMessage.js';

async function dailyUpdate(): Promise<void> {
  // loads the new data in files/tmp.csv
  await loadCsvMail();

  // today
  const tmpData = readTmp();
  const message = analysisMessage(tmpData);

  // avgHistory
  const avgHumidity = (tmpData.reduce((acc: any, curr: any) => acc + curr[2], 0)) / tmpData.length;
  appendAvgHistory(avgHumidity);

  // visualize avgHistory
  const outPath = "files/tmp.jpg";
  const [x, y] = readAvgHistory();
  drawGraph(x, y, outPath);

  // sendMessages
  const telegram = new TelegramClient(telegramChatId, telegramBotKey, false);
  telegram.sendText(message);
  telegram.sendImage(outPath);
}


function appendAvgHistory(humidity: number): string {
  const date = new Date();

  const daysSinceMay1 = Math.floor((date.getTime() - new Date(date.getFullYear(), 4, 1).getTime()) / (24 * 60 * 60 * 1000));

  const data = `${daysSinceMay1},${humidity.toFixed(1)}\n`;

  fs.appendFileSync("files/avgHistory.csv", data);
  return data;
}


function schedule6pm(fun: any) {

  const rule = new schedule.RecurrenceRule();
  rule.hour = moment().tz("Europe/Berlin").hour(16).hour();
  rule.minute = moment().tz("Europe/Berlin").minute(0).minute();

  const job = schedule.scheduleJob(rule, fun);
}

schedule6pm(dailyUpdate)
