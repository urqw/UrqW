<template>
  <div class="content">
    <h5 class="title is-5">
      Загрузите игру (если есть дополнительные файлы, необходимо выбрать ВСЕ
      файлы игры):
    </h5>

    <div class="file has-name">
      <label class="file-label">
        <input
          class="file-input"
          multiple
          type="file"
          name="resume"
          @change="selectFiles"
        />
        <span class="file-cta">
          <span class="file-icon">
            <font-awesome-icon :icon="FaUpload" />
          </span>
          <span class="file-label">
            Выберите файл…
          </span>
        </span>
        <div class="select">
          <select>
            <option value="urqw" selected
              >Не применять специальных правил</option
            >
            <option value="ripurq">Rip URQ 1.4</option>
            <option value="dosurq">Dos URQ 1.35</option>
          </select>
        </div>
      </label>
    </div>
  </div>
</template>

<script>
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import FaUpload from "@fortawesome/fontawesome-free-solid/faUpload";
import Loader from "../../engine/Loader";

export default {
  name: "loadGame",
  data() {
    return {
      dropdownIsActive: false,
      FaUpload
    };
  },
  methods: {
    selectFiles(event) {
      let loader = new Loader();

      loader.loadFiles(event.target.files).then(GameInstance => {
        this.$router.push({ name: 'game', params: {Game: GameInstance}});
      });
    }
  },
  components: {
    FontAwesomeIcon
  }
};

/*

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
