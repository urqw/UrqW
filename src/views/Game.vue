<template>
    <div>
        <Navbar/>
        <div class="section">
            <div class="container">
                <Content :content="Client.text" />
                <Buttons :buttons="Client.buttons" v-on:clicked="buttonClicked"/>
                <Info/>
            </div>
        </div>
    </div>
</template>

<script>

import Navbar from "@/components/game/Navbar.vue";
import Buttons from "@/components/game/Buttons.vue";
import Content from "@/components/game/Content.vue";
import Input from "@/components/game/Input.vue";
import Info from "@/components/game/Info.vue";
import JSZip from "jszip";
import ZipUtils from "jszip-utils";
import Tools from "@/engine/src/tools";
import Game from "@/engine/src/Game";
import Client from "@/engine/src/Client";

export default {
  name: "home",
  components: {
    Navbar,
    Buttons,
    Content,
    Input,
    Info,
  },
  data() {
    return {
        questName: this.$route.params.name,
        Game: {},
        Client: {},
    };
  },
    computed: {
   /*   content: function () {
            return (this.Game.Client && this.Game.Client.text) ? this.Game.Client.text : []
        },
    */
    },
  mounted() {
      const vm = this;

      ZipUtils.getBinaryContent(`quests/${this.questName}.zip`, function(err, data) {

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
                          $('#additionalstyle').find('style').append(file.asBinary());
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

                      window.Game = new Game(vm.questName);
                      vm.Game = window.Game;
                      window.Game.init(quest);
                      window.onbeforeunload = function(e) {
                          return 'confirm please';
                      };

                      vm.$set(vm, 'Client', vm.Game.Client);
                  });

              }
          });

      });

  },
  methods: {
    buttonClicked (action) {
        this.Game.Player.action(action)
    }
  }
};

</script>
