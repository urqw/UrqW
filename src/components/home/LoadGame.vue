<template>
<div class="content">
  <h5 class="title is-5">Загрузите игру (если есть дополнительные файлы, необходимо выбрать ВСЕ файлы игры):</h5>

  <div class="file has-name">
    <label class="file-label">
      <input class="file-input" type="file" name="resume">
      <span class="file-cta">
      <span class="file-icon">
         <font-awesome-icon :icon="upload" />
      </span>
      <span class="file-label">
        Choose a file…
      </span>
    </span>
      <div class="select">
        <select>
          <option value="urqw" selected>Не применять специальных правил</option>
          <option value="ripurq">Rip URQ 1.4</option>
          <option value="dosurq">Dos URQ 1.35</option>
        </select>
      </div>
    </label>
  </div>

</div>
</template>

<script>
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
    import FaUpload from '@fortawesome/fontawesome-free-solid/faUpload'

    export default {
        name: "loadGame",
        data() {
            return {
                dropdownIsActive: false
            }
        },
        methods: {
            clicked (event) {
                alert(event.currentTarget.textContent)
            }
        },
        computed: {
            upload () {
                return FaUpload
            },
        },
        components: {
            FontAwesomeIcon
        }
    };

/*

    /!**
     * Read file when change file-control
     *!/
    $('#quest').on('change', function(e) {
        files = {};
        var qst = [];

        if (e.target.files.length == 1 && e.target.files[0].name.split('.').pop().toLowerCase() == 'zip') {
            var reader = new FileReader();
            var zip = e.target.files[0];

            reader.onload = function() {
                mode = $('#urq_mode').val();
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
        mode = $('#urq_mode').val();
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
    });

    /!**
     * @param file
     *!/
    function readQst(file) {
        var reader = new FileReader();
        reader.onload = function() {
            if (file.name.substr(0, 1) == '_') {
                quest.unshift(reader.result);
            } else {
                quest.push(reader.result);
            }
        };

        reader.readAsText(file, 'CP1251');
    }

    /!**
     * @param filename
     * @param file
     *!/
    function readFile(filename, file) {
        var reader = new FileReader();
        reader.onload = function() {
            files[filename] = URL.createObjectURL(new Blob([reader.result], {type: MIME[filename.split('.').pop()]}));
        };

        reader.readAsArrayBuffer(file);
    }

    /!**
     * @param file
     *!/
    function readStyle(file) {
        var style = new FileReader();
        style.onload = function() {
            $('#additionalstyle').find('style').append(style.result);
        };

        style.readAsText(file, 'CP1251');
    }

    /!**
     * @param file
     *!/
    function readJs(file) {
        var script = new FileReader();
        script.onload = function() {
            eval(script.result); // todo?
        };

        script.readAsText(file, 'CP1251');
    }
*/

</script>
