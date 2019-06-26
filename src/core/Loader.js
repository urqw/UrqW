import JSZip from "jszip";
import ZipUtils from "jszip-utils";
import Client from "@/core/src/Client";
import {win2unicode, getExt, MIME} from "./src/tools";

/**
 * @constructor
 */
function Loader() {
  /**
   * int mode
   */
  this.mode = 'urqw';

  this.questname = '';
}

/**
 * загрузить из zip файла
 */
Loader.prototype.loadZip = function (zip) {
  var loadedFiles = {};

  return new Promise((resolve, reject) => {
    resolve(JSZip.loadAsync(zip).then((unpackedZip) => {
      return new Promise((resolve, reject) => {

        Promise.all(
          Object.keys(unpackedZip.files).map((fileName) => {
            return new Promise((resolve, reject) => {
              const file = unpackedZip.files[fileName];

              if (['qst', 'css', 'js'].indexOf(getExt(fileName)) >= 0) {
                file.async("binarystring").then((data) => {
                  loadedFiles[fileName] = data;
                  resolve();
                });
              } else {
                file.async("blob").then((blob) => {
                  loadedFiles[fileName] = URL.createObjectURL(blob);
                  resolve();
                });
              }
            });
          })
        ).then(() => {
          resolve(this.composeFiles(loadedFiles))
        });
      });
    }));
  });
};

/**
 * собрать файлы
 */
Loader.prototype.composeFiles = function (files) {

  return new Promise((resolve, reject) => {
    var resources = {};
    var qst = [];

    Object.keys(files).map((fileName) => {
      const file = files[fileName];

      if (getExt(fileName) === "qst") {
        const hasUnderscore =
          fileName.startsWith("_") || fileName.includes("/_");
        if (hasUnderscore) {
          qst.unshift(fileName);
        } else {
          qst.push(fileName);
        }
      } else {
        resources[fileName] = file;
      }
    });

    if (qst.length > 0) {
      var quest = "";

      if (qst[0].lastIndexOf("/") !== -1) {
        var dir = qst[0].substring(
          0,
          qst[0].lastIndexOf("/") + 1
        );

        for (var key in resources) {
          var newkey = key.substr(dir.length);
          resources[newkey] = resources[key];
          delete resources[key];
        }
      }

      qst.forEach(function (fileName) {
        quest += `\r\n${win2unicode(files[fileName])}`;
      });

      resolve(Client.createGame(this.questname, quest, resources, this.mode));
    } else {
      reject();
    }
  });
};

/**
 * загрузить из zip файла
 */
Loader.prototype.loadZipFromLocalFolder = function (
  questname,
  mode = "urqw",
  folder = "quests"
) {
  this.questname = questname;
  this.mode = mode;

  return new Promise((resolve, reject) => {
    ZipUtils.getBinaryContent(`${folder}/${this.questname}.zip`, (err, zip) => {
      resolve(this.loadZip(zip))
    });
  });
};

Loader.prototype.getClient = function () {
};

/**
 * загрузить из файлов
 */
Loader.prototype.loadFiles = function (files, mode) {
  this.questname = files[0].name;
  this.mode = mode;

  if (
    files.length === 1 &&
    getExt(files[0].name) === "zip"
  ) {

    return new Promise((resolve, reject) => {
      var zip = files[0];

      var reader = new FileReader();

      reader.onload = () => {
        resolve(this.loadZip(zip, zip.name))
      };

      reader.readAsBinaryString(zip, "CP1251");
    });
  } else {
    return new Promise((resolve, reject) => {
      var loadedFiles = {};

      Promise.all(
        Array.from(files).map((file) => {
          return new Promise((resolve, reject) => {
            var reader = new FileReader();

            if (['qst', 'css', 'js'].indexOf(getExt(file.name)) >= 0) {
              reader.onload = () => {
                loadedFiles[file.name] = reader.result;
                resolve();
              };
              reader.readAsText(file, 'CP1251');
            } else {
              reader.onload = () => {
                loadedFiles[file.name] = URL.createObjectURL(new Blob([reader.result], {type: MIME[file.name.split('.').pop()]}));
                resolve();
              };
              reader.readAsArrayBuffer(file);
            }
          })
        })
      ).then(() => {
        resolve(this.composeFiles(loadedFiles))
      });
    });
  }
};

export default Loader;
