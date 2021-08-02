const { OzobotEvoWebBLE } = require('./ozobot-webble.umd.js');
const OzobotConstants = require('./ozobot-constants.js');
const EvoImages = require('./EvoImages.js');


function debugMessage (msg) {
    if (typeof msg === 'string') {
        console.log(msg);
    } else {
        console.dir(msg);
    }
}

// Set debugging
OZOBOT_BLE_DEBUG = true;


/*
TODOs:
Clean-up / Docs / Clarification
targetWasRemoved:  Check for status skin and remove if needed 
"STOP" things:  Stop all blocks / events. 
Ozobot icons (overhead).
"On Connected" Block
Auto Re-connect
Lights / Light state / rotation

Er, actual blocks
    Reporters
        Get Color Reporter (returns Color)
        Get Color string (returns one of recognized colors)
        Get distance (?)
  
    Commands
        Forward for...
        Motor power / time ???
        Enable line following?
        Back light
        RGB Light (?)
        Say number (?)
        Say X
        Send Message (direction)

        Set name? 
        Turn off?

    Events   
        On updated distance
        On new color 
        On Ozobot detected
        On new message

    On connect
    On disconnect 


*/




// Event Tags (for "replies" from Ozobot)
const MOTION_DONE = 'motion done';
const AUDIO_DONE = 'audio done';


/* Object that represents the remote Evo
     Manages all interactions 
*/ 
class RemoteEvo {

    constructor (target, blocks) {
        this.bot = null;  // Bot object 
        this.didDisconnectHandler = this.didDisconnect.bind(this);


        // The blocks object (for events that may change depiction of blocks)
        this.ozoblocks = blocks;
        this.target = target;  // Scratch target object for this Evo object

        this.resetState();
    }

    updateCostume () {
        // Based on EvaBodyAbove23Plain.svg  (load into editor and then save/export)
        const svg = EvoImages.evoSVG();
        // Seem to have to offset skinId by 1???
        const costume = this.target.sprite.costumes[0];
        // I think skinIds are 1-based and updates to SVGs are 0-based??? Maybe??? 
        this.target.runtime.vm.updateSvg(costume.skinId-1, svg, 171, 175);  // I think we can leave rotations null and it'll center...
    }

    resetState () {
        // Various state data
        this.name = '';
        // Status Indicators / Properties
        this.leds = [];  // Set to 6 empty colors
        this.distances = []; // Set to 4 distances
        this.lastBattery = null;

        this.hardware = null; // Hardware version is status indicator
        

        this.firmware = null;

        this.pendingOperations = new Map();
        this.audio_playing = false;
        this.batteryCheck = null;
        this.reconnectCheck = null;
    }

    isAssociated () {
        // return this?.bot?.peripheral?.gatt?.connected ? true : false;
        return this.bot;
    }


    isConnected () {
        // return this?.bot?.peripheral?.gatt?.connected ? true : false;
        return this.bot && this.bot.device && this.bot.device.peripheral && this.bot.device.peripheral.gatt && this.bot.device.peripheral.gatt.connected;
    }

    /**
     * 
     * @param {*} event The event to wait for
     * @param {int} timeout (in ms); null or 0 if none
     * @returns a promise that will be resolved/rejected. When the item is done (the promise will resolve to a return value too)
     */
    eventCompletionPromise (event, timeout = null) {
        // Get a list of any existing handlers for this promise
        const callbacks = this.pendingOperations.get(event) || [];
        debugMessage(`Timeout: ${timeout}`);
        // Create a timer to trigger the event if needed
        const onTimeout = () => { 
            debugMessage(`TIMEOUT ${event} ${this}`); 
            this.completeEvents(event, 'timeout');
        };
        const timer = timeout !== null ? window.setTimeout(onTimeout, timeout) : null;
        debugMessage(`Timer: ${timer}`)
        // Create a promise and add it to the list
        const p = new Promise(resolve => { 
            callbacks.push(d => {
                debugMessage(`${event} finished with event`);
                resolve(d);
                debugMessage(`clearing timer: ${timer}`)
                clearTimeout(timer);
            });
        });
        // Update the list for the event (to include this new item)
        this.pendingOperations.set(event, callbacks);
        // Return the promise
        return p;
    }

    /**
     * Fire anything that's waiting on the specific event
     * @param {*} name 
     * @param {*} data 
     */
    completeEvents (name, data = null) {
        // Get and process all pending operations
        const events = this.pendingOperations.get(name) || [];
        // Process any completed events...And update list
        events.forEach(e => e(data));
        // Remove any pending operations
        this.pendingOperations.set(name, []);
    }

    /**
     * Clear / fire anything that's waiting on an event
     */
    clearAllEvents () {
        this.pendingOperations.forEach((k, v, m) => v());
    }

    timedPromise (time) {
        return Promise(resolve => setTimeout(resolve, time));
    }


    async isFirmwareVersionSufficient () {
        this.firmware = await this.bot.firmwareVersion();
        debugMessage(`Firmware: ${this.firmware}`);
        const firmwareVal = parseFloat(this.firmware);
        if (isNaN(firmwareVal) || firmwareVal < 1.17) {
            debugMessage('Update Firmware!!!!!');
            this.target.runtime.emit('SAY', this.target, 'say', 'Update Firmware!');
            setTimeout(this.bot.device.disconnect.bind(this.bot.device), 5000);
            return false;
        }
        return true;
    }

