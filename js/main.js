/**
 * @author narmiel
 *
 * Загрузка
 */

/**
 * @type {Quest}
 */
Game = null;

/**
 * @type {Player}
 */
GlobalPlayer = null;

/**
 * Files
 */
files = null;

/**
 * 
 */
var mode;

$(function() {
    $('#something_wrong').hide();
    $('#infopanel').show();
    
    $('#additionalstyle').find('style').empty();

    /**
     * Загрузить из хеша
     */
    function loadFromHash() {
        $('#loading').show();
        $('#choose-game').hide();

        if (window.location.hash.length > 0) {
            JSZipUtils.getBinaryContent('quests/' + window.location.hash.substr(1) + '.zip', function(err, data) {
                if(err) {
                    loadFromHashFailed();
                }

                loadZip(data);
            });
        } else {
            loadFromHashFailed();
        }
    }

    /**
     * Попробуем загрузить квест если в хеше что-то есть
     */
    loadFromHash();

    
    function loadZip(data) {
        var zip = new JSZip(data);

        files = {};
        var qst = null;

        for (var key in zip.files) {
            if (!zip.files[key].dir) {
                var file = zip.file(key);
                if (qst == null && file.name.split('.').pop() == 'qst') {
                    qst = file;
                } else if (file.name.split('.').pop() == 'css') {
                    $('#additionalstyle').find('style').append(file.asBinary());
                } else {
                    files[file.name] = URL.createObjectURL(new Blob([(file.asArrayBuffer())], {type: MIME[file.name.split('.').pop()]}));
                }
            }
        }

        if (qst) {
            if (qst.name.lastIndexOf('/') != -1) {
                var dir = qst.name.substring(0, qst.name.lastIndexOf('/') + 1);

                for (var key in files) {
                    var newkey = key.substr(dir.length);
                    files[newkey] = files[key];
                    delete files[key];
                }
            }

            start(win2unicode(qst.asBinary()), qst.name);
        }    
    }
    
    /**
     * 
     */
    function loadFromHashFailed() {
        $.ajax({
            url: 'games.json',
            dataType: "json"
        }).done(function(quests) {
            for (var i = 0; i < quests.length; i++) {
                $('.gamelist').append(
                    '<a href="#" class="list-group-item gamelink" data-game="' + quests[i].folder + '">' +
                    '<div class="pull-right">' +
                    '<span class="text-muted">' + quests[i].author + '</span>' +
                    '</div>' +
                    '<h4 class="list-group-item-heading">' + quests[i].title + '</h4>' +
                    '<p class="list-group-item-text">' + quests[i].description + '</p>' +
                    '</a>'
                );
            }
        });

        $('#loading').hide();
        $('#choose-game').show();
    }

    /**
     * Выбор игры из списка
     */
    $('.gamelist').on('click', '.gamelink', function() {
        window.location.hash = encodeURIComponent($(this).data('game'));
        loadFromHash();

        return false;
    });

    /**
     * Read file when change file-control
     */
    $('#quest').on('change', function(e) {
        files = {};
        var qst = null;
        var reader = new FileReader();
        
        if (e.target.files.length == 1 && e.target.files[0].name.split('.').pop() == 'zip') {
            var zip = e.target.files[0];    
            
            reader.onload = function() {
                mode = $('#urq_mode').val();
                loadZip(reader.result);
            };
            reader.readAsBinaryString(zip, 'CP1251');

            return;
        }

        for (var i = 0; i < e.target.files.length; i++) {
            if (qst == null && e.target.files[i].name.split('.').pop() == 'qst') {
                qst = e.target.files[i];
            } else if (e.target.files[i].name == 'style.css') {
                readStyle(e.target.files[i]);
            } else {
                readFile(e.target.files[i].name, e.target.files[i]);
            }
        }

        if (!qst) {
            return;
        }

        // read file to global variable and start quest
        reader.onload = function() {
            mode = $('#urq_mode').val();
            setTimeout(function() {
                start(reader.result, qst.name);
            }, 200); // todo
        };
        reader.readAsText(qst, 'CP1251');
    });

    /**
     * @param filename
     * @param file
     */
    function readFile(filename, file) {
        var reader = new FileReader();
        reader.onload = function() {
            files[filename] = URL.createObjectURL(new Blob([reader.result], {type: MIME[filename.split('.').pop()]}));
        };

        reader.readAsArrayBuffer(file);
    }

    /**
     * @param file
     */
    function readStyle(file) {
        var style = new FileReader();
        style.onload = function() {
            $('#additionalstyle').find('style').append(style.result);
        };

        style.readAsText(file, 'CP1251');
    }

    /**
     * Запуск
     *
     * @param {String} msg тело квеста
     * @param {String} name имя игры или файла
     */
    function start(msg, name) {
        window.onbeforeunload = function(e) {
            return 'confirm please';
        };
        
        $('#loading').hide();
        $('#infopanel').hide();
        $('#logo').hide();

        Game = new Quest(msg);
        Game.name = name;

        Game.init();

        GlobalPlayer = new Player;
        
        if (mode) GlobalPlayer.setVar('urq_mode', mode);

        GlobalPlayer.Client.crtlInfo = $('#info');
        GlobalPlayer.Client.crtlInput = $('#input');
        GlobalPlayer.Client.crtlButtonField = $('#buttons');
        GlobalPlayer.Client.crtlTextField = $('#textfield');
        GlobalPlayer.Client.crtlInventory = $('#inventory');

        $('#choose-game').hide();
        $('#game').show();

        GlobalPlayer.continue();
    }
});
