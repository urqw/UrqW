
/**
 * @param {string} fileName
 * @return {string}
 */
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

/**
 * @param {Blob} blob
 * @param {string} mode
 * @param {string} encoding
 * @return {Promise<BufferSource | Blob | string>}
 * @private
 */
export function readFilePromise(blob, mode, encoding = "utf8") {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);

    if (mode === "binaryString") {
      reader.readAsBinaryString(blob);
    } else if (mode === "arrayBuffer") {
      reader.readAsArrayBuffer(blob);
    } else if (mode === "text") {
      reader.readAsText(blob, encoding);
    }
  });
}
