module.exports = {
    validateByte(byte) {
        return !(byte >> 8 && (byte << 8) & 255);
    }
};
