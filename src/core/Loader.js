import JSZip from "jszip";
import ZipUtils from "jszip-utils";
import Client from "@/core/src/Client";
import { win2unicode, getExt, MIME } from "./src/tools";

function isTextType(fileName) {
  return ["qst", "css", "js"].includes(getExt(fileName));
}

export default class Loader {
  /**
   * @constructor
   */
  constructor() {
    /**
     * @type {string}
     */
    this.mode = "urqw";

    this.questname = "";
  }

  /**
   * загрузить из zip файла
   * @private
   */
  async _loadZip(zip) {
    const loadedFiles = {};
    const unpackedZip = await JSZip.loadAsync(zip);

    async function handleFile(fileName, file) {
      if (isTextType(fileName)) {
        return await file.async("binarystring");
      } else {
        return URL.createObjectURL(await file.async("blob"));
      }
    }

    for (let [fileName, file] of Object.entries(unpackedZip.files)) {
      loadedFiles[fileName] = await handleFile(fileName, file);
    }

    return this._composeFiles(loadedFiles);
  }

  /**
   * собрать файлы
   * @private
   */
  _composeFiles(files) {
    const resources = {};
    const qst = [];

    for (let [fileName, file] of Object.entries(files)) {
      if (getExt(fileName) === "qst") {
        if (Loader._isInclude(fileName)) {
          // put includes first
          qst.unshift(fileName);
        } else {
          qst.push(fileName);
        }
      } else {
        resources[fileName] = file;
      }
    }

    if (qst.length > 0) {
      let quest = "";

      if (qst[0].lastIndexOf("/") !== -1) {
        const dir = qst[0].substring(0, qst[0].lastIndexOf("/") + 1);

        for (let key in resources) {
          const newKey = key.substr(dir.length);
          resources[newKey] = resources[key];
          delete resources[key];
        }
      }

      qst.forEach(fileName => {
        quest += `\r\n${win2unicode(files[fileName])}`;
      });

      return Client.createGame(this.questname, quest, resources, this.mode);
    } else {
      throw new Error("URQ quest not found");
    }
  }

  /**
   * загрузить из zip файла
   */
  loadZipFromLocalFolder(questname, mode = "urqw", folder = "quests") {
    this.questname = questname;
    this.mode = mode;

    return new Promise((resolve, reject) => {
      ZipUtils.getBinaryContent(
        `${folder}/${this.questname}.zip`,
        (err, zip) => {
          if (err) {
            reject(err);
          } else {
            resolve(this._loadZip(zip));
          }
        }
      );
    });
  }

  getClient() {}

  /**
   * загрузить из файлов
   */
  async loadFiles(files, mode) {
    this.questname = files[0].name;
    this.mode = mode;

    if (files.length === 1 && getExt(files[0].name) === "zip") {
      const zip = files[0];

      return this._loadZip(zip, zip.name);
    } else {
      const loadedFiles = {};

      for (let file of Array.from(files)) {
        if (isTextType(file.name)) {
          loadedFiles[file.name] = await Loader._readFilePromise(file, "text");
        } else {
          const result = await Loader._readFilePromise(file, "arrayBuffer");
          loadedFiles[file.name] = URL.createObjectURL(
            new Blob([result], {
              type: MIME[getExt(file.name)]
            })
          );
        }
      }

      return this._composeFiles(loadedFiles);
    }
  }

  /**
   * @param {string} fileName
   * @return {boolean}
   * @private
   */
  static _isInclude(fileName) {
    return fileName.startsWith("_") || fileName.includes("/_");
  }

  /**
   * @param {Blob} blob
   * @param {string} mode
   * @param {string} [encoding="CP1251"]
   * @return {Promise<BufferSource | Blob | string>}
   * @private
   */
  static _readFilePromise(blob, mode, encoding = "CP1251") {
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
}
