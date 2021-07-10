// BSIEVER: Adding constants from protocol.js (files.ozobot.com/evo-update/static/js/protocol.js)
const EvoFileTypes = {
    FIRMWARE: 0x0,
    AUDIO: 0x1,
    BLOCKLY: 0x2,
    LED_ANIMATION: 0x3,
    USER_BLOCKLY: 0x82,
    TONE: 0xFF  // For Tone done playing???
    }
    exports.EvoFileTypes = EvoFileTypes;
    const EvoValueTypes = {
    UUID: 0x00,
    SMART_SKIN: 0x01,
    REMAINING_BATTERY: 0x02,
    SURFACE_COLOR: 0x03,
    UNCLASSIFIED_COLOR: 0x04,
    SURFACE_AND_LINE_PARAMETERS: 0x05,
    POWER_GOOD: 0x06,
    }
    exports.EvoValueTypes = EvoValueTypes;
