/**
 * @author narmiel
 */

/**
 * @param {int} value
 */
export function dosColorToHex(value) {
  if (value > 15) {
    value = value % 16;
  }
  switch (value) {
    case 0:
      return "#000000";
    case 1:
      return "#0000AA";
    case 2:
      return "#00AA00";
    case 3:
      return "#00AAAA";
    case 4:
      return "#AA0000";
    case 5:
      return "#AA00AA";
    case 6:
      return "#AA5500";
    case 7:
      return "#AAAAAA";
    case 8:
      return "#555555";
    case 9:
      return "#5555FF";
    case 10:
      return "#55FF55";
    case 11:
      return "#55FFFF";
    case 12:
      return "#FF5555";
    case 13:
      return "#FF55FF";
    case 14:
      return "#FFFF55";
    case 15:
      return "#FFFFFF";
    default:
      return "#000000";
  }
}

export function isFloat(n) {
  return n === Number(n) && n % 1 !== 0;
}

const charmap = unescape(
  "%u0402%u0403%u201A%u0453%u201E%u2026%u2020%u2021%u20AC%u2030%u0409%u2039%u040A%u040C%u040B%u040F" +
    "%u0452%u2018%u2019%u201C%u201D%u2022%u2013%u2014%u0000%u2122%u0459%u203A%u045A%u045C%u045B%u045F" +
    "%u00A0%u040E%u045E%u0408%u00A4%u0490%u00A6%u00A7%u0401%u00A9%u0404%u00AB%u00AC%u00AD%u00AE%u0407" +
    "%u00B0%u00B1%u0406%u0456%u0491%u00B5%u00B6%u00B7%u0451%u2116%u0454%u00BB%u0458%u0405%u0455%u0457"
);

function code2char(code) {
  if (code >= 0xc0 && code <= 0xff) {
    return String.fromCharCode(code - 0xc0 + 0x0410);
  }

  if (code >= 0x80 && code <= 0xbf) {
    return charmap.charAt(code - 0x80);
  }

  return String.fromCharCode(code);
}

export function win2unicode(str) {
  let res = "";

  for (let i = 0; i < str.length; i++) {
    res = res + code2char(str.charCodeAt(i));
  }

  return res;
}

export function getExt(fileName) {
  return fileName
    .split(".")
    .pop()
    .toLowerCase();
}

export const MIME = {
  bmp: "image/bmp",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",

  mid: "audio/midi",
  midi: "audio/midi",
  mp3: "audio/mp3"
};
