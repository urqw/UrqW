import JSZip from "jszip";
import ZipUtils from "jszip-utils";
import Tools from "@/engine/src/tools";
import Game from "@/engine/src/Game";


/**
 * @constructor
 */
function Loader() {
    /**
     * int mode
     */
    this.mode = 0;
}

/**
 * загрузить из zip файла
 */
Loader.prototype.loadZip = function() {

};

/**
 * загрузить из zip файла
 */
Loader.prototype.loadZipFromLocalFolder = function(questname, folder = 'quests') {
    return new Promise(function(resolve, reject) {
        ZipUtils.getBinaryContent(`${folder}/${questname}.zip`, function(err, data) {
            JSZip.loadAsync(data).then(function (zip) {
                var files = {};
                var qst = [];

                for (var key in zip.files) {
                    if (!zip.files[key].dir) {
                        var file = zip.file(key);
                        if (file.name.split('.').pop().toLowerCase() == 'qst') {
                            if (file.name.substr(0, 1) == '_' || file.name.indexOf('/_') != -1) {
                                qst.unshift(file);
                            } else {
                                qst.push(file);
                            }
                        } else if (file.name.split('.').pop().toLowerCase() == 'css') {
//                        $('#additionalstyle').find('style').append(file.asBinary());
                        } else if (file.name.split('.').pop().toLowerCase() == 'js') {
//                          eval(win2unicode(file.asBinary())); // todo?
                        } else {
                            file.async("base64")
                                .then(function (data64) {
                                    // console.log("data:image/jpeg;base64," + data64)
                                });

                            // files[file.name] = URL.createObjectURL(new Blob([(file.asArrayBuffer())], {type: MIME[file.name.split('.').pop()]}));
                        }
                    }
                }

                if (qst.length > 0) {
                    var quest = '';

                    if (qst[0].name.lastIndexOf('/') != -1) {
                        var dir = qst[0].name.substring(0, qst[0].name.lastIndexOf('/') + 1);

                        for (var key in files) {
                            var newkey = key.substr(dir.length);
                            files[newkey] = files[key];
                            delete files[key];
                        }

                    }

                    Promise.all(qst.map(qs => qs.async("binarystring"))).then(result => {
                        result.forEach(data => {
                            quest += `\r\n${Tools.win2unicode(data)}`
                        });

                        let GameInstance = new Game(questname);
                        GameInstance.init(quest);

                        resolve(GameInstance);
                    });
                } else {
                    reject()
                }
            });

        });
    });
};

/**
 * рендер
 */
Loader.prototype.getClient = function() {

};

/**
 * рендер
 */
Loader.prototype.loadFiles = function() {
    files = {};
    const qst = [];

    if (e.target.files.length == 1 && e.target.files[0].name.split('.').pop().toLowerCase() == 'zip') {
        var reader = new FileReader();
        var zip = e.target.files[0];

        reader.onload = function() {
            loadZip(reader.result, zip.name);
        };
        reader.readAsBinaryString(zip, 'CP1251');

        return;
    }

    for (var i = 0; i < e.target.files.length; i++) {
        if (e.target.files[i].name.split('.').pop().toLowerCase() == 'qst') {
            qst.push(e.target.files[i]);
        } else if (e.target.files[i].name.toLowerCase() == 'style.css') {
            readStyle(e.target.files[i]);
        } else if (e.target.files[i].name.toLowerCase() == 'script.js') {
            readJs(e.target.files[i]);
        } else {
            readFile(e.target.files[i].name, e.target.files[i]);
        }
    }

    if (qst.length == 0) {
        return;
    }

    var name = qst[0].name;
    quest = [];
    var slices = qst.length;

    while (qst.length > 0) {
        readQst(qst.shift());
    }

    var loadq = setInterval(function() {
        if (slices == quest.length) {
            clearInterval(loadq);
            start(quest.join('\r\n'), name);
        }
    }, 200); // todo
};

export default Loader;
