import { gmailAppPassword, gmailAdress } from './config.js';

import Imap from 'imap';
import { parse } from 'csv-parse';
import { PassThrough } from 'stream';
import { simpleParser } from 'mailparser';
import fs from 'fs';

const tmpFile = 'files/tmp.csv'

const imap = new Imap({
  user: gmailAdress,
  password: gmailAppPassword,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

function openInbox(cb: (err: Error | null, mailbox: Imap.Box) => void) {
  imap.openBox('INBOX', false, cb);
}

export async function loadCsvMail(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    imap.once('ready', () => {
      openInbox(async (err, _mailbox) => {
        if (err) {
          reject(err);
        }

        const searchCriteria = ['UNSEEN', ['FROM', 'no-reply@govee.com'], ['SUBJECT', 'Data']];
        const fetchOptions = { bodies: [''], struct: true };

        imap.search(searchCriteria, async (err, results) => {
          if (err) {
            reject(err);
          }

          if (!results || !results.length) {
            console.log('No unread emails found.');
            return;
          }

          const message = results[results.length - 1];

          const f = imap.fetch(message, fetchOptions);
          f.on('message', async (msg, _seqno) => {
            const msgStream = new PassThrough();

            msg.on('body', (stream, _info) => {
              stream.pipe(msgStream);
            });

            const rawEmail = await simpleParser(msgStream);
            const attachment = rawEmail.attachments[0];

            if (attachment) {
              fs.writeFileSync(tmpFile, attachment.content);
              console.log("loading new csv from mail succesful!")
              resolve()
            } else {
              console.log("error! loading new csv from mail")
              reject(new Error('No attachments found.'));
            }
          });

          f.once('error', (err) => {
            reject(err);
          });

          f.once('end', () => {
            imap.end();
          });
        });
      });
    });

    imap.once('error', (err: any) => {
      reject(err);
    });

    imap.connect();
  });
}