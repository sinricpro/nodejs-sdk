const {
  SinricPro, startSinricPro, raiseEvent, eventNames,
} = require('sinricpro');

const fetch = require('node-fetch');

const APPKEY =  "";
const APPSECRET = "";
const cameraId = "";
const deviceIds = [cameraId];

async function mediamtx(offer) {
  /* 
    Get the answer from mediamtx `http://<hostname>:8889/<name>/whep`. eg: http://pi3:8889/cam/whep
  */
  const url = `http://pi3:8889/cam/whep`; 
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
  // Google Home: RTSP protocol not supported. Requires a Chromecast TV or Google Nest Hub
  // Alexa: RTSP url must be interleaved TCP on port 443 (for both RTP and RTSP) over TLS 1.2 port 443

  if(cameraStreamProtocol === 'hls') {
    return { success: true, url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8' };
  } 
  else if(cameraStreamProtocol === 'rtsp') {
    return { success: true, url: 'rtsp://rtspurl:443' };
  } else {
    return { success: false};
  }
};

const setPowerState = async (deviceid, data) => {
  console.log(deviceid, data);
  return true;
};

const sinricpro = new SinricPro(APPKEY, deviceIds, APPSECRET, false);
const callbacks = { setPowerState, getWebRTCAnswer, getCameraStreamUrl };

startSinricPro(sinricpro, callbacks);