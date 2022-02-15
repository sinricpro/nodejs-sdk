/*
 *  Copyright (c) 2019 Sinric. All rights reserved.
 *  Licensed under Creative Commons Attribution-Share Alike (CC BY-SA)
 *
 *  This file is part of the Sinric Pro (https://github.com/sinricpro/)
 */
let data = {
  powerLevel: 0,
  brightness: 0,
  color: {
    r: 0,
    g: 0,
    b: 0,
  },
  lockState: '',
  thermostat: {
    mode: '',
    temperature: 0,
  },
  rangeValue: 0,
  volume: 0,
  colorTemperature: 0,
  bands: [
    {
      level: 0,
      name: '',
    },
  ],
};

module.exports = data;
