/**
 * @author narmiel
 */


/**
 * @param {int} value
 */
var dosColorToHex = function(value) {
    switch (value) {
        case 0: return '#000000';
        case 1: return '#0000AA';
        case 2: return '#00AA00';
        case 3: return '#00AAAA';
        case 4: return '#AA0000';
        case 5: return '#AA00AA';
        case 6: return '#AA5500';
        case 7: return '#AAAAAA';
        case 8: return '#555555';
        case 9: return '#5555FF';
        case 10: return '#55FF55';
        case 11: return '#55FFFF';
        case 12: return '#FF5555';
        case 13: return '#FF55FF';
        case 14: return '#FFFF55';
        case 15: return '#FFFFFF';
        default: return '#000000';
    }
};

var isFloat =function (n){
    return n === Number(n) && n % 1 !== 0;
};