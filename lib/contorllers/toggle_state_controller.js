/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */

const ToggleState = (payload, callbacks) => {
    const resp = callbacks.setToggleState(payload.deviceId, { instanceId: payload.instanceId, value: payload.value.state });
    return new Promise((resolve, reject) => {
        if (resp) resolve(payload);
        else reject(new Error('Toggle State Error'));
    });
};

module.exports = {
    ToggleState
};