<template>
  <div class="content">
    <div class="subtitle">
      <h5 class="title is-5">Или выберите игру из списка:</h5>
    </div>

    <div class="list-group gamelist">
      <div class="card" v-for="item in list" :key="item.folder">
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <router-link :to="{ name: 'game', params: { name: item.folder } }" class="title game-title is-5">{{ item.title }}</router-link>
              <br/>
              <p class="subtitle is-6">{{ item.author }}</p>
            </div>
          </div>
          <div class="content">
            {{ item.description }}
          </div>
        </div>
      </div>
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
