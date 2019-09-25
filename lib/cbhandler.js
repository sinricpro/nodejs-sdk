const crypto = require('crypto');
const {secretKey} = require('../credentials');
const assert = require('assert');

const getSignature=(message) =>{
    return crypto.createHmac('sha256', secretKey).update(message).digest('base64');
}

const verifySignature = (payload,signature)=>{
const localSignature = getSignature(payload);

// console.log(`local Signature : ${localSignature}  Sinric : ${signature}`);
return localSignature === signature;
}

const jsonHandle=(defaultPayload,state)=>{
    header={
        payloadVersion: 2,
        signatureVersion: 1
    }

    payload={
        action: defaultPayload.action,
        clientId: defaultPayload.clientId,
        createdAt: Math.floor(new Date / 1000),
        deviceId: defaultPayload.deviceId,
        message: "OK",
        replyToken: defaultPayload.replyToken,
        success: true,
        type: "response",
        value: {
            "state": state
        }
    }
    signature={
        HMAC: getSignature(JSON.stringify(payload))
    }
    return {header:header,payload:payload,signature:signature}
}

const handlePayload=(payload,signature,callbacks)=>{
    try {
        assert(verifySignature(JSON.stringify(payload),signature));
        if(payload.action === "setPowerState"){
        callbacks.setPowerState(payload.deviceId,payload.value.state);
        return jsonHandle(payload,payload.value.state);
        }
    } catch (err) {
        console.log('Assert error : '+err.message);
        
    }
}

module.exports = handlePayload;
