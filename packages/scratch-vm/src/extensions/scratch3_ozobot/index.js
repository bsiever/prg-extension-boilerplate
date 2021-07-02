require("regenerator-runtime/runtime");

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');

const OzobotWebBle = require('./ozobot-webble.umd.js');
const { debug } = require("../../util/log");

//const Runtime = require('../../engine/runtime');
//const MathUtil = require('../../util/math-util');
//const { listenerCount, THREAD_STEP_INTERVAL } = require("../../engine/runtime");
//const { List } = require("immutable");

// Set debugging of 
OZOBOT_BLE_DEBUG = true;

// All Scratch Events
const allEvents =  ['ANSWER',
                    'BLOCKSINFO_UPDATE',
                    'BLOCKS_NEED_UPDATE',
                    'BLOCK_DRAG_END',
                    'BLOCK_DRAG_UPDATE',
                    'BLOCK_GLOW_OFF',
                    'BLOCK_GLOW_ON',
                    'CLEAR_ALL_LABELS',
                    'CONNECT_MICROBIT_ROBOT',
                    'CONNECT_OZOBOTEVO',
                    'DELETE_EXAMPLE',
                    'DELETE_LABEL',
                    'EDIT_TEXT_CLASSIFIER',
                    'EDIT_TEXT_MODEL',
                    'EXPORT_CLASSIFIER',
                    'EXTENSION_ADDED',
                    'EXTENSION_FIELD_ADDED',
                    'HAS_CLOUD_DATA_UPDATE',
                    'KEY_PRESSED',
                    'LOAD_CLASSIFIER',
                    'MIC_LISTENING',
                    'MONITORS_UPDATE',
                    'NEW_EXAMPLES',
                    'NEW_LABEL',
                    'PERIPHERAL_CONNECTED',
                    'PERIPHERAL_CONNECTION_LOST_ERROR',
                    'PERIPHERAL_DISCONNECTED',
                    'PERIPHERAL_LIST_UPDATE',
                    'PERIPHERAL_REQUEST_ERROR',
                    'PERIPHERAL_SCAN_TIMEOUT',
                    'PROJECT_CHANGED',
                    'PROJECT_LOADED',
                    'PROJECT_RUN_START',
                    'PROJECT_RUN_STOP',
                    'PROJECT_START',
                    'PROJECT_STOP_ALL',
                    'QUESTION',
                    'RENAME_LABEL',
                    'RUNTIME_STARTED',
                    'SAY',
                    'SCRIPT_GLOW_OFF',
                    'SCRIPT_GLOW_ON',
                    'STOP_FOR_TARGET',
                    'TARGETS_UPDATE',
                    'TOOLBOX_EXTENSIONS_NEED_UPDATE',
                    'VISUAL_REPORT',
                    'targetWasCreated',
                    'targetWasRemoved'];

// Icon is an edit of: https://games.ozoblockly.com/shapetracer/sources/classroom-evo-connected.svg
// Encoded via: https://onlinepngtools.com/convert-png-to-base64
const blockIconURI = 'data:image/png;base64,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';

const EXTENSION_ID = 'ozobotEvoRobot';

const STATE_CONNECTED = 1;
const STATE_DISCONNECTED = 2;

// Event Tags (for "replies" from Ozobot)
const MOTION_DONE = 'motion done';
const AUDIO_DONE = 'audio done';

const LED_NAMES = ['Top', 'Far Left', 'Left', 'Center', 'Right', 'Far Right', 'Power Button', 'Back'];
class EvoData {

    constructor (target, blocks) {
        this.bot = null;
        this.state = STATE_DISCONNECTED;
        this.ozoblocks = blocks;
        this.target = target;  // Scratch target object for this Evo object
        this.didDisconnectHandler = this.didDisconnect.bind(this);
        this.name = '';
        this.pendingOperations = new Map();
        this.audio_playing = false;
        this.batteryCheck = null;
    }


