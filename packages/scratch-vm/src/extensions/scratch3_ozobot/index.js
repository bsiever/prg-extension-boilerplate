require("regenerator-runtime/runtime");

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const MathUtil = require('../../util/math-util');
const RenderedTarget = require('../../sprites/rendered-target');
const StageLayering = require('../../engine/stage-layering');
const { debug } = require('../../util/log');
const { THREAD_STEP_INTERVAL } = require("../../engine/runtime");
const { RemoteEvo } = require('./RemoteEvo.js');
const EvoImages = require('./EvoImages.js');

// Example of accessing module in another part of scratch (like VM or GUI)
// const fileUploader = require('../../../../../src/lib/file-uploader.js');  // Syntax for files in other modules (outside scratch-vm)
// From an actual path of   ../../../../scratch-gui/src/lib/file-uploader.js 

const EXTENSION_ID = 'ozobotEvoRobot';

function debugMessage (msg) {
    if (typeof msg === 'string') {
        console.log(msg);
    } else {
        console.dir(msg);
    }
}


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


const LED_NAMES = ['Top', 'Far Left', 'Left', 'Center', 'Right', 'Far Right', 'Power Button', 'Back'];

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

    onTargetMoved(target) {
        debugMessage('Target Moved');
        this.runtime.renderer.updateDrawableProperties(target.evoStatusId, {position: [target.x, target.y]});
        this.runtime.renderer.setDrawableOrder(target.evoStatusId, Infinity, StageLayering.SPRITE_LAYER);

        /*
            this.runtime._editingTarget.evoStatusId = this.runtime._editingTarget.runtime.renderer.createDrawable(StageLayering.SPRITE_LAYER);
            this.runtime._editingTarget.evoSkinId = this.runtime._editingTarget.runtime.renderer.createSVGSkin('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="20"/></svg>')
            this.runtime._editingTarget.runtime.renderer.updateDrawableProperties(this.runtime._editingTarget.evoStatusId, {skinId: this.runtime._editingTarget.evoSkinId});
        */
    }

    async stopAll() {
        // The project is stopped.  Stop and clear all blocks. 
        debugMessage("Stop All");
    }
    /**
     * TOOLBOX_EXTENSIONS_NEED_UPDATE Event: Something substantial has changed, like the selected target
     * 
     * Ensures that each target has an "EvoData" object
     */
    editingTargetChanged() {
        // Update the "bot" variable for this target
        debugMessage(`Target changed: ${this.runtime._editingTarget.sprite.name}`)
        // If the current object doesn't have an Evo, associate a new uninit one 
        if ('evoData' in this.runtime._editingTarget == false) {
            this.runtime._editingTarget.evoData = new RemoteEvo(this.runtime._editingTarget, this);
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
        debugMessage(`Event: ${name}`);
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
                default: 'Ozobot Evo Blocks',
                description: 'Extension to communicate with Ozobot Evo.'
            }),
            showStatusButton: false,  // The "!" status button used to search for bots in microbit
            blockIconURI: EvoImages.blockIcon,
            menuIconURI: EvoImages.blockIcon,

            blocks: [
                {
                    func: 'CONNECT_OZOBOTEVO',
                    blockType: BlockType.BUTTON,
                    // TODO: Add Ozo name to disconnect string
                    text: (evoData!==null && evoData.isAssociated()) ?
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
                    opcode: 'circle',              // Method to run
                    blockType: BlockType.COMMAND,  // Type of Block
                    text: formatMessage({
                        id: 'ozobotevoblocks.circle',
                        default: 'move in a circle [RADIUS] mm radius for [DEGREES] degrees at [SPEED] mm/s',
                        description: 'Rotate a given number of degrees at speed [15, 85]'
                    }),
                    arguments: {
                        RADIUS: {
                            type:ArgumentType.NUMBER,
                            defaultValue: 100
                        },
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
                },
                {
                    opcode: 'whenSomething',              // Method to run
                    blockType: BlockType.HAT,  // Type of Block
                    text: formatMessage({
                        id: 'ozobotevoblocks.whenSomething',
                        default: 'when [DURATION] do something',
                        description: 'Do something when something'
                    }),
                    arguments: {
                        DURATION: {
                            type:ArgumentType.NUMBER,
                            defaultValue: 1000
                        }
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
        debugMessage('connect()');
    }
    disconnect() {
        debugMessage('disconnect()');
    }

    scan() {
        // Called by the info button. 
        debugMessage('scan()');
        
    }
    isConnected() {
        debugMessage('isConnected()');
    }
    
    useDebugger(args, util) {
        debugMessage("Use Debugger Called");
      //  let vm = initialState; 
        debugMessage(args);
        this.updateCostume(util.target);

        // util.target.sprite.costumes.forEach( 
        //     (c, i) => {
        //           let data =  new TextDecoder().decode(c.asset.data);
        //           console.log(`Costume[${i}] = ${data}`);
        //     }
        // );

        debugger;
    }

    onDeviceDisconnected () {
        debugMessage("Lost connection to robot");   
        this.runtime.emit(this.runtime.constructor.PERIPHERAL_DISCONNECTED);
    }



    updatePalette() {
        this.runtime.emit("TOOLBOX_EXTENSIONS_NEED_UPDATE");
    }

    evoDisconnect() {
        debugMessage("Disconnected");
        // Remove the disconnect handler
        this.bot.removeDisconnectListener(this.disconnectHandler);
        this.bot = null; // Frees object...Hopefully garbage collected
        this.updatePalette();
    }
    

    statusSkinSVG(target, connected, power) {
        let str = `<svg width="${target.size}" height="${target.size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${target.size/2}" cy="${target.size/2}" r="${target.size/2}"/></svg>`;
        debugMessage(str);
        return str;
    }


    /**
     * UI Function 
     */
    async updateConnection () {
        const evoData = this.runtime._editingTarget.evoData;
        if (evoData.isAssociated()) {
            // Dis connect
            await evoData.disconnect();
        } else {
            debugMessage('Getting BLE device');
            debugMessage(this);
            try {
                if (evoData.requestDevice() !== true) {
                    // Not connected??
                    debugMessage('NOT Got a bot');
                } 
                this.updatePalette();        
            } catch (err) {
                debugMessage(err);
                debugMessage('Error / no connection.');
                if (evoData.bot) {
                    await evoData.bot.device.disconnect();
                }
            }
        }
    }


    checkTargetForEvo(target) {
        // Return null (if invalid) or bot object otherwise
        // TODO:  Check for valid evo data / return if none
        if ('evoData' in target === false || target.evoData.isConnected())
            return null;
        return target.evoData;
    }

    timedPromise(time, fail = false) {
        return new Promise((resolve, reject) => setTimeout(() => (fail ? reject() : resolve()), time));
    }

    async tone (args, util) {
        debugMessage(`tone`);
        debugMessage(args);

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
        const freq = 440 / 32 * 2 ** ((Cast.toNumber(args.TONE) - 9) / 12);
        const duration = Cast.toNumber(args.DURATION);
        const timeout = duration + 1000;
        debugMessage(`freq: ${freq} for ${duration} ms`);
        const rp = evoData.eventCompletionPromise(AUDIO_DONE, timeout).then(() => {evoData.audio_playing = false;});
        evoData.audio_playing = true;
        await evoData.bot.generateTone(freq, duration, 200);  // Last argument is loudness; Appears to be unused
        return rp;
    }

    async setLEDs (args, util) {
        debugMessage(`setLEDs`);
        debugMessage(args);
        const evoData = this.checkTargetForEvo(util.target);
        if (evoData === null) {
            return;
        }

        let ledID = 2**LED_NAMES.indexOf(args.LED); // Convert the index to a bit position (2^index)
        debugMessage(`LED ID: ${ledID}`);
        const color = Cast.toRgbColorObject(args.COLOR);
        await evoData.bot.setLED(ledID, color.r, color.g, color.b);
    }

    async forward (args, util) {
        debugMessage(`forward`);
        debugMessage(args);
        const evoData = this.checkTargetForEvo(util.target);
        if (evoData === null) {
            return;
        }
        const dist = MathUtil.clamp(Cast.toNumber(args.DISTANCE), -1500, 1500);
        const speed =  MathUtil.clamp(Cast.toNumber(args.SPEED), 15, 300);
        debugMessage(`Sending dist: ${dist} and speed ${speed}`);

        // End any other motion in progress
        // evoData.completeEvents(MOTION_DONE);
        let expectedTime = dist / speed * 1000 * 1.3 + 1000; // Timeout needs to be way past when response should be received
        debugMessage(`Expected time: ${expectedTime}`);
        // Create promises to ensure end (either completion or time)
        let rp = evoData.eventCompletionPromise(MOTION_DONE, expectedTime);
        // Initiate motion
        await evoData.bot.moveForwardBackward(dist, speed);
        return rp;
    }

    async circle (args, util) {
        debugMessage(`circle`);
        debugMessage(args);
        const evoData = this.checkTargetForEvo(util.target);
        if (evoData === null) {
            return;
        }       
        const radius = MathUtil.clamp(Cast.toNumber(args.RADIUS), -1500, 1500);
        const degrees =  MathUtil.clamp(Cast.toNumber(args.SPEED), -360, 360);
        const speed =  MathUtil.clamp(Cast.toNumber(args.SPEED), 15, 300);
        debugMessage(`Sending radius: ${radius}, degrees: ${degrees} and speed ${speed}`);

        // End any other motion in progress
        // evoData.completeEvents(MOTION_DONE);
        const dist = 2 * 3.14 * radius * degrees / 360;
        let expectedTime = dist / speed * 1000 * 1.3 + 1000; // Timeout needs to be way past when response should be received
        debugMessage(`Expected time: ${expectedTime}`);
        // Create promises to ensure end (either completion or time)
        let rp = evoData.eventCompletionPromise(MOTION_DONE, expectedTime);
        // Initiate motion
        await evoData.bot.circle(radius, degrees, speed);
        return rp;
    }

    async rotate (args, util) {
        debugMessage(`rotate`);
        debugMessage(args);
        const evoData = this.checkTargetForEvo(util.target);
        if (evoData === null) {
            return;
        }
        const degrees = Cast.toNumber(args.DEGREES);
        const speed =  MathUtil.clamp(Cast.toNumber(args.SPEED), 15, 600);
        debugMessage(`Sending degrees: ${degrees} and speed ${speed}`);

        // End any other motion in progress
        // evoData.completeEvents(MOTION_DONE);
        let expectedTime = degrees / speed * 1000 * 1.3 + 1000;
        debugMessage(`Expected time: ${expectedTime}`);
        // Create promises to ensure end (either completion or time)
        let rp = evoData.eventCompletionPromise(MOTION_DONE, expectedTime);
        // Initiate motion
        await evoData.bot.rotate(degrees, speed);

        return rp;
    }      

    whenObstacle (args, util) {
        debugMessage(`whenObstacle check ${util.thread.topBlock}`);
        if("value" in this == false) 
            this.value = true;
        else
            this.value = !this.value;
        return this.value;
    }


    // For debugging
    dumpCostumes () {
        this.runtime._editingTarget.sprite.costumes.forEach(
            (c, i) => {
                let data = new TextDecoder().decode(c.asset.data);
                console.log(`Costume[${i}] = ${data}`);
            });
    }

    // BSIEVER: This kinda works! 
    updateCostume (target) {
        console.log("Updating...!");
        //     updateSvg (costumeIndex, svg, rotationCenterX, rotationCenterY) {
        const costume = target.getCostumes()[0]; // vs. target.sprite.costumes[0]
        console.dir(costume);
        // Based on EvaBodyAbove23Plain,svg

   // LEDs ['Top', 'Far Left', 'Left', 'Center', 'Right', 'Far Right', 'Power Button', 'Back']
   const svg = EvoImages.evoSVG(true, 1, false, true, 75, ["#ffffff", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#7f0000", "#007f00"], [64, 160, 64, 5], "#ffff00");
        // Seem to have to offset skinId by 1???
        if (costume && this.runtime && this.runtime.renderer) {
            costume.rotationCenterX = 171;
            costume.rotationCenterY = 175;
            this.runtime.renderer.updateSVGSkin(costume.skinId, svg, [171, 175]);
            costume.size = this.runtime.renderer.getSkinSize(costume.skinId);
        }
        const storage = this.runtime.storage;
        // If we're in here, we've edited an svg in the vector editor,
        // so the dataFormat should be 'svg'
        costume.dataFormat = storage.DataFormat.SVG;
        costume.bitmapResolution = 1;
        costume.asset = storage.createAsset(
            storage.AssetType.ImageVector,
            costume.dataFormat,
            (new TextEncoder()).encode(svg),
            null,
            true // generate md5
        );
        costume.assetId = costume.asset.assetId;
        costume.md5 = `${costume.assetId}.${costume.dataFormat}`;
        this.runtime.vm.emit('targetsUpdate', {
            // [[target id, human readable target name], ...].
            targetList: this.runtime.targets
                .filter(
                    // Don't report clones.
                    target => !target.hasOwnProperty('isOriginal') || target.isOriginal
                ).map(
                    target => target.toJSON()
                ),
            // Currently editing target id.
            editingTarget: target.id 
        });
//        target.runtime.vm.updateSvg(costume.skinId-1, svg, 171, 175);  // I think we can leave rotations null and it'll center...
    //    target.runtime.emitProjectChanged();
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


    Classroom Mode: Disables spontaneous crap 

    getValue() exists in newer firmware (upgrade all bots)

    getValue(4) gets the RGB color from the sensor!!!



    Default project data: ./packages/scratch-gui/src/lib/default-project/e6ddc55a6ddd9cc9d84fe0b4c21e016f.svg

    */


    /*

    ReDrawing stuff: this.runtime.requestRedraw();

      RendererWebGL.js
        createSVGSkin()  : Add a new skin with a specific ID
        updateSVGSkin()
         _reskin()
         destroySkin()

         createBitmapSkin()  in renderer



            bubbleState.drawableId = this.runtime.renderer.createDrawable(StageLayering.SPRITE_LAYER);
         bubbleState.skinId = this.runtime.renderer.createTextSkin(type, text, bubbleState.onSpriteRight, [0, 0]);
            this.runtime.renderer.updateDrawableProperties(bubbleState.drawableId, {
                skinId: bubbleState.skinId
            });


drawableId = this.runtime.renderer.createDrawable(StageLayering.SPRITE_LAYER);
drawableId = target.runtime.renderer.createDrawable('sprite');
skinId = target.runtime.renderer.createSVGSkin('<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="20"/></svg>')

target.runtime.renderer.updateDrawableProperties(drawableId, {skinId: skinId});

*/