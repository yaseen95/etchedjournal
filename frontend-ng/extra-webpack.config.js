module.exports = {
    // We exclude openpgp because we include the min.js distribution ourselves
    externals: {
        openpgp: 'openpgp'
    }
};
