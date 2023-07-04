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
  /* 
    Get the answer from mediamtx `http://<hostname>:8889/<name>/whep`. eg: http://pi3:8889/cam/whep
  */
  const url = `http://<hostname>:8889/<name>/whep`; 
  const response = await fetch(url, {
    headers: {
      "content-type": "application/sdp",
    },
    body: offer,
    method: "POST",
  });

  // eslint-disable-next-line no-return-await
  return await response.text();   
}

const getWebRTCAnswer = async (deviceid, base64Offer) => {
  // Alexa Eco needs camera stream answer
  const offer = Buffer.from(base64Offer, 'base64').toString();
  try {
    const answer = await mediamtx(offer);
    const answerInBase64 = Buffer.from(answer).toString('base64');
    return { success: true, answer: answerInBase64 };
  } catch (error) {
    console.error(error);
    return { success: false };
  }  
};
 
  
const getCameraStreamUrl = async (deviceid, cameraStreamProtocol) => {
  if(cameraStreamProtocol === 'hls') {
    return { success: true, url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8' };
  } 
  else if(cameraStreamProtocol === 'rtsp') {
    return { success: true, url: 'rtsp://rtspurl:443' };
  } else {
    return { success: false};
  }
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, false);
const callbacks = { getWebRTCAnswer, getCameraStreamUrl };

startSinricPro(sinricpro, callbacks);