    /**
     * 
     * @param {*} event The event to wait for
     * @param {int} timeout (in ms); null or 0 if none
     * @returns a promise that will be resolved/rejected when the item is done (the promise will resolve to a return value too)
     */
    eventCompletionPromise (event, timeout = null) {
        // Get a list of any existing handlers for this promise
        const callbacks = this.pendingOperations.get(event) || [];
        console.log(`Timeout: ${timeout}`);
        // Create a timer to trigger the event if needed
        const onTimeout = () => { 
            console.log(`TIMEOUT ${event} ${this}`); 
            this.completeEvents(event, 'timeout');
        };
        const timer = timeout !== null ? window.setTimeout(onTimeout, timeout) : null;
        console.log(`Timer: ${timer}`)
        // Create a promise and add it to the list
        const p = new Promise(resolve => { 
            callbacks.push(d => {
                console.log(`${event} finished with event`);
                resolve(d);
                console.log(`clearing timer: ${timer}`)
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

    timedPromise(time) {
        return Promise(resolve => setTimeout(resolve, time));
    }

    // All the things to do when connected to Evo
    async setupOnConnection () {
        // Prepare for disconnects
        this.completeEvents(); // Clear all pending events
        this.bot.addDisconnectListener(this.didDisconnectHandler);
        await this.bot.stopFile(2, 1); // Stop OzoBlockly (suppress running behavior) (AKA Silence Wendel!)
        await this.bot.setMovementNotifications(true);
        await this.bot.playFile(1, '01010010', 0);
        const hwV = await this.bot.hardwareVersion();  // Contains .color and .colorName (0 black; 1 white)
        const firmV = await this.bot.firmwareVersion();
        console.log(`Hardware Ver: ${hwV};  Firmware: ${firmV}`);

        // Battery check / monitor
        this.batteryCheck = setInterval(async () => {
            console.log("Checking Battery");
            const batteryLevel = await this.bot.batteryLevel(); 
            console.log(`Battery: ${batteryLevel}`)
            if (batteryLevel < 20) {
                this.target.runtime.emit('SAY', this.target, 'think', 'Low Battery!');
            }
        }, 60000);
        // await this.bot.requestFileState(1);  // Request the state of audio files
        this.name = await this.bot.getName();
        // this.bot.toggleClassroomBehavior(true); // Set classroom behavior (disable spontaneous stuff?)
        // // Disable wandering
        // this.bot.setWanderSettings(false, 0, 0, 0);
        // this.bot.setAutoOffTimeSettings(600); // 5 min?
 
        // TODO / Debugging Log all event notifications
        for (const [event, value] of Object.entries(this.bot.commandsNotifications.notifications)) {
            console.log(`Subscribing to ${event} with value ${value}`);
            this.bot.subscribeCommand(event, this.didRecieveEvent.bind(this, event));
        }
        this.target.runtime.emit('SAY', this.target, 'think', 'Ready');
        this.state = STATE_CONNECTED;
    }


    didRecieveEvent (name, data) {
        console.log(`Event ${name}: ${data}`);
        console.dir(data);

        // Deal with meaningful events and "translate" to triggers
        switch (name) {

        case 'movementFinishedSimple':
        case 'movementFinishedExtended':
            this.completeEvents(MOTION_DONE, data);
            break;

        case 'fileState':
            // Check for type (129=UserAudio or 1=Audio, 7=AudioNote, 0=Firmware, 5=AudioSpeex) and running
            if ([0, 1, 5, 7, 129].includes(data.fileType) && data.running === false) {
                this.completeEvents(AUDIO_DONE, data);
            }
            break;
        }

        this.completeEvents(name, data);
    }

    redrawToolbox() {
        this.target.runtime.emit("TOOLBOX_EXTENSIONS_NEED_UPDATE");
    }

    didDisconnect() {
        console.log('Evo Disconnect');
        this.bot.removeDisconnectListener(this.didDisconnectHandler);
        this.bot = null;
        this.state = STATE_DISCONNECTED;
        this.ozoblocks.updatePalette();
        this.completeEvents(); // Clear all pending events

        this.target.runtime.emit('SAY', this.target, 'say', 'Disconnected');
        this.redrawToolbox();
        clearInterval(this.batteryCheck);
        // TODO: Stop the script
        //this.target.runtime.emit('STOP_FOR_TARGET');

    }
}

// Core, Team, and Official extension classes should be registered statically with the Extension Manager.
// See: scratch-vm/src/extension-support/extension-manager.js
class OzobotEvoBlocks {  

    constructor (runtime) {
        /**
         * Store this for later communication with the Scratch VM runtime.
         * If this extension is running in a sandbox then `runtime` is an async proxy object.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.runtime.registerPeripheralExtension(EXTENSION_ID, this);
        this.runtime.connectPeripheral(EXTENSION_ID, 0);

        // Create a disconnect handler callback
        this.disconnectHandler = this.evoDisconnect.bind(this);

        this.ble = OzobotWebBle;

        this.spriteName = "none";

        // Project / VM interaction stuff????  (Look into these)
        this.runtime.on('CONNECT_OZOBOTEVO', this.updateConnection.bind(this));
        this.runtime.on('PROJECT_CHANGED', this.projectChanged.bind(this));
        this.runtime.on('TOOLBOX_EXTENSIONS_NEED_UPDATE', this.editingTargetChanged.bind(this));
        this.runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));

//        debug(this.useDebugger);  // Trigger debugger if needed

/*
TODO: Handle events
                    'PROJECT_RUN_START',
                    'PROJECT_RUN_STOP',
                    'PROJECT_START',
                    'PROJECT_STOP_ALL',

*/

        // BSIEVER: Debugging to watch events
        allEvents.forEach(e => this.runtime.on(e, this.eventTrigger.bind(this, e)));

    }


    async stopAll() {
        // The project is stopped.  Stop and clear all blocks. 
        console.log("Stop All");
    }
    /**
     * TOOLBOX_EXTENSIONS_NEED_UPDATE Event: Something substantial has changed, like the selected target
     * 
     * Ensures that each target has an "EvoData" object
     */
    editingTargetChanged() {
        // Update the "bot" variable for this target
        console.log(`Target changed: ${this.runtime._editingTarget.sprite.name}`)
        // If the current object doesn't have an Evo, associate a new uninit one 
        if ('evoData' in this.runtime._editingTarget == false) {
            this.runtime._editingTarget.evoData = new EvoData(this.runtime._editingTarget, this);
            this.runtime.emit("TOOLBOX_EXTENSIONS_NEED_UPDATE");
        }
    }

    /**
     * PROJECT_CHANGED Event:  The project has changed (like renaming a sprite)
     */
    projectChanged() {
        // If name changed, redraw palette (to update the button)
        if (this.spriteName !== this.runtime._editingTarget.sprite.name) {
            this.spriteName = this.runtime._editingTarget.sprite.name;
            this.runtime.emit("TOOLBOX_EXTENSIONS_NEED_UPDATE");
        }
    }

    /**
     * TODO:  Debugging only / Used for debugging all events
     * @param {} name 
     */
    eventTrigger (name) {
        console.log(`Event: ${name}`);
        /*
        Green Flag:  PROJECT_STOP_ALL, PROJECT_START
        Red Flag: PROJECT_STOP_ALL
        Adding a sprite: targetWasCreated TARGETS_UPDATE 
        Removing a sprite: targetWasRemoved, TOOLBOX_EXTENSIONS_NEED_UPDATE, PROJECT_CHANGED, BLOCKS_INFO_UPDATE (x3)
        Changing Sprite name: PROJECT_CHANGED
        Clicking on command in palette:  SCRIPT_GLOW_ON, PROJECT_RUN_STRAT, SCRIPT_GLOW_OFF, PROJECT_RUN_STOP

        A "TOOLBOX_EXTENSIONS_NEED_UPDATE" will be issued whenever the target is changed (I think)


        Emitting TOOLBOX_EXTENSIONS_NEED_UPDATE causes the toolbox to be redrawn

        */
    }

    /**
     * @return {object} This extension's metadata. (UI Element)
     */
    // BSIEVER: Note: This is called to re-gen menu whenever a target is called
    getInfo () {
        // Get the name of the current sprite
        let evoData = this.runtime && this.runtime._editingTarget && this.runtime._editingTarget.evoData 
        this.spriteName =  "this sprite";
        if (this.runtime !== null && this.runtime._editingTarget!==null && this.runtime._editingTarget.sprite!==null && this.runtime._editingTarget.sprite.name!==null) {
            this.spriteName = this.runtime._editingTarget.sprite.name;
        }
        return {
            id: EXTENSION_ID,
            name: formatMessage({
                id: 'ozobotevoRobot',
                default: 'Ozobot Evo Robot Blocks',
                description: 'Extension to communicate with Ozobot Evo robot.'
            }),
            showStatusButton: false,  // The "!" status button used to search for bots in microbit
            blockIconURI: blockIconURI,
            menuIconURI: blockIconURI,

            blocks: [
                {
                    func: 'CONNECT_OZOBOTEVO',
                    blockType: BlockType.BUTTON,
                    // TODO: Add Ozo name to disconnect string
                    text: (evoData!==null && evoData.state===STATE_CONNECTED) ? 
                       (evoData && evoData.name ? `Disconnect from ${evoData.name}` : 'Disconnect') :
                       (`Connect ${this.spriteName} to an Evo`)
                },
                '---',
                {
                    opcode: 'useDebugger',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'useDebugger',
                        default: 'use debugger',
                        description: 'Trigger Chrome Debugger'
                    }),
                    arguments: {
                    }
                },               
                {
                    opcode: 'forward',             // Method to run
                    blockType: BlockType.COMMAND,  // Type of Block
                    text: formatMessage({
                        id: 'ozobotevoblocks.forward',
                        default: 'forward [DISTANCE] mm at [SPEED] mm/s',
                        description: 'Move forward a distance [-1500,1500] for a speed [15,85]'
                    }),
                    arguments: {
                        DISTANCE: {
                            type:ArgumentType.NUMBER,
                            defaultValue: 20
                        },
                        SPEED: {
                            type:ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'rotate',              // Method to run
                    blockType: BlockType.COMMAND,  // Type of Block
                    text: formatMessage({
                        id: 'ozobotevoblocks.rotate',
                        default: 'rotate [DEGREES] degrees left at [SPEED] mm/s',
                        description: 'Rotate a given number of degrees at speed [15, 85]'
                    }),
                    arguments: {
                        DEGREES: {
                            type:ArgumentType.NUMBER,
                            defaultValue: 90
                        },
                        SPEED: {
                            type:ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'setLEDs',              // Method to run
                    blockType: BlockType.COMMAND,  // Type of Block
                    text: formatMessage({
                        id: 'ozobotevoblocks.setLED',
                        default: 'LED [LED] to [COLOR]',
                        description: 'Set the given LED to the Color'
                    }),
                    arguments: {
                        LED: {
                            type:ArgumentType.NUMBER,
                            menu: 'LEDS', 
                            defaultValue: 'Top'
                        },
                        COLOR: {
                            type:ArgumentType.COLOR,
                            defaultValue: '#00ff00'
                        }
                    }
                },
                {
                    opcode: 'tone',              // Method to run
                    blockType: BlockType.COMMAND,  // Type of Block
                    text: formatMessage({
                        id: 'ozobotevoblocks.tone',
                        default: 'play [TONE] Hz for [DURATION] (ms)',
                        description: 'Play the given tone for the duration'
                    }),
                    arguments: {
                        TONE: {
                            type:ArgumentType.NOTE,
                            defaultValue: 84
                        },
                        DURATION: {
                            type:ArgumentType.NUMBER,
                            defaultValue: 1000
                        }
                    }
                },
                {
                    opcode: 'whenObstacle',              // Method to run
                    blockType: BlockType.HAT,  // Type of Block
                    text: formatMessage({
                        id: 'ozobotevoblocks.whenObstacle',
                        default: 'when obstacle',
                        description: 'Play the given tone for the duration'
                    }),
                    arguments: {
                        // TONE: {
                        //     type:ArgumentType.NOTE,
                        //     defaultValue: 84
                        // },
                        // DURATION: {
                        //     type:ArgumentType.NUMBER,
                        //     defaultValue: 1000
                        // }
                    }
                }
// TODO:  Sounds, MotorPower
// TODO: Events (lines, colors, obstacles, Button?)
// TODO: (Maybe):  IR Messages???


// Major: Script stop (stop all)
// Disconnect: Clear all events 

            ],
            menus: { 
                LEDS: {
                    acceptReporters: false,
                    items: LED_NAMES
                }
            }
        };
    }

    


    // BSIEVER: These may not be needed for Evo, but they are somehow used....
    /* The following 4 functions have to exist for the peripherial indicator */
    connect() {
        console.log('connect()');
    }
    disconnect() {
        console.log('disconnect()');
    }

    scan() {
        // Called by the info button. 
        console.log('scan()');
        
    }
    isConnected() {
        console.log('isConnected()');
    }
    
    useDebugger(args, util) {
        console.log("Use Debugger Called")    
        console.dir(args);
        debugger;
    }

    onDeviceDisconnected () {
        console.log("Lost connection to robot");   
        this.runtime.emit(this.runtime.constructor.PERIPHERAL_DISCONNECTED);
    }



    updatePalette() {
        this.runtime.emit("TOOLBOX_EXTENSIONS_NEED_UPDATE");
    }

    evoDisconnect() {
        console.log("Disconnected");
        // Remove the disconnect handler
        this.bot.removeDisconnectListener(this.disconnectHandler);
        this.bot = null; // Frees object...Hopefully garbage collected
        this.state = STATE_DISCONNECTED;
        this.updatePalette();
    }
    
    /**
     * UI Function 
     */
    async updateConnection () {
        // UI Element call (must use evoData)
        let evoData = this.runtime._editingTarget.evoData;
        if(evoData.state === STATE_DISCONNECTED) {
            console.log('Getting BLE device');
            console.dir(this);
            try {
                evoData.bot = await this.ble.OzobotEvoWebBLE.requestDevice([{namePrefix: 'Ozo'}]);
                if (evoData.bot === null) {
                    // Not connected??
                    console.log('NOT Got a bot')
                } else {
                    // Connected????
                    console.log('Got a bot');
                    console.dir(evoData.bot);
                    await evoData.setupOnConnection();
                    console.log(`Setup Done: ${evoData.name}`)
                    this.updatePalette();
                }
        
            } catch(err) {
                console.log("Error / no connection.")
            }
    
        } else if (evoData.state === STATE_CONNECTED) {
            // Dis connect
            if (evoData.bot !== null) {
                await evoData.bot.device.disconnect();
            }
        }
    }


    checkTargetForEvo(target) {
        // Return null (if invalid) or bot object otherwise
        // TODO:  Check for valid evo data / return if none
        if ('evoData' in target === false || target.evoData.state !== STATE_CONNECTED)
            return null;
        return target.evoData;
    }

    timedPromise(time, fail = false) {
        return new Promise((resolve, reject) => setTimeout(() => (fail ? reject() : resolve()), time));
    }

    restrictRange(min, max, value) {
        return Math.max(min, Math.min(value, max))
    }

    async tone (args, util) {
        console.log(`tone`);
        console.dir(args);

        const evoData = this.checkTargetForEvo(util.target);
        if (evoData === null) {
            return;
        }
        // Stop running audio
        if (evoData.audio_playing) {
            await evoData.bot.stopFile(1, 1);  //  fileType 1 is audio; 1 is flush
            // Clear any pending play / waits 
            evoData.completeEvents(AUDIO_DONE, 'preempted');
        }
        // The above is about clearing blocks
        // Conversion via: http://subsynth.sourceforge.net/midinote2freq.html
        let freq = 440 / 32 * 2 ** ((Cast.toNumber(args.TONE) - 9) / 12);
        let duration = Cast.toNumber(args.DURATION);
        console.log(`freq: ${freq} for ${duration} ms`);
        const rp = evoData.eventCompletionPromise(AUDIO_DONE, duration).then(() => {evoData.audio_playing = false;});
        evoData.audio_playing = true;
        await evoData.bot.generateTone(freq, duration, 200);  // Last argument is loudness; Appears to be unused
        return rp;
    }

    async setLEDs (args, util) {
        console.log(`setLEDs`);
        console.dir(args);
        const evoData = this.checkTargetForEvo(util.target);
        if (evoData === null) {
            return;
        }

        let ledID = 2**LED_NAMES.indexOf(args.LED); // Convert the index to a bit position (2^index)
        console.log(`LED ID: ${ledID}`);
        const color = Cast.toRgbColorObject(args.COLOR);
        await evoData.bot.setLED(ledID, color.r, color.g, color.b);
    }

    async forward (args, util) {
        console.log(`forward`);
        console.dir(args);
        const evoData = this.checkTargetForEvo(util.target);
        if (evoData === null) {
            return;
        }        const dist = this.restrictRange(-1500, 1500, Cast.toNumber(args.DISTANCE));
        const speed =  this.restrictRange(15, 300, Cast.toNumber(args.SPEED));
        console.log(`Sending dist: ${dist} and speed ${speed}`);

        // End any other motion in progress
       // evoData.completeEvents(MOTION_DONE);
        let expectedTime = dist / speed * 1000 * 5;
        console.log(`Expected time: ${expectedTime}`);
        // Create promises to ensure end (either completion or time)
        let rp = evoData.eventCompletionPromise(MOTION_DONE, expectedTime);
        // Initiate motion
        await evoData.bot.moveForwardBackward(dist, speed);
        return rp;
    }

    async rotate (args, util) {
        console.log(`rotate`);
        console.dir(args);
        const evoData = this.checkTargetForEvo(util.target);
        if (evoData === null) {
            return;
        }
        const degrees = Cast.toNumber(args.DEGREES);
        const speed =  this.restrictRange(15, 600, Cast.toNumber(args.SPEED));
        console.log(`Sending degrees: ${degrees} and speed ${speed}`);

        // End any other motion in progress
        // evoData.completeEvents(MOTION_DONE);
        let expectedTime = degrees / speed * 1000 * 5;
        console.log(`Expected time: ${expectedTime}`);
        // Create promises to ensure end (either completion or time)
        let rp = evoData.eventCompletionPromise(MOTION_DONE, expectedTime);
        // Initiate motion
        await evoData.bot.rotate(degrees, speed);

        return rp;
    }      

    whenObstacle (args, util) {
        console.log(`whenObstacle check ${util.thread.topBlock}`);
        if("value" in this == false) 
            this.value = true;
        else
            this.value = !this.value;
        return this.value;
    }
}
module.exports = OzobotEvoBlocks;


/*
 *  Misc. Notes
 * 
    Calling "Say" this.runtime._primitives.looks_say({MESSAGE:"Hello!"},util)
    Util has to have the target 
* 
        this.runtime.emit('SAY', this.runtime._editingTarget, 'say', "Bye");



                surfaceColorChange: 0x10,
                lineColorChange: 0x11,
                colorCodeDetected: 0x12,
                lineFound: 0x13,
                intersectionDetected: 0x14,
                obstacle: 0x15,
                evoEncountered: 0x16, // BSIEVER
                heightChange: 0x17, // BSIEVER
                smartSkinChange: 0x18, // BSIEVER
                smartSkinDataResponse: 0x19, // BSIEVER
                charger: 0x21,
                relativePosition: 0x31,
                EVOTurnOff: 0x22,
                fileState: 0x23,
                surfaceChange: 0x24, // BSIEVER
                surfaceProximityChanged: 0x25, // BSIEVER 
                irMessage: 0x26, // BSIEVER
                getSettingResponse: 0x27,

                movementFinishedSimple: 0x1a,
                movementFinishedExtended: 0x1b,
                summary: 0x1c,
                getValueResponse: 0x32,
                OID: 0x3f, // BSIEVER
                calibrationResponse: 0xd0,
                errorCode: 0xe0, // BSIEVER
                pidValues: 0xf0


Block sets:
    util.thread.topBlock  (ID of top block in stack???)

    
Costumes / Images:
    1. Include connected / disconnected 
    2. Include top light 
    3. Include battery indicator 


 Startup:
    Add autooff
    Disable any wierd stuff / stop all activities?   
 */