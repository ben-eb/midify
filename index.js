'use strict';

var eventEmitter = require('events').EventEmitter,
    endsWith     = require('ends-with'),
    inherits     = require('inherits');

var availableTypes = {
    'on': 9,
    'off': 8,
    'change': 11
};

function filterKeys (object, callback, context) {
    return Object.keys(object).filter(callback, context);
}

function MIDIfy (options) {
    this.midiIn  = options.midiIn;
    this.midiOut = options.midiOut;
    this.inputs  = options.controller.inputs;
    this.outputs = options.controller.outputs;

    this.midiIn.onmidimessage = this.listen.bind(this);

    eventEmitter.call(this);
}

inherits(MIDIfy, eventEmitter);

MIDIfy.prototype.getByAlias = function (alias) {
    return this.outputs[filterKeys(this.outputs, function (key) {
        return key === alias;
    })[0]];
}

MIDIfy.prototype.getByDec = function (dec) {
    return filterKeys(this.inputs, function (key) {
        return this.inputs[key] === dec;
    }, this)[0];
}

MIDIfy.prototype.getStatus = function (type, velocity) {
    type = type >> 4;
    // In MIDI, note on messages with zero velocity are the same
    // as note off, so normalise this in the status code we send
    // back to the client
    if (velocity === 0 && type === 9) {
        type = 8;
    }
    return '.' + filterKeys(availableTypes, function (key) {
        return availableTypes[key] === type;
    })[0];
}

MIDIfy.prototype.getLEDs = function () {
    return Object.keys(this.outputs);
}

MIDIfy.prototype.send = function (event) {
    var messageType = endsWith(event, '.on') ? 0x90 : 0x80;
    event = event.replace('.off', '').replace('.on', '');
    this.midiOut.send([messageType, this.getByAlias(event), 0x01]);
}

MIDIfy.prototype.listen = function (message) {
    var description = this.getByDec(message.data[1]) + this.getStatus(message.data[0], message.data[2]);
    this.emit(description, message.data[2], message);
    this.emit('*', description, message.data[2], message);
}

module.exports = MIDIfy;
