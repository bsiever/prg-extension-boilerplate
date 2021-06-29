(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.window = global.window || {}));
}(this, function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var AEVOCommands_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // import { BluetoothRemoteGATTCharacteristic } from '../external/web-bluetooth/BluetoothRemoteGATTCharacteristic';
    class AEVOCommands {
        constructor() {
            this.service = '';
            this.characteristics = {};
        }
        getGATTServiceConfig() {
            let gattConfig = {
                id: this.service,
                list: []
            };
            for (let index in this.characteristics) {
                if (false === this.characteristics.hasOwnProperty(index)) {
                    continue;
                }
                gattConfig.list.push(this.characteristics[index]);
            }
            return gattConfig;
        }
        int2Bytes(data, bytesCount, isLE) {
            let shift = (true === isLE) ? ((bytesCount - 1) * 8) : 0;
            let bytes = [];
            for (let i = 0; i < bytesCount; i++) {
                let dataByte = ((data >> shift) & 0xFF);
                bytes.push(dataByte);
                shift = (true === isLE) ? (shift - 8) : (shift + 8);
            }
            return bytes;
        }
        bytes2IntLE(data, from, to) {
            let value = 0;
            for (let i = from, multiplier = 1; i <= to; i++) {
                value += data[i] * multiplier;
                multiplier *= 256;
            }
            return value;
        }
        getGUID() {
            let s4 = function () {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            };
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
        normalizeResponseData(buffer) {
            const dataView = new DataView(buffer);
            let data = [];
            for (let i = 0; i < dataView.byteLength; i++) {
                data.push(dataView.getUint8(i));
            }
            return data;
        }
    }
    exports.AEVOCommands = AEVOCommands;
    });

    unwrapExports(AEVOCommands_1);
    var AEVOCommands_2 = AEVOCommands_1.AEVOCommands;

    var EVOSetup_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OzobotBLEServices = {
        batteryService: {
            id: 0x180f,
            name: 'org.bluetooth.service.battery_service',
            description: 'Generic battery service.',
            characteristics: {
                batteryLevel: {
                    id: '00002a19-0000-1000-8000-00805f9b34fb',
                    name: 'batteryLevel',
                    description: 'Battery level as number in percent, range 0..100%.',
                },
            },
        },
        deviceInformation: {
            id: 0x180a,
            name: 'org.bluetooth.service.device_information',
            description: 'Generic service providing the HW and FW versions.',
            characteristics: {
                firmwareRevision: {
                    id: '00002a26-0000-1000-8000-00805f9b34fb',
                    name: 'firmwareRevision',
                    description: 'Bootloader version',
                },
                hardwareRevision: {
                    id: '00002a27-0000-1000-8000-00805f9b34fb',
                    name: 'hardwareRevision',
                    description: 'HW version',
                },
                softwareRevision: {
                    id: '00002a28-0000-1000-8000-00805f9b34fb',
                    name: 'softwareRevision',
                    description: 'Firmware version',
                },
                manufacturerName: {
                    id: '00002a29-0000-1000-8000-00805f9b34fb',
                    name: 'manufacturerName',
                    description: 'Ozobot is by Evollve Inc.',
                },
            },
        },
        commands: {
            id: '8903136c-5f13-4548-a885-c58779136701',
            name: 'commands',
            description: 'Custom Ozobot service for commands.',
            required: true,
            characteristics: {
                movement: {
                    id: '8903136c-5f13-4548-a885-c58779136702',
                    name: 'movement',
                    description: 'Characteristic for all movement commands.',
                    required: true,
                },
                common: {
                    id: '8903136c-5f13-4548-a885-c58779136703',
                    name: 'common',
                    description: 'Characteristic for all commands except movement.',
                    required: true,
                },
            },
        },
        faltas: {
            id: '6ed3de6c-5f13-4548-a885-c58779136701',
            name: 'faltas',
            description: 'Custom Ozobot file transfer service.',
            required: true,
            characteristics: {
                fileData: {
                    id: '6ed3de6c-5f13-4548-a885-c58779136703',
                    name: 'fileData',
                    description: 'Data only.',
                    required: true,
                },
                command: {
                    id: '6ed3de6c-5f13-4548-a885-c58779136704',
                    name: 'command',
                    description: 'Faltas commands.',
                    required: true,
                },
            },
        },
    };
    /**
     * Example usage
     *
     * @example
        const device = await navigator.bluetooth.requestDevice({
          filters: EVOSetup.getFilter(),
          optionalServices: EVOSetup.getServices(),
        });
        const driver = new BLEDeviceWeb(device, EVOSetup.getCharacteristics());
        const evo = await driver.connect();
     */
    class EVOSetup {
        /**
         * WebBLE filter array with all possible name prefixes.
         * This used to be the only solution to connect to any device in times,
         * when the `acceptAllDevices` option did not work properly.
         */
        static getFilter() {
            let name = Array
                .from('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
                .map(c => ({ namePrefix: c }));
            name.push({ name: '' });
            return name;
        }
        static getCharacteristics() {
            // return a copy
            return JSON.parse(JSON.stringify(exports.OzobotBLEServices));
        }
        static getServices() {
            return Object.keys(exports.OzobotBLEServices)
                .map((v) => {
                return exports.OzobotBLEServices[v].id;
            });
        }
        /**
         * Get the debug state based on the `OZOBOT_BLE_DEBUG` global.
         */
        static isDebug() {
            return (typeof OZOBOT_BLE_DEBUG === 'undefined')
                ? false
                : !!OZOBOT_BLE_DEBUG;
        }
    }
    exports.EVOSetup = EVOSetup;
    });

    unwrapExports(EVOSetup_1);
    var EVOSetup_2 = EVOSetup_1.OzobotBLEServices;
    var EVOSetup_3 = EVOSetup_1.EVOSetup;

    var Notifications = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var SmartSkinGroup;
    (function (SmartSkinGroup) {
        SmartSkinGroup[SmartSkinGroup["None"] = 1] = "None";
        SmartSkinGroup[SmartSkinGroup["Marvel"] = 2] = "Marvel";
    })(SmartSkinGroup = exports.SmartSkinGroup || (exports.SmartSkinGroup = {}));
    var SmartSkinKindNone;
    (function (SmartSkinKindNone) {
        SmartSkinKindNone[SmartSkinKindNone["None"] = 1] = "None";
    })(SmartSkinKindNone = exports.SmartSkinKindNone || (exports.SmartSkinKindNone = {}));
    var SmartSkinKindMarvel;
    (function (SmartSkinKindMarvel) {
        SmartSkinKindMarvel[SmartSkinKindMarvel["Ironman"] = 1] = "Ironman";
        SmartSkinKindMarvel[SmartSkinKindMarvel["CaptainAmerica"] = 2] = "CaptainAmerica";
        SmartSkinKindMarvel[SmartSkinKindMarvel["Hulk"] = 3] = "Hulk";
        SmartSkinKindMarvel[SmartSkinKindMarvel["BlackWidow"] = 4] = "BlackWidow";
        SmartSkinKindMarvel[SmartSkinKindMarvel["Ultron"] = 5] = "Ultron";
    })(SmartSkinKindMarvel = exports.SmartSkinKindMarvel || (exports.SmartSkinKindMarvel = {}));
    var GetValueIdentifier;
    (function (GetValueIdentifier) {
        GetValueIdentifier[GetValueIdentifier["UUID"] = 0] = "UUID";
        GetValueIdentifier[GetValueIdentifier["SmartSkin"] = 1] = "SmartSkin";
        GetValueIdentifier[GetValueIdentifier["RemainingBattery"] = 2] = "RemainingBattery";
        GetValueIdentifier[GetValueIdentifier["SurfaceColor"] = 3] = "SurfaceColor";
        GetValueIdentifier[GetValueIdentifier["UnclassifiedColor"] = 4] = "UnclassifiedColor";
        GetValueIdentifier[GetValueIdentifier["SurfaceAndLineParameters"] = 5] = "SurfaceAndLineParameters";
        GetValueIdentifier[GetValueIdentifier["PowerGood"] = 6] = "PowerGood";
        GetValueIdentifier[GetValueIdentifier["Unknown"] = 255] = "Unknown";
    })(GetValueIdentifier = exports.GetValueIdentifier || (exports.GetValueIdentifier = {}));
    var UsageStatisticId;
    (function (UsageStatisticId) {
        UsageStatisticId[UsageStatisticId["DISTANCE_LINE_FOLLOWING_mm"] = 0] = "DISTANCE_LINE_FOLLOWING_mm";
        UsageStatisticId[UsageStatisticId["DISTANCE_FREE_MOVEMENT_mm"] = 1] = "DISTANCE_FREE_MOVEMENT_mm";
        UsageStatisticId[UsageStatisticId["INTERSECTION_LINE_END_count"] = 24] = "INTERSECTION_LINE_END_count";
        UsageStatisticId[UsageStatisticId["INTERSECTION_T_LEFT_count"] = 27] = "INTERSECTION_T_LEFT_count";
        UsageStatisticId[UsageStatisticId["INTERSECTION_T_RIGHT_count"] = 29] = "INTERSECTION_T_RIGHT_count";
        UsageStatisticId[UsageStatisticId["INTERSECTION_T_END_count"] = 30] = "INTERSECTION_T_END_count";
        UsageStatisticId[UsageStatisticId["INTERSECTION_PLUS_count"] = 31] = "INTERSECTION_PLUS_count";
        UsageStatisticId[UsageStatisticId["EVENT_PAPER_CALIBRATION_SUCCEEDED_count"] = 32] = "EVENT_PAPER_CALIBRATION_SUCCEEDED_count";
        UsageStatisticId[UsageStatisticId["EVENT_TOTAL_CALIBRATION_FAILED_count"] = 33] = "EVENT_TOTAL_CALIBRATION_FAILED_count";
        UsageStatisticId[UsageStatisticId["EVENT_DIGITAL_CALIBRATION_SUCCEEDED_count"] = 34] = "EVENT_DIGITAL_CALIBRATION_SUCCEEDED_count";
        // not supported
        // EVENT_DIGITAL_CALIBRATION_FAILED_count = 0x23,
        UsageStatisticId[UsageStatisticId["EVENT_LINE_COLOR_CHANGE_count"] = 36] = "EVENT_LINE_COLOR_CHANGE_count";
        UsageStatisticId[UsageStatisticId["EVENT_SURFACE_COLOR_CHANGE_count"] = 37] = "EVENT_SURFACE_COLOR_CHANGE_count";
        UsageStatisticId[UsageStatisticId["EVENT_COLOR_CODE_count"] = 38] = "EVENT_COLOR_CODE_count";
        UsageStatisticId[UsageStatisticId["EVENT_OBSTACLE_count"] = 39] = "EVENT_OBSTACLE_count";
        UsageStatisticId[UsageStatisticId["EVENT_MESSAGE_FROM_OTHER_ROBOT_RECEIVED_count"] = 40] = "EVENT_MESSAGE_FROM_OTHER_ROBOT_RECEIVED_count";
        UsageStatisticId[UsageStatisticId["EVENT_AUDIO_TRIGGERED_count"] = 41] = "EVENT_AUDIO_TRIGGERED_count";
        UsageStatisticId[UsageStatisticId["EVENT_ROBOT_PICKED_UP_count"] = 42] = "EVENT_ROBOT_PICKED_UP_count";
        UsageStatisticId[UsageStatisticId["EVENT_USER_PROGRAM_FLASH_SUCCEEDED_count"] = 43] = "EVENT_USER_PROGRAM_FLASH_SUCCEEDED_count";
        UsageStatisticId[UsageStatisticId["EVENT_USER_PROGRAM_FLASH_ATTEMPTS_count"] = 44] = "EVENT_USER_PROGRAM_FLASH_ATTEMPTS_count";
        UsageStatisticId[UsageStatisticId["EVENT_USER_PROGRAM_STARTED_count"] = 45] = "EVENT_USER_PROGRAM_STARTED_count";
        UsageStatisticId[UsageStatisticId["EVENT_SMART_SKIN_CONNECTED_count"] = 46] = "EVENT_SMART_SKIN_CONNECTED_count";
        UsageStatisticId[UsageStatisticId["EVENT_BOOT_count"] = 48] = "EVENT_BOOT_count";
        UsageStatisticId[UsageStatisticId["EVENT_SHUTDOWN_count"] = 49] = "EVENT_SHUTDOWN_count";
        UsageStatisticId[UsageStatisticId["TIME_CHARGING_s"] = 64] = "TIME_CHARGING_s";
        UsageStatisticId[UsageStatisticId["TIME_IDLE_s"] = 65] = "TIME_IDLE_s";
        UsageStatisticId[UsageStatisticId["TIME_LINE_FOLLOWING_s"] = 66] = "TIME_LINE_FOLLOWING_s";
        UsageStatisticId[UsageStatisticId["TIME_FREE_MOVEMENT_s"] = 67] = "TIME_FREE_MOVEMENT_s";
        UsageStatisticId[UsageStatisticId["TIME_BLE_CONNECTED_s"] = 68] = "TIME_BLE_CONNECTED_s";
        UsageStatisticId[UsageStatisticId["TIME_BLE_DISCONNECTED_s"] = 69] = "TIME_BLE_DISCONNECTED_s";
        UsageStatisticId[UsageStatisticId["TIME_SURFACE_DIGITAL_s"] = 70] = "TIME_SURFACE_DIGITAL_s";
        UsageStatisticId[UsageStatisticId["TIME_SURFACE_PAPER_s"] = 71] = "TIME_SURFACE_PAPER_s";
        UsageStatisticId[UsageStatisticId["TIME_SMARTSKIN_CONNECTED_s"] = 72] = "TIME_SMARTSKIN_CONNECTED_s";
        UsageStatisticId[UsageStatisticId["TIME_SMARTSKIN_DISCONNECTED_s"] = 73] = "TIME_SMARTSKIN_DISCONNECTED_s";
        UsageStatisticId[UsageStatisticId["SYSTEM_COLOR_SENSOR_FAILURE_count"] = 240] = "SYSTEM_COLOR_SENSOR_FAILURE_count";
        UsageStatisticId[UsageStatisticId["SYSTEM_MULTIPLEXER_FAILURE_count"] = 241] = "SYSTEM_MULTIPLEXER_FAILURE_count";
        UsageStatisticId[UsageStatisticId["SYSTEM_LEDSTRIP_FAILURE_count"] = 242] = "SYSTEM_LEDSTRIP_FAILURE_count";
        UsageStatisticId[UsageStatisticId["SYSTEM_BLE_FAILURE_count"] = 243] = "SYSTEM_BLE_FAILURE_count";
    })(UsageStatisticId = exports.UsageStatisticId || (exports.UsageStatisticId = {}));
    var GetSettingIdentifier;
    (function (GetSettingIdentifier) {
        GetSettingIdentifier[GetSettingIdentifier["Brightness"] = 0] = "Brightness";
        GetSettingIdentifier[GetSettingIdentifier["AudioVolume"] = 1] = "AudioVolume";
        GetSettingIdentifier[GetSettingIdentifier["Behavior"] = 2] = "Behavior";
    })(GetSettingIdentifier = exports.GetSettingIdentifier || (exports.GetSettingIdentifier = {}));
    });

    unwrapExports(Notifications);
    var Notifications_1 = Notifications.SmartSkinGroup;
    var Notifications_2 = Notifications.SmartSkinKindNone;
    var Notifications_3 = Notifications.SmartSkinKindMarvel;
    var Notifications_4 = Notifications.GetValueIdentifier;
    var Notifications_5 = Notifications.UsageStatisticId;
    var Notifications_6 = Notifications.GetSettingIdentifier;

    var EVOCommands_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });



    class EVOCommands extends AEVOCommands_1.AEVOCommands {
        constructor() {
            super();
            this.commands = {
                moveWheels: 0x40,
                moveForwardBackward: 0x41,
                rotate: 0x42,
                circle: 0x43,
                setLED: 0x44,
                playFile: 0x45,
                toggleLineFollowing: 0x46,
                setColorCode: 0x47,
                calibrate: 0x48,
                turnEVOOff: 0x49,
                updateFirmware: 0x4a,
                requestSummary: 0x4b,
                generateTone: 0x4f,
                stopFile: 0x50,
                requestFileState: 0x51,
                setLineFollowingSpeed: 0x60,
                toggleIgnoreColorCodes: 0x61,
                setRandomSeed: 0x62,
                setEVOName: 0x63,
                setObstacleNotifications: 0x64,
                setWanderSettings: 0x65,
                setIdleSettings: 0x66,
                setAutoOffTimeSettings: 0x67,
                setMovementNotifications: 0x6a,
                setMotorPower: 0x6b,
                toggleChildAdultAccount: 0x6c,
                toggleSensorLogging: 0x6d,
                setSetting: 0x6e,
                getSettingRequest: 0x6f,
                setRelativePositionNotificationPeriod: 0x73,
                getValueRequest: 0x74,
                requestCallibration: 0xd3
            };
        }
        getCharacteristicCommon() {
            return EVOSetup_1.OzobotBLEServices.commands.characteristics.common.id;
        }
        getCharacteristicMove() {
            return EVOSetup_1.OzobotBLEServices.commands.characteristics.movement.id;
        }
        moveWheels(leftMove, rightMove, expire) {
            let data = [this.commands.moveWheels];
            data = data.concat(this.int2Bytes(leftMove, 2, false));
            data = data.concat(this.int2Bytes(rightMove, 2, false));
            data = data.concat(this.int2Bytes(expire, 2, false));
            return data;
        }
        moveForwardBackward(distance, speed) {
            let data = [this.commands.moveForwardBackward];
            data = data.concat(this.int2Bytes(distance, 2, false));
            data = data.concat(this.int2Bytes(speed, 2, false));
            return data;
        }
        rotate(degrees, speed) {
            let data = [this.commands.rotate];
            data = data.concat(this.int2Bytes(degrees, 2, false));
            data = data.concat(this.int2Bytes(speed, 2, false));
            return data;
        }
        circle(radius, degrees, speed) {
            let data = [this.commands.circle];
            data = data.concat(this.int2Bytes(radius, 2, false));
            data = data.concat(this.int2Bytes(degrees, 2, false));
            data = data.concat(this.int2Bytes(speed, 2, false));
            return data;
        }
        setLED(bits, red, green, blue) {
            let data = [this.commands.setLED];
            data = data.concat(this.int2Bytes(bits, 2, false));
            data = data.concat(this.int2Bytes(red, 1, false));
            data = data.concat(this.int2Bytes(green, 1, false));
            data = data.concat(this.int2Bytes(blue, 1, false));
            return data;
        }
        playFile(fileType, name, abort) {
            let data = [this.commands.playFile, fileType];
            for (var i = 0; i < 8; i++) {
                if (i > (name.length - 1)) {
                    data.push(0);
                    continue;
                }
                data.push(name.charCodeAt(i));
            }
            data.push(abort);
            return data;
        }
        toggleLineFollowing(toggle) {
            let data = [this.commands.toggleLineFollowing, toggle];
            return data;
        }
        setColorCode(colorCode) {
            let data = [this.commands.setColorCode];
            data = data.concat(this.int2Bytes(colorCode, 4, false));
            return data;
        }
        calibrate(type) {
            let data = [this.commands.calibrate, type];
            return data;
        }
        turnEVOOff() {
            let data = [this.commands.turnEVOOff];
            return data;
        }
        updateFirmware() {
            let data = [this.commands.updateFirmware];
            return data;
        }
        requestSummary(type) {
            let data = [this.commands.requestSummary, type];
            return data;
        }
        generateTone(tone, time, loudness) {
            let data = [this.commands.generateTone];
            data = data.concat(this.int2Bytes(tone, 2, false));
            data = data.concat(this.int2Bytes(time, 2, false));
            data.push(loudness);
            return data;
        }
        stopFile(fileType, flush) {
            let data = [this.commands.stopFile];
            data.push(fileType);
            data.push(flush);
            return data;
        }
        requestFileState(fileType) {
            let data = [this.commands.requestFileState];
            data.push(fileType);
            return data;
        }
        setLineFollowingSpeed(speed) {
            let data = [this.commands.setLineFollowingSpeed];
            data = data.concat(this.int2Bytes(speed, 2, false));
            return data;
        }
        toggleIgnoreColorCodes(ignoreColorCodes) {
            let data = [this.commands.toggleIgnoreColorCodes];
            data.push(ignoreColorCodes);
            return data;
        }
        setRandomSeed(seed) {
            let data = [this.commands.setRandomSeed];
            data = data.concat(this.int2Bytes(seed, 4, false));
            return data;
        }
        setEVOName(name) {
            let data = [this.commands.setEVOName];
            for (var i = 0; i < 19; i++) {
                if (i > (name.length - 1)) {
                    data.push(0);
                    continue;
                }
                data.push(name.charCodeAt(i));
            }
            return data;
        }
        setObstacleNotifications(leftFront, rightFront, leftRear, rightRear, period) {
            let data = [this.commands.setObstacleNotifications];
            data = data.concat([leftFront, rightFront, leftRear, rightRear]);
            data = data.concat(this.int2Bytes(period, 2, false));
            return data;
        }
        setRelativePositionNotificationPeriod(periodMs) {
            let data = [this.commands.setRelativePositionNotificationPeriod];
            data = data.concat(this.int2Bytes(periodMs, 2, false));
            return data;
        }
        setWanderSettings(enabled, time, radius, boundary) {
            let data = [this.commands.setWanderSettings, enabled, time];
            data = data.concat(this.int2Bytes(radius, 2, false));
            data.push(boundary);
            return data;
        }
        setIdleSettings(enabled, time) {
            let data = [this.commands.setIdleSettings, enabled, time];
            return data;
        }
        setAutoOffTimeSettings(time) {
            let data = [this.commands.setAutoOffTimeSettings];
            data = data.concat(this.int2Bytes(time, 2, false));
            return data;
        }
        setMovementNotifications(notification) {
            let data = [this.commands.setMovementNotifications, notification];
            return data;
        }
        setMotorPower(leftMotor, rightMotor, expire) {
            let data = [this.commands.setMotorPower];
            data = data.concat(this.int2Bytes(leftMotor, 2, false));
            data = data.concat(this.int2Bytes(rightMotor, 2, false));
            data = data.concat(this.int2Bytes(expire, 2, false));
            return data;
        }
        toggleChildAdultAccount(accountType) {
            let data = [this.commands.toggleChildAdultAccount, accountType];
            return data;
        }
        toggleSensorLogging(logging) {
            let data = [this.commands.toggleSensorLogging, logging];
            return data;
        }
        setLEDsMaxBrightness(brightness) {
            let data = [this.commands.setSetting, Notifications.GetSettingIdentifier.Brightness, brightness];
            return data;
        }
        setAudioVolume(volume) {
            let data = [this.commands.setSetting, Notifications.GetSettingIdentifier.AudioVolume, volume];
            return data;
        }
        toggleClassroomBehavior(behavior) {
            let data = [this.commands.setSetting, Notifications.GetSettingIdentifier.Behavior, behavior];
            return data;
        }
        setSetting(kind, value) {
            let data = [this.commands.setSetting, kind, value];
            return data;
        }
        getSettingRequest(kind) {
            let data = [this.commands.getSettingRequest, kind];
            return data;
        }
        getValueRequest(kind) {
            let data = [this.commands.getValueRequest, kind];
            return data;
        }
        requestCallibration() {
            let data = [this.commands.requestCallibration];
            return data;
        }
    }
    exports.EVOCommands = EVOCommands;
    });

    unwrapExports(EVOCommands_1);
    var EVOCommands_2 = EVOCommands_1.EVOCommands;

    var EVOCommandsNotifications_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });



    var Intersection;
    (function (Intersection) {
        Intersection[Intersection["ERROR"] = 0] = "ERROR";
        Intersection[Intersection["STRAIGHT"] = 1] = "STRAIGHT";
        Intersection[Intersection["LEFT"] = 2] = "LEFT";
        Intersection[Intersection["RIGHT"] = 4] = "RIGHT";
        Intersection[Intersection["BACKWARDS"] = 8] = "BACKWARDS";
        Intersection[Intersection["T_JOINT_LEFT"] = 11] = "T_JOINT_LEFT";
        Intersection[Intersection["T_JOINT_RIGHT"] = 13] = "T_JOINT_RIGHT";
        Intersection[Intersection["T_END"] = 14] = "T_END";
        Intersection[Intersection["PLUS"] = 15] = "PLUS";
        Intersection[Intersection["DEFAULT_DECISION"] = 7] = "DEFAULT_DECISION";
    })(Intersection || (Intersection = {}));
    class EVOCommandsNotifications extends AEVOCommands_1.AEVOCommands {
        constructor() {
            super();
            this.notifications = {
                surfaceColorChange: 0x10,
                lineColorChange: 0x11,
                colorCodeDetected: 0x12,
                lineFound: 0x13,
                intersectionDetected: 0x14,
                obstacle: 0x15,
                movementFinishedSimple: 0x1a,
                movementFinishedExtended: 0x1b,
                summary: 0x1c,
                charger: 0x21,
                EVOTurnOff: 0x22,
                fileState: 0x23,
                getSettingResponse: 0x27,
                relativePosition: 0x31,
                getValueResponse: 0x32,
                calibrationResponse: 0xd0
            };
            this.subscribed = {};
        }
        subscribe(notification, callback) {
            if (false === this.notifications.hasOwnProperty(notification)) {
                if (EVOSetup_1.EVOSetup.isDebug()) {
                    console.log('notifications: ' + this.notifications);
                }
                throw Error('EVOCommandsNotifications subscribe error - notification "' + notification + '" unknown!');
            }
            let guid = this.getGUID();
            let notificationKey = this.notifications[notification].toString();
            this.addSubscribe(notificationKey, guid, callback);
            return { unsubscribe: this.getUnsubscribe(notificationKey, guid) };
        }
        subscribeSurfaceColorChange(callback) {
            let guid = this.getGUID();
            let notificationKey = this.notifications['surfaceColorChange'].toString();
            this.addSubscribe(notificationKey, guid, callback);
            return { unsubscribe: this.getUnsubscribe(notificationKey, guid) };
        }
        addSubscribe(notificationKey, guid, callback) {
            if (false === this.subscribed.hasOwnProperty(notificationKey)) {
                this.subscribed[notificationKey] = {};
            }
            this.subscribed[notificationKey][guid] = callback;
        }
        getUnsubscribe(notificationKey, guid) {
            let unsubscribe = () => {
                if (false === this.subscribed.hasOwnProperty(notificationKey)) {
                    return;
                }
                delete this.subscribed[notificationKey][guid];
            };
            return unsubscribe;
        }
        notificationProcess(buffer) {
            const data = this.normalizeResponseData(buffer);
            let value = this.notificationProcess_(data);
            let notificationKey = data[0].toString();
            if (false === this.subscribed.hasOwnProperty(notificationKey)) {
                return;
            }
            for (let i in this.subscribed[notificationKey]) {
                this.subscribed[notificationKey][i](value);
            }
        }
        notificationProcess_(data) {
            let value;
            switch (data[0]) {
                case this.notifications['surfaceColorChange']:
                    value = this.notificationSurfaceColorChange(data);
                    break;
                case this.notifications['lineColorChange']:
                    value = this.notificationLineColorChange(data);
                    break;
                case this.notifications['colorCodeDetected']:
                    value = this.notificationColorCodeDetected(data);
                    break;
                case this.notifications['lineFound']:
                    value = this.notificationLineFound(data);
                    break;
                case this.notifications['intersectionDetected']:
                    value = this.notificationIntersectionDetected(data);
                    break;
                case this.notifications['obstacle']:
                    value = this.notificationObstacle(data);
                    break;
                case this.notifications['movementFinishedSimple']:
                    value = this.notificationMovementFinishedSimple(data);
                    break;
                case this.notifications['movementFinishedExtended']:
                    value = this.notificationMovementFinishedExtended(data);
                    break;
                case this.notifications['summary']:
                    value = this.notificationSummary(data);
                    break;
                case this.notifications['charger']:
                    value = this.notificationCharger(data);
                    break;
                case this.notifications['EVOTurnOff']:
                    value = this.notificationEVOTurnOff(data);
                    break;
                case this.notifications['fileState']:
                    value = this.notificationFileState(data);
                    break;
                case this.notifications['getSettingResponse']:
                    value = this.notificationSetting(data);
                    break;
                case this.notifications['relativePosition']:
                    value = this.notificationRelativePosition(data);
                    break;
                case this.notifications['getValueResponse']:
                    value = this.notificationGetValueResponse(data);
                    break;
                case this.notifications['calibrationResponse']:
                    value = this.notificationCalibrationResponse(data);
                    break;
            }
            return value;
        }
        notificationSurfaceColorChange(data) {
            let color = this.bytes2IntLE(data, 1, 1);
            return color;
        }
        notificationLineColorChange(data) {
            let color = this.bytes2IntLE(data, 1, 1);
            return color;
        }
        notificationColorCodeDetected(data) {
            let colorCodes = this.bytes2IntLE(data, 1, 4);
            return colorCodes;
        }
        notificationLineFound(data) {
            return true;
        }
        notificationIntersectionDetected(data) {
            let intersection = this.bytes2IntLE(data, 1, 1);
            return intersection;
        }
        notificationObstacle(data) {
            let obstacles = {
                leftFront: this.bytes2IntLE(data, 1, 1),
                rightFront: this.bytes2IntLE(data, 2, 2),
                leftBack: this.bytes2IntLE(data, 3, 3),
                rightBack: this.bytes2IntLE(data, 4, 4),
            };
            return obstacles;
        }
        notificationMovementFinishedSimple(data) {
            let movementFinished = this.bytes2IntLE(data, 1, 1);
            return (movementFinished === 0) ? false : true;
        }
        notificationMovementFinishedExtended(data) {
            // TODO: some values are not UInt16 but signed Int16!
            let moveFinishedExtended = {
                finishedOk: (this.bytes2IntLE(data, 1, 1) === 0) ? false : true,
                maxSpeed: this.bytes2IntLE(data, 2, 3),
                duration: this.bytes2IntLE(data, 4, 5),
                overshootLeft: this.bytes2IntLE(data, 6, 7),
                overshootRight: this.bytes2IntLE(data, 8, 9),
                ballanceError: this.bytes2IntLE(data, 10, 11),
            };
            return moveFinishedExtended;
        }
        notificationSummary(data) {
            const dataview = new DataView(Uint8Array.from(data).buffer);
            // Format should be always 4, meaning the value is 4 byte unsigned integer.
            // const format = dataview.getUint8(2);
            return {
                type: dataview.getUint8(1),
                value: dataview.getUint32(3, true),
            };
        }
        notificationCharger(data) {
            let chargerConnected = this.bytes2IntLE(data, 1, 1);
            return (chargerConnected === 0) ? false : true;
        }
        notificationEVOTurnOff(data) {
            return true;
        }
        notificationFileState(data) {
            let status = {
                fileType: data[1],
                running: (data[2] == 1),
            };
            return status;
        }
        notificationSetting(data) {
            let setting = {
                kind: data[1],
                value: data[2]
            };
            return setting;
        }
        notificationRelativePosition(data) {
            const dataview = new DataView(Uint8Array.from(data).buffer);
            // S8_24 is fix point fraction number saved in the signed integer.
            // S8_24 conversion to float is to divide the fraction number by 1<<24.
            const convertS824ToFloat = (input) => {
                return input / (1 << 24);
            };
            const x = convertS824ToFloat(dataview.getInt32(1, true));
            const y = convertS824ToFloat(dataview.getInt32(5, true));
            const dirX = convertS824ToFloat(dataview.getInt32(9, true));
            const dirY = convertS824ToFloat(dataview.getInt32(13, true));
            const hypot = (!!Math.hypot)
                ? Math.hypot
                : (a, b) => Math.sqrt(a * a + b * b);
            let angleRad = Math.acos(dirX / hypot(dirX, dirY));
            if (dirY < 0) {
                // make range 0 - 2PI (0 - 360 degrees)
                angleRad = 2 * Math.PI - angleRad;
            }
            return {
                mm: {
                    x: Math.round(x * 1000 * 10) / 10,
                    y: Math.round(y * 1000 * 10) / 10,
                },
                inch: {
                    x: Math.round(x * 10000 / 254 * 100) / 100,
                    y: Math.round(y * 10000 / 254 * 100) / 100,
                },
                raw: {
                    position: {
                        x: x,
                        y: y,
                    },
                    directionVector: {
                        x: dirX,
                        y: dirY,
                    },
                },
                angle: {
                    deg: Math.round(angleRad * 180 / Math.PI * 100) / 100,
                    rad: angleRad,
                },
                surfaceChangeCount: dataview.getUint16(17, true),
                onSurface: !!(dataview.getUint8(19) & 0x01),
            };
        }
        notificationGetValueResponse(data) {
            const dataview = new DataView(Uint8Array.from(data).buffer);
            switch (dataview.getUint8(1)) {
                case Notifications.GetValueIdentifier.UUID:
                    return {
                        kind: Notifications.GetValueIdentifier.UUID,
                        uuid: data.slice(2, 18)
                            .map((v) => ('00' + v.toString(16)).substr(-2))
                            .join('')
                            .toLowerCase(),
                    };
                case Notifications.GetValueIdentifier.SmartSkin:
                    return {
                        kind: Notifications.GetValueIdentifier.SmartSkin,
                        skinGroup: dataview.getUint8(2),
                        skinKind: dataview.getUint8(3),
                    };
                case Notifications.GetValueIdentifier.RemainingBattery:
                    return {
                        kind: Notifications.GetValueIdentifier.RemainingBattery,
                        /** Remaining battery in percents. */
                        value: dataview.getUint8(2),
                    };
                case Notifications.GetValueIdentifier.SurfaceColor:
                    return {
                        kind: Notifications.GetValueIdentifier.SurfaceColor,
                        color: dataview.getUint8(2),
                    };
                case Notifications.GetValueIdentifier.UnclassifiedColor:
                    return {
                        kind: Notifications.GetValueIdentifier.UnclassifiedColor,
                        red: dataview.getUint8(2),
                        green: dataview.getUint8(3),
                        blue: dataview.getUint8(4),
                    };
                case Notifications.GetValueIdentifier.SurfaceAndLineParameters:
                    const lineBitmap = dataview.getUint8(6);
                    const SENSOR_COUNT = 7;
                    return {
                        kind: Notifications.GetValueIdentifier.SurfaceAndLineParameters,
                        linePosition: dataview.getInt16(2, true),
                        lineWidth: dataview.getUint16(4, true),
                        lineBitmap: lineBitmap,
                        lineOnSensor: [...Array(SENSOR_COUNT)].map((_, i) => !!((lineBitmap >> i) & 1)),
                        surface: dataview.getUint8(7),
                    };
                case Notifications.GetValueIdentifier.PowerGood:
                    return {
                        kind: Notifications.GetValueIdentifier.PowerGood,
                        connected: !!dataview.getUint8(2),
                    };
                default:
                    // Note: unknown responses are ignored
                    return {
                        kind: Notifications.GetValueIdentifier.Unknown,
                    };
            }
        }
        notificationCalibrationResponse(data) {
            let calibrationResult = this.bytes2IntLE(data, 1, 1);
            return (calibrationResult === 0) ? false : true;
        }
    }
    exports.EVOCommandsNotifications = EVOCommandsNotifications;
    });

    unwrapExports(EVOCommandsNotifications_1);
    var EVOCommandsNotifications_2 = EVOCommandsNotifications_1.EVOCommandsNotifications;

    var Timer_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Promise that gets resolved after the given time using `setTimeout`.
     * @param timeMs Time in ms (optional).
     */
    exports.pausePromise = function (timeMs = 0) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, timeMs);
        });
    };
    /**
     * Simple time counter with start(), stop(), getMeantime().
     */
    class Timer {
        constructor() {
            this.isRunning_ = false;
            this.startTs_ = new Date();
            this.stopTs_ = new Date();
        }
        start() {
            if (this.isRunning_) {
                throw new Error('TIMER: timer is already running!');
            }
            this.startTs_ = new Date();
            this.isRunning_ = true;
        }
        reset() {
            this.startTs_ = new Date();
        }
        stop(inSeconds) {
            if (false === this.isRunning_) {
                throw new Error('TIMER: timer is not running!');
            }
            this.stopTs_ = new Date();
            this.isRunning_ = false;
            return this.get(inSeconds);
        }
        isRunning() {
            return this.isRunning_;
        }
        getMeantime(inSeconds) {
            let now = new Date();
            let diff = now.valueOf() - this.startTs_.valueOf();
            return (inSeconds)
                ? (diff / 1000)
                : diff;
        }
        get(inSeconds) {
            let diff = this.stopTs_.valueOf() - this.startTs_.valueOf();
            return (inSeconds)
                ? (diff / 1000)
                : diff;
        }
    }
    exports.Timer = Timer;
    });

    unwrapExports(Timer_1);
    var Timer_2 = Timer_1.pausePromise;
    var Timer_3 = Timer_1.Timer;

    var EVOFaltas_1 = createCommonjsModule(function (module, exports) {
    var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    class EVOFaltas extends AEVOCommands_1.AEVOCommands {
        constructor(device) {
            super();
            /** After the this amount of errors the transfer will fail. */
            this.MAX_ACCEPTABLE_ERRORS = 20;
            this.commands = {
                volumeSize: 0x53,
                directoryListing: 0x4c,
                fileInfo: 0x52,
                deleteFile: 0x44,
                uploadFile: 0x55,
                uploadFileBlock: 0x42,
            };
            this.notifications = {
                volumeSize: 0x73,
                directoryListing: 0x6c,
                fileInfo: 0x72,
                deleteFile: 0x64,
                uploadFile: 0x75,
                uploadFileBlock: 0x62,
                uploadFileEndBlock: 0x65,
                uploadFilePacket: 0x70
            };
            this.config = {
                /** Number of bytes in one packet (smallest unit). */
                packetSize: 20,
                /**
                 * Number of packets in one block.
                 * Decreasing this number (to 15) could reduce packet loss / corruption.
                 */
                blockPackets: 25,
            };
            this.errorCodes = [
                'No error',
                'Generic Error (not in list)',
                'CRC check failed',
                'Unknown failure creating/writing file',
                'FS in unknown state error',
                'Hardware too busy to handle Command',
                'File already exists and was not “in process”',
                'Not enough room on FS for file',
                'Invalid information in packet',
                'Block number is out of sequence',
                'Failed to get all packets (timed out or missing packets)',
                'File/Directory does not exist.',
                'End of any list (not an error)',
                'File descriptor does not exist',
                'Partial file',
                'Already uploaded' //15
            ];
            this.subscribed = {};
            this.processing = {
                volumeSize: { progress: false, resolve: null, reject: null },
                directoryListing: { progress: false, resolve: null, reject: null, list: [] },
                fileInfo: { progress: false, resolve: null, reject: null },
                deleteFile: { progress: false, resolve: null, reject: null },
                uploadFile: { progress: false, resolve: null, reject: null, block: 0, blocks: [], blockSize: 0, size: 0, errors: 0, timer: new Timer_1.Timer(), callback: () => { } },
            };
            this.device = device;
            this.crc32Table = this.generateCrcTable();
        }
        subscribe(notification, callback) {
            if (false === this.notifications.hasOwnProperty(notification)) {
                throw Error('EVOFaltasNotifications subscribe error - notification "' + notification + '" unknown!');
            }
            let guid = this.getGUID();
            let notificationKey = this.notifications[notification].toString();
            this.addSubscribe(notificationKey, guid, callback);
            return { unsubscribe: this.getUnsubscribe(notificationKey, guid) };
        }
        addSubscribe(notificationKey, guid, callback) {
            if (false === this.subscribed.hasOwnProperty(notificationKey)) {
                this.subscribed[notificationKey] = {};
            }
            this.subscribed[notificationKey][guid] = callback;
        }
        getUnsubscribe(notificationKey, guid) {
            let unsubscribe = () => {
                if (false === this.subscribed.hasOwnProperty(notificationKey)) {
                    return;
                }
                delete this.subscribed[notificationKey][guid];
            };
            return unsubscribe;
        }
        checkProcessing(processing) {
            if (true === processing.progress) {
                throw Error('FALTAS command in progress!');
            }
        }
        uploadDataPrepare(data, callback) {
            const packetSize = this.config.packetSize;
            const blockPackets = this.config.blockPackets;
            let packetsCount = Math.ceil(data.length / packetSize);
            let blocksCount = Math.ceil(packetsCount / blockPackets);
            let blocksParts = [];
            let blockSize = 0;
            let dataIndex = 0;
            let packetIndex = 0;
            for (let i = 0; i < blocksCount; i++) {
                let packets = [];
                let packetIndexMax = Math.min(packetIndex + blockPackets, packetsCount);
                let partSize = 0;
                for (; packetIndex < packetsCount && packetIndex < packetIndexMax; packetIndex++) {
                    let packet;
                    if ((i + 1) === blocksCount && (packetIndex + 1) === packetsCount) {
                        packet = data.slice(dataIndex);
                    }
                    else {
                        packet = data.slice(dataIndex, dataIndex + packetSize);
                    }
                    partSize += packet.length;
                    packets.push(packet);
                    dataIndex += packetSize;
                }
                let blockCRC32 = this.CRC32(data.slice(0, dataIndex));
                let block = { packets: packets, packet: 0, block: this.int2Bytes(i, 4, true), crc32: blockCRC32, size: partSize };
                blocksParts.push(block);
                if (i === 0) {
                    blockSize = (packets.length * packetSize);
                }
            }
            this.processing.uploadFile.size = data.length;
            this.processing.uploadFile.block = 0;
            this.processing.uploadFile.blocks = blocksParts;
            this.processing.uploadFile.blockSize = blockSize;
            this.processing.uploadFile.callback = callback;
            this.processing.uploadFile.timer = new Timer_1.Timer();
        }
        uploadFileStatus(includeCurrent) {
            let bytesProcessed = 0;
            let bytesAll = this.processing.uploadFile.size;
            let blocksSent = this.processing.uploadFile.block;
            if (includeCurrent) {
                blocksSent++;
            }
            for (let i = 0, len = blocksSent; i < len; i++) {
                bytesProcessed += this.processing.uploadFile.blocks[i].size;
            }
            if (EVOSetup_1.EVOSetup.isDebug()) {
                console.log('uploadFileStatus: all ' + bytesAll.toString(), 'now ' + bytesProcessed.toString());
            }
            let delta = this.processing.uploadFile.timer.getMeantime(true);
            let status = {
                kb: (bytesProcessed / 1024),
                kbps: (delta !== 0) ? ((bytesProcessed / delta) / 1024) : 0,
                elapsed: delta,
                progress: Math.floor((bytesProcessed / bytesAll) * 100)
            };
            this.processing.uploadFile.callback(status);
        }
        volumeSize() {
            let processing = this.processing.volumeSize;
            this.checkProcessing(processing);
            let data = [this.commands.volumeSize];
            if (EVOSetup_1.EVOSetup.isDebug()) {
                console.log('volumeSize', data);
            }
            return this.sendCommand(data)
                .then(() => {
                return new Promise((resolve, reject) => {
                    processing.progress = true;
                    processing.resolve = resolve;
                    processing.reject = reject;
                });
            });
        }
        directoryListing(fileType, noCRC) {
            let processing = this.processing.directoryListing;
            this.checkProcessing(processing);
            let data = [this.commands.directoryListing];
            data = data.concat(this.int2Bytes(fileType, 1, false));
            data = data.concat(this.int2Bytes(noCRC, 1, false));
            if (EVOSetup_1.EVOSetup.isDebug()) {
                console.log('directoryListing', data);
            }
            return this.sendCommand(data)
                .then(() => {
                return new Promise((resolve, reject) => {
                    processing.progress = true;
                    processing.resolve = resolve;
                    processing.reject = reject;
                    processing.list = [];
                });
            });
        }
        fileInfo(fileType, name) {
            let processing = this.processing.fileInfo;
            this.checkProcessing(processing);
            let data = [this.commands.fileInfo];
            data = data.concat(this.int2Bytes(fileType, 1, false));
            for (var i = 0; i < 8; i++) {
                if (i > (name.length - 1)) {
                    data.push(0);
                    continue;
                }
                data.push(name.charCodeAt(i));
            }
            if (EVOSetup_1.EVOSetup.isDebug()) {
                console.log('fileInfo', data);
            }
            return this.sendCommand(data).then(() => {
                let promiseFn = function (resolve, reject) {
                    processing.progress = true;
                    processing.resolve = resolve;
                    processing.reject = reject;
                };
                return new Promise(promiseFn);
            });
        }
        deleteFile(fileType, name) {
            let processing = this.processing.deleteFile;
            this.checkProcessing(processing);
            let data = [this.commands.deleteFile];
            data = data.concat(this.int2Bytes(fileType, 1, false));
            for (var i = 0; i < 8; i++) {
                if (i > (name.length - 1)) {
                    data.push(0);
                    continue;
                }
                data.push(name.charCodeAt(i));
            }
            if (EVOSetup_1.EVOSetup.isDebug()) {
                console.log('deleteFile', data);
            }
            return this.sendCommand(data).then(() => {
                let promiseFn = function (resolve, reject) {
                    processing.progress = true;
                    processing.resolve = resolve;
                    processing.reject = reject;
                };
                return new Promise(promiseFn);
            });
        }
        uploadFile(fileType, name, fileData, callbackProgress) {
            let processing = this.processing.uploadFile;
            this.checkProcessing(processing);
            this.uploadDataPrepare(fileData, callbackProgress);
            let data = [this.commands.uploadFile, fileType];
            for (let i = 0; i < 8; i++) {
                if (i > (name.length - 1)) {
                    data.push(0);
                }
                else {
                    data.push(name.charCodeAt(i));
                }
            }
            let crc32Value = this.CRC32(fileData);
            let crcArray = this.int2Bytes(crc32Value, 4, false);
            for (let i = 0, len = crcArray.length; i < len; i++) {
                data.push(crcArray[i]);
            }
            let sizeArray = this.int2Bytes(fileData.length, 4, false);
            for (let i = 0, len = sizeArray.length; i < len; i++) {
                data.push(sizeArray[i]);
            }
            data.push(this.config.blockPackets);
            processing.timer.start();
            this.uploadFileStatus(false);
            if (EVOSetup_1.EVOSetup.isDebug()) {
                console.log('uploadFile', this.arrayToHex(data));
            }
            return this.sendCommand(data).then(() => {
                let promiseFn = function (resolve, reject) {
                    processing.progress = true;
                    processing.errors = 0;
                    processing.resolve = resolve;
                    processing.reject = reject;
                };
                return new Promise(promiseFn);
            });
        }
        uploadFileBlock(data) {
            let processing = this.processing.uploadFile;
            let dataBlock = [this.commands.uploadFileBlock];
            if (data.length === 6) {
                processing.block = this.bytes2IntLE(data, 2, 5);
            }
            let blocks = this.int2Bytes(processing.block, 4, false);
            for (let i in blocks) {
                dataBlock.push(blocks[i]);
            }
            dataBlock.push(processing.blocks[processing.block].packets.length);
            let crc32 = this.int2Bytes(processing.blocks[processing.block].crc32, 4, false);
            for (let i in crc32) {
                dataBlock.push(crc32[i]);
            }
            return this.sendCommand(dataBlock);
        }
        uploadFilePackets() {
            return __awaiter(this, void 0, void 0, function* () {
                let processing = this.processing.uploadFile;
                // pause between blocks (helps Noble on MacOS)
                yield Timer_1.pausePromise(2);
                let block = processing.blocks[processing.block];
                for (let p in block.packets) {
                    yield this.sendCommandData(block.packets[p]);
                    // pause between packets (helps WebBLE on MacOS) - delay proportional to number of errors
                    yield Timer_1.pausePromise(processing.errors);
                }
            });
        }
        notificationProcessEvent(buffer) {
            const data = this.normalizeResponseData(buffer);
            this.notificationProcess(data);
        }
        notificationProcess(data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (EVOSetup_1.EVOSetup.isDebug()) {
                    console.log('notificationProcess', String.fromCharCode(data[0]), this.arrayToHex(data));
                }
                switch (data[0]) {
                    case this.notifications['volumeSize']:
                        this.notificationVolumeSize(data);
                        break;
                    case this.notifications['directoryListing']:
                        this.notificationDirectoryListing(data);
                        break;
                    case this.notifications['fileInfo']:
                        this.notificationFileInfo(data);
                        break;
                    case this.notifications['deleteFile']:
                        this.notificationDeleteFile(data);
                        break;
                    case this.notifications['uploadFile']:
                        this.notificationUploadFile(data);
                        break;
                    case this.notifications['uploadFileBlock']:
                        yield this.notificationUploadFileBlock(data);
                        break;
                    case this.notifications['uploadFilePacket']:
                        this.notificationUploadFilePacket(data);
                        break;
                    case this.notifications['uploadFileEndBlock']:
                        this.notificationUploadFileEndBlock(data);
                        break;
                }
            });
        }
        notificationVolumeSize(data) {
            let code = this.bytes2IntLE(data, 1, 1);
            let full = this.bytes2IntLE(data, 2, 5);
            let free = this.bytes2IntLE(data, 6, 9);
            let result = {
                code: code,
                size: full,
                freeSize: free
            };
            if (false === this.processing.volumeSize.progress)
                return;
            if (code > 0) {
                this.processing.volumeSize.reject && this.processing.volumeSize.reject(code);
            }
            else {
                this.processing.volumeSize.resolve && this.processing.volumeSize.resolve(result);
            }
            this.processing.volumeSize.progress = false;
        }
        notificationDirectoryListing(data) {
            let processing = this.processing.directoryListing;
            let code = this.bytes2IntLE(data, 1, 1);
            if (false === processing.progress)
                return;
            if (code !== 0 && code !== 12) {
                this.processing.volumeSize.progress = false;
                processing.reject && processing.reject(code);
            }
            if (code === 0) {
                let filename = '';
                for (let i = 2; i < 10; i++) {
                    filename += String.fromCharCode(data[i]);
                }
                let value = {
                    code: code,
                    fileName: filename,
                    fileSize: this.bytes2IntLE(data, 10, 13),
                    fileCRC: this.bytes2IntLE(data, 14, 17)
                };
                processing.list.push(value);
                return;
            }
            let list = JSON.parse(JSON.stringify(processing.list));
            list = this.directoryListSort(list);
            let result = {
                code: code,
                list: list
            };
            processing.progress = false;
            processing.resolve && processing.resolve(result);
        }
        notificationFileInfo(data) {
            let processing = this.processing.fileInfo;
            let code = this.bytes2IntLE(data, 1, 1);
            let fileCRC = this.bytes2IntLE(data, 2, 5);
            let result = {
                code: code,
                fileCRC: fileCRC
            };
            if (false === processing.progress)
                return;
            processing.progress = false;
            if (code > 0) {
                processing.reject && processing.reject(code);
            }
            else {
                processing.resolve && processing.resolve(result);
            }
        }
        notificationDeleteFile(data) {
            let processing = this.processing.deleteFile;
            let code = this.bytes2IntLE(data, 1, 1);
            let result = code;
            processing.progress = false;
            if (code > 0) {
                processing.reject && processing.reject(code);
            }
            else {
                processing.resolve && processing.resolve(result);
            }
        }
        notificationUploadFile(data) {
            return __awaiter(this, void 0, void 0, function* () {
                let processing = this.processing.uploadFile;
                if (false === processing.progress || data.length != 6) {
                    processing.progress = false;
                    processing.reject && processing.reject(-1);
                    return;
                }
                let code = this.bytes2IntLE(data, 1, 1);
                if (code != 0) {
                    processing.reject && processing.reject(code);
                    return;
                }
                yield this.uploadFileBlock(data);
            });
        }
        notificationUploadFileBlock(data) {
            return __awaiter(this, void 0, void 0, function* () {
                let processing = this.processing.uploadFile;
                if (false === processing.progress || data.length != 2) {
                    processing.progress = false;
                    processing.reject && processing.reject(-1);
                    return;
                }
                let code = this.bytes2IntLE(data, 1, 1);
                if (code != 0) {
                    processing.progress = false;
                    processing.reject && processing.reject(code);
                    return;
                }
                this.uploadFileStatus(false);
                yield this.uploadFilePackets();
            });
        }
        notificationUploadFilePacket(data) {
            let processing = this.processing.uploadFile;
            if (false === processing.progress || data.length != 2) {
                processing.progress = false;
                processing.reject && processing.reject(-1);
                return;
            }
            let code = this.bytes2IntLE(data, 1, 1);
            if (([0, 2, 10].indexOf(code) < 0) || (processing.errors >= this.MAX_ACCEPTABLE_ERRORS)) {
                processing.progress = false;
                processing.reject && processing.reject(code);
                return;
            }
            if (code === 0) {
                if (processing.blocks.length > (processing.block + 1)) {
                    // move to the next block
                    processing.block++;
                }
            }
            else {
                processing.errors++;
                console.warn('Error count', processing.errors);
            }
            this.uploadFileBlock([]);
        }
        notificationUploadFileEndBlock(data) {
            let processing = this.processing.uploadFile;
            if (false === processing.progress || data.length != 2) {
                processing.progress = false;
                processing.reject && processing.reject(-1);
                return;
            }
            processing.progress = false;
            let code = this.bytes2IntLE(data, 1, 1);
            if (code != 0) {
                processing.reject && processing.reject(code);
                return;
            }
            this.uploadFileStatus(true);
            processing.resolve && processing.resolve('upload success');
        }
        directoryListSort(directoryList) {
            if (directoryList.length < 1) {
                return directoryList;
            }
            var reA = /[^a-zA-Z]/g;
            var reN = /[^0-9]/g;
            directoryList.sort(function (a, b) {
                var aA = a.fileName.replace(reA, "");
                var bA = b.fileName.replace(reA, "");
                if (aA === bA) {
                    var aN = parseInt(a.fileName.replace(reN, ""), 10);
                    var bN = parseInt(b.fileName.replace(reN, ""), 10);
                    return aN === bN ? 0 : aN > bN ? 1 : -1;
                }
                else {
                    return aA > bA ? 1 : -1;
                }
            });
            return directoryList;
        }
        CRC32(data) {
            let crc = -1;
            for (let i = 0, iTop = data.length; i < iTop; i++) {
                crc = (crc >>> 8) ^ this.crc32Table[(crc ^ data[i]) & 0xFF];
            }
            return (crc ^ (-1)) >>> 0;
        }
        arrayToHex(input) {
            var output = [];
            for (var i = 0; i < input.length; i++) {
                output[i] = (input[i] > 0) ? '0x' + input[i].toString(16).toUpperCase() : '0';
            }
            return '[ ' + output.join(', ') + ' ]';
        }
        sendCommand(data) {
            if (EVOSetup_1.EVOSetup.isDebug()) {
                console.log('sendCommandFaltas', String.fromCharCode(data[0]), this.arrayToHex(data));
            }
            const characteristic = EVOSetup_1.OzobotBLEServices.faltas.characteristics.command.id;
            return this.device.send(characteristic, data);
        }
        sendCommandData(data) {
            if (EVOSetup_1.EVOSetup.isDebug()) {
                console.log('sendCommandFaltas fileData', this.arrayToHex(data));
            }
            const characteristic = EVOSetup_1.OzobotBLEServices.faltas.characteristics.fileData.id;
            return this.device.send(characteristic, data);
        }
        generateCrcTable() {
            const crcIeeeGeneratorPolynomial = 0xedb88320;
            let crc32Table = new Uint32Array(256);
            for (let n = 0; n < 256; n++) {
                let c = n;
                for (let k = 0; k < 8; k++) {
                    c = ((c & 1) === 1)
                        ? crcIeeeGeneratorPolynomial ^ (c >>> 1)
                        : c >>> 1;
                }
                crc32Table[n] = c;
            }
            return crc32Table;
        }
    }
    exports.EVOFaltas = EVOFaltas;
    });

    unwrapExports(EVOFaltas_1);
    var EVOFaltas_2 = EVOFaltas_1.EVOFaltas;

    var EVO = createCommonjsModule(function (module, exports) {
    var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    Object.defineProperty(exports, "__esModule", { value: true });





    class Evo {
        constructor(device) {
            this.subscribed_ = {
                commands: false,
                faltas: false,
            };
            this.commonCharacteristic = {
                batteryLevel: EVOSetup_1.OzobotBLEServices.batteryService.characteristics.batteryLevel.id,
                /** hw version */
                hardwareRevision: EVOSetup_1.OzobotBLEServices.deviceInformation.characteristics.hardwareRevision.id,
                /** bootloader version */
                firmwareRevision: EVOSetup_1.OzobotBLEServices.deviceInformation.characteristics.firmwareRevision.id,
                /** firmware version */
                softwareRevision: EVOSetup_1.OzobotBLEServices.deviceInformation.characteristics.softwareRevision.id,
                /** Evollve Inc. */
                manufacturerName: EVOSetup_1.OzobotBLEServices.deviceInformation.characteristics.manufacturerName.id,
            };
            this.device = device;
            this.commands = new EVOCommands_1.EVOCommands();
            this.commandsNotifications = new EVOCommandsNotifications_1.EVOCommandsNotifications();
            this.faltas = new EVOFaltas_1.EVOFaltas(this.device);
        }
        getDeviceId() {
            return this.device.getDeviceId();
        }
        addDisconnectListener(callback) {
            this.device.addDisconnectListener(callback);
        }
        // BSIEVER: Added
        removeDisconnectListener(callback) {
            this.device.removeDisconnectListener(callback);
        }        /**
         * General subscribe function which also starts notifications on the characteristics.
         */
        subscribe() {
            return __awaiter(this, void 0, void 0, function* () {
                const subscribeCommandProcess = this.commandsNotifications.notificationProcess.bind(this.commandsNotifications);
                const subscribeFaltasProcess = this.faltas.notificationProcessEvent.bind(this.faltas);
                if (!this.subscribed_.commands) {
                    try {
                        const commandsCharacteristic = this.commands.getCharacteristicCommon();
                        const result = yield this.device.subscribe(commandsCharacteristic, subscribeCommandProcess);
                        this.subscribed_.commands = true;
                        if (EVOSetup_1.EVOSetup.isDebug()) {
                            console.log('subscribe ok', result);
                        }
                    }
                    catch (error) {
                        console.error('subscribe err', error);
                    }
                }
                if (!this.subscribed_.faltas) {
                    try {
                        const faltasCharacteristic = EVOSetup_1.OzobotBLEServices.faltas.characteristics.command.id;
                        const result = yield this.device.subscribe(faltasCharacteristic, subscribeFaltasProcess);
                        this.subscribed_.faltas = true;
                        if (EVOSetup_1.EVOSetup.isDebug()) {
                            console.log('subscribe faltas ok', result);
                        }
                    }
                    catch (error) {
                        console.error('subscribe faltas err', error);
                    }
                }
            });
        }
        sendCommandCommon(data) {
            if (EVOSetup_1.EVOSetup.isDebug()) {
                console.log('sendCommandCommon', data.map((v, k) => {
                    return (k === 0) ? '0x' + v.toString(16) : v;
                }));
            }
            let characteristic = this.commands.getCharacteristicCommon();
            return this.device.send(characteristic, data);
        }
        sendCommandMove(data) {
            if (EVOSetup_1.EVOSetup.isDebug()) {
                console.log('sendCommandMove', data);
            }
            let characteristic = this.commands.getCharacteristicMove();
            return this.device.send(characteristic, data);
        }
        subscribeCommand(notification, callback) {
            return this.commandsNotifications.subscribe(notification, callback);
        }
        /* Commands Common and Move */
        moveWheels(leftMove, rightMove, expire) {
            let data = this.commands.moveWheels(leftMove, rightMove, expire);
            return this.sendCommandMove(data);
        }
        moveForwardBackward(distance, speed) {
            let data = this.commands.moveForwardBackward(distance, speed);
            return this.sendCommandMove(data);
        }
        rotate(degrees, speed) {
            let data = this.commands.rotate(degrees, speed);
            return this.sendCommandMove(data);
        }
        circle(radius, degrees, speed) {
            let data = this.commands.circle(radius, degrees, speed);
            return this.sendCommandMove(data);
        }
        setLED(bits, red, green, blue) {
            let data = this.commands.setLED(bits, red, green, blue);
            return this.sendCommandCommon(data);
        }
        playFile(fileType, name, abort) {
            let data = this.commands.playFile(fileType, name, abort ? 1 : 0);
            return this.sendCommandCommon(data);
        }
        // Added by BSIEVER
        stopFile(fileType, flush) {
            let data = this.commands.stopFile(fileType, flush);
            return this.sendCommandCommon(data);
        }
        toggleLineFollowing(toggle) {
            let data = this.commands.toggleLineFollowing(toggle);
            return this.sendCommandCommon(data);
        }
        setColorCode(colorCode) {
            let data = this.commands.setColorCode(colorCode);
            return this.sendCommandCommon(data);
        }
        calibrate(type) {
            let data = this.commands.calibrate(type);
            return this.sendCommandCommon(data);
        }
        turnEVOOff() {
            let data = this.commands.turnEVOOff();
            return this.sendCommandCommon(data);
        }
        updateFirmware() {
            let data = this.commands.updateFirmware();
            return this.sendCommandCommon(data);
        }
        requestSummary(type) {
            let data = this.commands.requestSummary(type);
            return this.sendCommandCommon(data);
        }
        generateTone(tone, time, loudness) {
            let data = this.commands.generateTone(tone, time, loudness);
            return this.sendCommandCommon(data);
        }
        stopFile(fileType, flush) {
            let data = this.commands.stopFile(fileType, flush ? 1 : 0);
            return this.sendCommandCommon(data);
        }
        requestFileState(fileType) {
            let data = this.commands.requestFileState(fileType);
            return this.sendCommandCommon(data);
        }
        setLineFollowingSpeed(speed) {
            let data = this.commands.setLineFollowingSpeed(speed);
            return this.sendCommandCommon(data);
        }
        toggleIgnoreColorCodes(ignoreColorCodes) {
            let data = this.commands.toggleIgnoreColorCodes(ignoreColorCodes);
            return this.sendCommandCommon(data);
        }
        setRandomSeed(seed) {
            let data = this.commands.setRandomSeed(seed);
            return this.sendCommandCommon(data);
        }
        getName() {
            return this.device.getDeviceName();
        }
        setName(name) {
            let data = this.commands.setEVOName(name);
            return this.sendCommandCommon(data);
        }
        setObstacleNotifications(leftFront, rightFront, leftRear, rightRear, period) {
            let data = this.commands.setObstacleNotifications(leftFront, rightFront, leftRear, rightRear, period);
            return this.sendCommandCommon(data);
        }
        /**
         * Set the period between relative position notifications.
         *
         * @param periodMs The desired period in milli-seconds. Valid values are 1 ms
         *   to 65535 ms. 0 is reserved for disabling. (Defaults to 100ms.)
         * @param disable Whether to disable the notifications. (Defaults to false.)
         */
        setRelativePositionNotifications(periodMs = 100, disable = false) {
            if (disable) {
                periodMs = 0;
            }
            let data = this.commands.setRelativePositionNotificationPeriod(periodMs);
            return this.sendCommandCommon(data);
        }
        setWanderSettings(enabled, time, radius, boundary) {
            let data = this.commands.setWanderSettings(enabled, time, radius, boundary);
            return this.sendCommandCommon(data);
        }
        setIdleSettings(enabled, time) {
            let data = this.commands.setIdleSettings(enabled, time);
            return this.sendCommandCommon(data);
        }
        setAutoOffTimeSettings(time) {
            let data = this.commands.setAutoOffTimeSettings(time);
            return this.sendCommandCommon(data);
        }
        setMovementNotifications(notification) {
            let data = this.commands.setMovementNotifications(notification);
            return this.sendCommandCommon(data);
        }
        setMotorPower(leftMotor, rightMotor, expire) {
            let data = this.commands.setMotorPower(leftMotor, rightMotor, expire);
            return this.sendCommandMove(data);
        }
        toggleChildAdultAccount(accountType) {
            let data = this.commands.toggleChildAdultAccount(accountType);
            return this.sendCommandCommon(data);
        }
        toggleSensorLogging(logging) {
            let data = this.commands.toggleSensorLogging(logging);
            return this.sendCommandCommon(data);
        }
        setLEDsMaxBrightness(brightness) {
            let data = this.commands.setLEDsMaxBrightness(brightness);
            return this.sendCommandCommon(data);
        }
        setAudioVolume(volume) {
            let data = this.commands.setAudioVolume(volume);
            return this.sendCommandCommon(data);
        }
        toggleClassroomBehavior(behavior) {
            let data = this.commands.toggleClassroomBehavior(behavior);
            return this.sendCommandCommon(data);
        }
        setSetting(kind, value) {
            let data = this.commands.setSetting(kind, value);
            return this.sendCommandCommon(data);
        }
        requestCallibration() {
            let data = this.commands.requestCallibration();
            return this.sendCommandCommon(data);
        }
        /* Faltas */
        volumeSize() {
            return this.faltas.volumeSize();
        }
        directoryListing(fileType, noCRC) {
            return this.faltas.directoryListing(fileType, noCRC ? 1 : 0);
        }
        fileInfo(fileType, name) {
            return this.faltas.fileInfo(fileType, name);
        }
        deleteFile(fileType, name) {
            return this.faltas.deleteFile(fileType, name);
        }
        uploadFile(fileType, name, fileData, callbackProgress) {
            return this.faltas.uploadFile(fileType, name, fileData, callbackProgress);
        }
        /**
         * @return Battery level in % (0..100).
         */
        batteryLevel() {
            return __awaiter(this, void 0, void 0, function* () {
                const batteryLevel = yield this.getValue(Notifications.GetValueIdentifier.RemainingBattery, 2000);
                if (batteryLevel.kind == Notifications.GetValueIdentifier.RemainingBattery) {
                    return Math.min(batteryLevel.value, 100);
                }
                throw new Error('Battery level is not accessible');
            });
        }
        hardwareVersion() {
            return __awaiter(this, void 0, void 0, function* () {
                const buffer = yield this.device.read(this.commonCharacteristic.hardwareRevision);
                const data = new DataView(buffer);
                const COLOR_NAMES = ['white', 'black'];
                const color = data.getUint8(16);
                return {
                    color: color,
                    colorName: COLOR_NAMES[color],
                };
            });
        }
        bootloaderVersion() {
            return __awaiter(this, void 0, void 0, function* () {
                const buffer = yield this.device.read(this.commonCharacteristic.firmwareRevision);
                const data = new Uint8Array(buffer);
                return String.fromCharCode(...data);
            });
        }
        firmwareVersion() {
            return __awaiter(this, void 0, void 0, function* () {
                const buffer = yield this.device.read(this.commonCharacteristic.softwareRevision);
                const data = new DataView(buffer);
                // the first bit distinguishes between old and new format (pre/post 1.11)
                const oldFormat = !(data.getUint8(0) & 0b10000000);
                let major = 0;
                let minor = 0;
                if (oldFormat) {
                    const versionPart = new Uint8Array(buffer.slice(0, 4));
                    const versionStr = String.fromCharCode(...versionPart);
                    major = parseInt(versionStr.slice(0, 2));
                    minor = parseInt(versionStr.slice(2, 4));
                }
                else {
                    // new format
                    major = data.getUint8(0) & 0x7f;
                    minor = data.getUint8(1);
                }
                return major.toString() + '.' + minor.toString();
            });
        }
        manufacturerName() {
            return __awaiter(this, void 0, void 0, function* () {
                const buffer = yield this.device.read(this.commonCharacteristic.manufacturerName);
                const data = new Uint8Array(buffer);
                return String.fromCharCode(...data);
            });
        }
        getUnavailableCharacteristics() {
            return this.device.getUnavailableCharacteristics();
        }
        /**
         * Get a setting value from Ozobot based on the given value identifier. This call
         * requests the value and waits for the specific response to arrive.
         *
         * @param kind Value identifier (number).
         * @param timeoutMs Time in ms for how long to wait for a reply. 0 means no
         *   deadline, so it would wait indefinitely. (Defaults to 0.)
         */
        getSetting(kind, timeoutMs = 0) {
            return __awaiter(this, void 0, void 0, function* () {
                const responsePromise = new Promise((resolve, reject) => {
                    let timeoutId = 0;
                    const unsubscribeFn = this.commandsNotifications
                        .subscribe('getSettingResponse', (response) => {
                        if (response.kind !== kind) {
                            // ignore other `getValue` reponses
                            return;
                        }
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                        unsubscribeFn();
                        resolve(response);
                    })
                        .unsubscribe;
                    if (timeoutMs > 0) {
                        timeoutId = window.setTimeout(() => {
                            unsubscribeFn();
                            reject(new Error('timeout'));
                        }, timeoutMs);
                    }
                });
                // request
                const requestData = this.commands.getSettingRequest(kind);
                yield this.sendCommandCommon(requestData);
                // response
                const response = yield responsePromise;
                return response;
            });
        }
        /**
         * Get a value from Ozobot based on the given value identifier. This call
         * requests the value and waits for the specific response to arrive.
         *
         * @param kind Value identifier (number).
         * @param timeoutMs Time in ms for how long to wait for a reply. 0 means no
         *   deadline, so it would wait indefinitely. (Defaults to 0.)
         */
        getValue(kind, timeoutMs = 0) {
            return __awaiter(this, void 0, void 0, function* () {
                const responsePromise = new Promise((resolve, reject) => {
                    let timeoutId = 0;
                    const unsubscribeFn = this.commandsNotifications
                        .subscribe('getValueResponse', (response) => {
                        if (response.kind !== kind) {
                            // ignore other `getValue` reponses
                            return;
                        }
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                        unsubscribeFn();
                        resolve(response);
                    })
                        .unsubscribe;
                    if (timeoutMs > 0) {
                        timeoutId = window.setTimeout(() => {
                            unsubscribeFn();
                            reject(new Error('timeout'));
                        }, timeoutMs);
                    }
                });
                // request
                const requestData = this.commands.getValueRequest(kind);
                yield this.sendCommandCommon(requestData);
                // response
                const response = yield responsePromise;
                return response;
            });
        }
        /**
         * Request the latest value of one particular usage statistic.
         *
         * @param kind Statistics identifier (number).
         * @param timeoutMs Time in ms for how long to wait for a reply. 0 means no
         *   deadline, so it would wait indefinitely. (Defaults to 0.)
         * @return The value of the statistic as uint32_t number.
         */
        getUsageStatistic(kind, timeoutMs = 0) {
            return __awaiter(this, void 0, void 0, function* () {
                const responsePromise = new Promise((resolve, reject) => {
                    let timeoutId = 0;
                    const unsubscribeFn = this.commandsNotifications
                        .subscribe('summary', (response) => {
                        if (response.type !== kind) {
                            // ignore other statistics
                            return;
                        }
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                        unsubscribeFn();
                        resolve(response.value);
                    })
                        .unsubscribe;
                    if (timeoutMs > 0) {
                        timeoutId = window.setTimeout(() => {
                            unsubscribeFn();
                            reject(new Error('timeout'));
                        }, timeoutMs);
                    }
                });
                // request
                yield this.requestSummary(kind);
                // response
                const response = yield responsePromise;
                return response;
            });
        }
    }
    exports.Evo = Evo;
    });

    unwrapExports(EVO);
    var EVO_1 = EVO.Evo;

    var lib = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });

    exports.Evo = EVO.Evo;

    exports.EVOSetup = EVOSetup_1.EVOSetup;
    });

    unwrapExports(lib);
    var lib_1 = lib.Evo;
    var lib_2 = lib.EVOSetup;

    class BLEDeviceWeb {
        constructor(peripheral, services) {
            /** The max allowed number of queued packets waiting to be sent. */
            this.WRITE_BUFFER_MAX_LENGTH = 1000;
            this.writeBuffer = [];
            this.writeBusy = false;
            /**
             * Write speed limiting on writes from buffer (when client is not using await).
             * The value could be 0 to use only awaiting on `writeValue`, but on some
             * computers this does not work sufficiently. Rate limiting to 100 Hz should
             * be safe and fast enough for sending movement and led commands (will work
             * just fine for everything except FALTAS).
             */
            this.WRITE_BUFFER_SEND_DELAY_MS = 10;
            this.characteristics = {};
            this.unavailableCharacteristics = {};
            this.peripheral = peripheral;
            this.serviceConfig = services;
        }
        connect() {
            return __awaiter(this, void 0, void 0, function* () {
                // connect to GATT Server
                const server = yield this.peripheral.gatt.connect();
                for (let serviceName in this.serviceConfig) {
                    const service = this.serviceConfig[serviceName];
                    let connectedService;
                    try {
                        connectedService = yield server.getPrimaryService(service.id);
                    }
                    catch (error) {
                        console.error(`Connection failed to service '${service.name}' (${service.id}) with error:`, error);
                        if (service.required) {
                            throw error; // rethrow the same error
                        }
                        // save for later inspection
                        for (let characteristicName in service.characteristics) {
                            this.unavailableCharacteristics[characteristicName] =
                                service.characteristics[characteristicName].id;
                        }
                        continue;
                    }
                    if (lib_2.isDebug()) {
                        console.log(`Connected to service '${service.name}' (${service.id}).`);
                    }
                    for (let characteristicName in service.characteristics) {
                        const characterestic = service.characteristics[characteristicName];
                        try {
                            const connectedCharacteristic = yield connectedService.getCharacteristic(characterestic.id);
                            this.characteristics[characterestic.id] = connectedCharacteristic;
                            if (lib_2.isDebug()) {
                                console.log(`Connected to characteristic '${characterestic.name}' (${characterestic.id}).`);
                            }
                        }
                        catch (error) {
                            console.error(`Connection failed to characteristic '${characterestic.name}' (${characterestic.id}) on service '${service.name}' (${service.id}) with error:`, error);
                            if (characterestic.required) {
                                throw error; // rethrow the same error
                            }
                            // save for later inspection
                            this.unavailableCharacteristics[characterestic.name] = characterestic.id;
                        }
                    }
                }
                if (Object.keys(this.characteristics).length === 0) {
                    console.error('Unable to connect! No services found on this device.');
                    throw new Error('Unable to connect! No services found on this device.');
                }
                const evo = new lib_1(this);
                yield evo.subscribe();
                return evo;
            });
        }
        disconnect() {
            if (this.peripheral && this.peripheral.gatt && this.peripheral.gatt.connected) {
                this.peripheral.gatt.disconnect();
            }
        }
        addDisconnectListener(callback) {
            if (this.peripheral === null) {
                return;
            }
            this.peripheral.addEventListener('gattserverdisconnected', callback);
        }
        // BSIEVER: Added
        removeDisconnectListener(callback) {
            if (this.peripheral === null) {
                return;
            }
            this.peripheral.removeEventListener('gattserverdisconnected', callback);
        }
        getDeviceId() {
            return this.peripheral
                ? this.peripheral.id
                : '';
        }
        getDeviceName() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.peripheral
                    ? this.peripheral.name || ''
                    : '';
            });
        }
        subscribe(characteristic, cb) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.characteristics.hasOwnProperty(characteristic)) {
                    throw new Error(`Unable to subscribe to characteristic '${characteristic}' - not available!`);
                }
                yield this.characteristics[characteristic].startNotifications();
                if (lib_2.isDebug()) {
                    console.log(`> Notifications started on '${characteristic}'`);
                }
                this.characteristics[characteristic].addEventListener('characteristicvaluechanged', (event) => {
                    const data = this.unpackEventToData(event);
                    if (lib_2.isDebug()) {
                        console.log(`COMMUNICATION: Notification from characteristic '${characteristic}' data:`, this.arrayToHex(this.bufferToArray(data)));
                    }
                    cb(data);
                });
                return 'subscribe success';
            });
        }
        unsubscribe(characteristic, cb) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.characteristics.hasOwnProperty(characteristic)) {
                    throw new Error(`Unable to unsubscribe from characteristic '${characteristic}' - not available!`);
                }
                // TODO: the callback function will never match as it is added as a lambda
                this.characteristics[characteristic].removeEventListener('characteristicvaluechanged', cb);
                // TODO: if there would be more listeners, unsubscribing from one would
                // make the second unusable (but this feature is not used yet)
                yield this.characteristics[characteristic].stopNotifications();
                if (lib_2.isDebug()) {
                    console.log(`> Notifications stopped on '${characteristic}'`);
                }
                return 'unsubscribe success';
            });
        }
        send(characteristic, data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.peripheral.gatt.connected) {
                    throw new Error(`Unable to send! Device not connected!`);
                }
                if (!this.characteristics.hasOwnProperty(characteristic)) {
                    throw new Error(`Unable to send! Characteristic '${characteristic}' not available!`);
                }
                if (this.writeBusy) {
                    if (this.writeBuffer.length < this.WRITE_BUFFER_MAX_LENGTH) {
                        if (lib_2.isDebug()) {
                            console.log(`Queued write to characteristic '${characteristic}' data:`, this.arrayToHex(data));
                        }
                        // queue the request into the write buffer
                        return new Promise((resolve, reject) => {
                            this.writeBuffer.push({ characteristic, data, resolve, reject });
                        });
                    }
                    else {
                        throw new Error(`Unable to send! The output buffer is full! Please wait for write completion.`);
                    }
                }
                if (lib_2.isDebug()) {
                    console.log(`COMMUNICATION: Send to characteristic '${characteristic}' data:`, this.arrayToHex(data));
                }
                try {
                    this.writeBusy = true;
                    yield this.characteristics[characteristic].writeValue(Uint8Array.from(data).buffer);
                }
                finally {
                    this.writeBusy = false;
                    const next = this.writeBuffer.shift();
                    if (next !== undefined) {
                        // This timeout is essential, but can cause unordering if another write
                        // gets executed before this scheduled one.
                        setTimeout(() => {
                            this.send(next.characteristic, next.data)
                                .then(next.resolve)
                                .catch(next.reject);
                        }, this.WRITE_BUFFER_SEND_DELAY_MS);
                    }
                }
                return 'send success';
            });
        }
        read(characteristic) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.characteristics.hasOwnProperty(characteristic)) {
                    throw new Error(`Unable to read! Characteristic '${characteristic}' not available!`);
                }
                if (lib_2.isDebug()) {
                    console.log(`Read from characteristic '${characteristic}' initiated.`);
                }
                const data = yield this.characteristics[characteristic].readValue();
                if (lib_2.isDebug()) {
                    console.log(`COMMUNICATION: Read from characteristic '${characteristic}' data:`, this.arrayToHex(this.bufferToArray(data.buffer)));
                }
                return data.buffer;
            });
        }
        toString() {
            return '[object BLEDeviceWeb]';
        }
        getUnavailableCharacteristics() {
            // return a copy
            return JSON.parse(JSON.stringify(this.unavailableCharacteristics));
        }
        bufferToArray(buffer) {
            const dataView = new DataView(buffer);
            let data = [];
            for (let i = 0; i < dataView.byteLength; i++) {
                data.push(dataView.getUint8(i));
            }
            return data;
        }
        arrayToHex(input) {
            var output = [];
            for (var i = 0; i < input.length; i++) {
                output[i] = (input[i] > 0) ? '0x' + input[i].toString(16).toUpperCase() : '0';
            }
            return '[ ' + output.join(', ') + ' ]';
        }
        unpackEventToData(event) {
            const target = event.target;
            return (target.value)
                ? target.value.buffer
                : new ArrayBuffer(0);
        }
    }

    class OzobotEvoWebBLE {
        constructor() {
        }
        static isBLEAvailable() {
            return !!navigator.bluetooth && !!navigator.bluetooth.requestDevice;
        }
        /**
         * Wrapper over the `navigator.bluetooth.requestDevice()`. Can be used
         * without or with parameters.
         *
         * Example 1:
         * `evo = await OzobotEvoWebBLE.requestDevice();`
         *
         * Example 2:
         * `evo = await OzobotEvoWebBLE.requestDevice([{namePrefix: 'Ozo'}]);`
         *
         * @param filters (optional) Array of BLE requestDevice filters (to use
         *   instead of the "match-all" filter).
         * @param acceptAllDevices (optional) True for using `acceptAllDevices`.
         * @return Promise to be resolved as Evo instance.
         */
        static requestDevice(filters = [], acceptAllDevices = false) {
            return __awaiter(this, void 0, void 0, function* () {
                // NOTE: we could use manufacturerId = 0x03EB but it does not work
                // marked unstable at https://webbluetoothcg.github.io/web-bluetooth/#example-filter-by-manufacturer-service-data
                let options;
                if (acceptAllDevices) {
                    options = {
                        acceptAllDevices: true,
                    };
                }
                else if (filters.length > 0) {
                    options = {
                        filters: filters,
                    };
                }
                else {
                    options = {
                        // namePrefix filters to accept all names
                        filters: lib_2.getFilter(),
                    };
                }
                // lising services to be used is necessary in some cases
                options.optionalServices = lib_2.getServices();
                const device = yield navigator.bluetooth.requestDevice(options);
                const driver = new BLEDeviceWeb(device, lib_2.getCharacteristics());
                return driver.connect();
            });
        }
    }

    exports.OzobotEvoWebBLE = OzobotEvoWebBLE;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
