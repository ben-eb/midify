# midify [![NPM version](https://badge.fury.io/js/midify.svg)](http://badge.fury.io/js/midify) [![Dependency Status](https://gemnasium.com/ben-eb/midify.svg)](https://gemnasium.com/ben-eb/midify)

> Makes working with Web MIDI more palatable.

Install via [npm](https://npmjs.org/package/midify):

```
npm install midify
```

## What it does

midify is a package that combines node's event emitter with the browser's web midi api, to make working with midi messages more palatable. It is supposed to be used in combination with modules that expose input and output objects, so that clients can send events such as `deckA.play.on` (to light up the play button's LED), and to allow consuming modules to listen to events such as `crossfader.change`, which will call back with the value of the crossfader, as an example.

**Note that midify is a work in progress**, and currently only two devices are supported as they are all that I have access to. I'm hoping that those who are working with Web MIDI can help me to build up a library of easily consumable maps, so that we as developers can easily build MIDI applications to run on a wide range of devices, using a common format.

Compatible controllers are:

* [https://github.com/ben-eb/midify-numark-dj2go](Numark DJ 2 Go) (http://www.numark.com/product/dj2go)
* [https://github.com/ben-eb/midify-numark-mixtrack-pro](Numark MixTrack Pro) (http://www.numark.com/product/mixtrackpro)

If you've created a map for your controller that is compatible with midify, [please open an issue](https://github.com/ben-eb/midify/issues) and it will be added to the list.

## Example

Bundle this code with [browserify](https://github.com/substack/node-browserify). Note that Web MIDI is currently available behind a flag in Chrome, and remains unsupported in other browsers. To enable it in Chrome, go to [chrome://flags](chrome://flags) and ensure that the Web MIDI option is on. As of this writing, MIDI support in Chrome is not quite plug and play capable, so you'll need to shut down Chrome and plug your device in before testing any code.

```js
var Midify = require('midify');
var mixtrack = require('midify-numark-mixtrack-pro');

navigator.requestMIDIAccess().then(function(midiAccess) {
    var midiIn;
    var midiOut;

    // For brevity, we are just assuming one MIDI device is connected
    for (var input of midiAccess.inputs.values()) {
        midiIn = input;
    }

    for (var output of midiAccess.outputs.values()) {
        midiOut = output;
    }

    var midify = new Midify({
        midiIn: midiIn,
        midiOut: midiOut,
        controller: mixtrack
    });

    midify.on('*', function(event) {
        console.log('triggered', event, 'event');
    });

}, function() { console.error('MIDI access unavailable'); });
```

## API

### var midify = new Midify(options)

Construct a new midify instance. It takes an options object with three parameters; `midiIn` and `midiOut` should be retrieved from the `midiAccess` object, as per the example above, and the `controller` parameter accepts a module which exposes `inputs` and `outputs` objects.

### midify.getLEDs()

Get an array of all the LED outputs; useful if you need to reset all of the lights on the controller:

```js
midify.getLEDs().forEach(function(led) {
    midify.send(led + '.off');
});
```

### midify.send()

Send a message to the controller. See the documentation for your controller to see which messages you can send.

```js
midify.send('deckA.play.on');
```

### midify.on()

midify just inherits from event emitter, so you can listen to events from your controller:

```js
midify.on('masterGain.change', function(value) {
    console.log('volume changed', value);
});
```

As well as the namespaced events, midify will also emit `*`, so that you can listen to all messages for debugging purposes:

```js
midify.on('*', function(event, value) {
    console.log(event, value);
});
```

Both of these events will also emit the full MIDI message object as the final parameter in the callback function; so to access the raw data you can also do:

```js
midify.on('*', function(event, value, raw) {
    console.log(event, value, raw);
});
```

## License

MIT © Ben Briggs

