<template>
  <div>
    <div class="page-header">
      <h3>Или выберите игру из списка:</h3>
    </div>

    <div class="list-group gamelist">
      <router-link :to="{ name: 'game', params: { name: item.folder } }" v-for="item in list" :key="item.folder">
        <h2 class="title">{{ item.title }}</h2>
        <h4>{{ item.description }}</h4>
        <h4>{{ item.author }}</h4>
      </router-link>
    </div>
  </div>
</template>
<script>
import axios from "axios";

export default {
  name: "gamelist",
  data () {
      return {
          list: []
      }
  },
  mounted() {
    axios.get('/games.json')
      .then(response => {
        this.list = response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  }
};

    /**
     * Выбор игры из списка
     */
/*
    $('.gamelist').on('click', '.gamelink', function() {
        window.location.hash = encodeURIComponent($(this).data('game'));
        loadFromHash();

        return false;

        // redirect

    });
*/

</script>