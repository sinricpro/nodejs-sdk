process.env.SR_DEBUG = 1;

const {
  SinricPro, startSinricPro, raiseEvent, eventNames,
} = require('sinricpro');

const fetch = require('node-fetch');

const APPKEY = '';
const APPSECRET = '';
const device1 = '';
const deviceIds = [device1];

async function mediamtx(offer) {
  const url = `http://pi3:8889/cam/whep`; // Format : `http://<hostname>:8889/<name>/whep`

  try {
    const response = await fetch(url, {
      headers: {
        "content-type": "application/sdp",
      },
      body: offer,
      method: "POST",
    });

    // eslint-disable-next-line no-return-await
    return await response.text();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const webRtcOffer = async (deviceid, format, base64Offer) => {
  const offer = Buffer.from(base64Offer, 'base64').toString();
  const answer = await mediamtx(offer);
  const answerInBase64 = Buffer.from(answer).toString('base64');

  console.log(answerInBase64);
  return { success: true, answer: answerInBase64 };
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, false);
const callbacks = { webRtcOffer };

startSinricPro(sinricpro, callbacks);