    // All the things to do when connected to Evo
    async setupOnConnection () {
        // Prepare for disconnects
        this.completeEvents(); // Clear all pending events
        this.bot.addDisconnectListener(this.didDisconnectHandler);

        if (await this.isFirmwareVersionSufficient() !== true) {
            return;
        }

        // Stop OzoBlockly (suppress running behavior) (AKA Silence Wendel!)
        await this.bot.stopFile(OzobotConstants.EvoFileTypes.BLOCKLY, true);

        // Enable notifications
        await this.bot.setMovementNotifications(true);

        // Play connection sound
        await this.bot.playFile(1, '01010010', 0);

        // Contains .color and .colorName (0 black; 1 white)
        this.hardware = await this.bot.hardwareVersion(); 
        debugMessage(`Hardware Ver: ${this.hardware}`);

        // Battery check / monitor (1x per min)
        this.batteryCheck = setInterval(async () => {
            const batteryLevel = await this.bot.batteryLevel();
            debugMessage(`Battery: ${batteryLevel}`);
            if (batteryLevel < 20) {
                this.target.runtime.emit('SAY', this.target, 'think', 'Low Battery!');
            }
        }, 60000);

        // Set all ligths off 
        await this.bot.setLED(255, 0, 0, 0);

        // await this.bot.requestFileState(1);  // Request the state of audio files
        this.name = await this.bot.getName();
        await this.bot.toggleClassroomBehavior(true); // Set classroom behavior (disable spontaneous stuff?)
        // // Disable wandering
        // await this.bot.setWanderSettings(false, 0, 0, 0);
        // await this.bot.setAutoOffTimeSettings(600); // 5 min?
 
        // TODO / Debugging Log all event notifications
        for (const [event, value] of Object.entries(this.bot.commandsNotifications.notifications)) {
            debugMessage(`Subscribing to ${event} with value ${value}`);
            this.bot.subscribeCommand(event, this.didRecieveEvent.bind(this, event));
        }
        this.target.runtime.emit('SAY', this.target, 'think', 'Ready');
        // Update the costume / status
        this.updateCostume();
    }


    didRecieveEvent (name, data) {
        debugMessage(`Event ${name}: ${data}`);
        console.dir(data);

        // Deal with meaningful events and "translate" to triggers
        switch (name) {

        case 'movementFinishedSimple':
        case 'movementFinishedExtended':
            this.completeEvents(MOTION_DONE, data);
            break;

        case 'fileState':
            debugMessage("File State")
            // Check for type (129=UserAudio or 1=Audio, 7=AudioNote, 0=Firmware, 5=AudioSpeex) and running
            // What's 255 == Tone????
            if ([0, 1, 5, 7, 129, 255].includes(data.fileType) && data.running === false) {
                debugMessage('Audio Done');
                this.completeEvents(AUDIO_DONE, data);
            }
            break;
        }

        this.completeEvents(name, data);
    }

    redrawToolbox () {
        this.target.runtime.emit("TOOLBOX_EXTENSIONS_NEED_UPDATE");
    }

    async tryReconnect () {
        debugMessage("Trying Reconnect");
        //await this.bot.device.peripheral.gatt.connect();
        // this.bot.device.connect().then(this.setupOnConnection.bind(this)).then(()=>debugMessage('Reconnected!'));
        await this.bot.device.connect();
        debugMessage(`Reconnected (I think...)`);
        await this.setupOnConnection();


        // Try to reconnect
        // const botAtStart = this.bot;
        // const reconnectHandler = async () => {
        //     // If the bot object is unchanged from when reconnect was initiated
        //     if (this.bot === botAtStart) {
        //         try {
        //             debugMessage('Trying reconnect');

        //             //await this.bot.device.peripheral.gatt.connect();
        //             await this.bot.device.connect();
        //             debugMessage(`Reconnected (I think...)`);
        //             await this.setupOnConnection();
        //             debugMessage('Reconnected!');
        //             // If there was an intentional disconnect while waiting on connection, drop it
        //             clearInterval(this.reconnectCheck);
        //         } catch (error) {
        //             // Didn't reconnect yet.  Try again in 1s
        //             debugMessage(`Failed to reconnect ${error}`);
        //         }
        //     }
        // };
    }

    didDisconnect () {
        debugMessage('Evo Disconnect');
        this.disconnectCleanup();
        // TODO Redraw icons
        this.target.runtime.emit('SAY', this.target, 'say', 'Disconnected');
        this.tryReconnect();
        debugMessage('Disconnect DONE');

        //        this.tryReconnect();
        // TODO: Stop the script
        //this.target.runtime.emit('STOP_FOR_TARGET');

    }

    // Common disconnect cleanup independent of cause
    disconnectCleanup () {
        this.bot.removeDisconnectListener(this.didDisconnectHandler);
        this.completeEvents(); // Clear all pending events
        clearInterval(this.batteryCheck);
        this.batteryCheck = null;
        this.updateCostume();
    }

    // Request explicit disconnect
    async disconnect () {
        this.disconnectCleanup();
        await this.bot.device.disconnect(); // This will abort any connect attempts
        // Delete the bot object now and update toolbox
        this.bot = null;
        this.redrawToolbox();
    }

    async requestDevice () {
        this.bot = await OzobotEvoWebBLE.requestDevice([{namePrefix: 'Ozo'}]);
        await this.setupOnConnection();
        return true;
    }
}

exports.RemoteEvo = RemoteEvo;
