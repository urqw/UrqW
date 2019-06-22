<template>
  <div class="content">
    <div class="subtitle">
      <h5 class="title is-5">Или выберите игру из списка:</h5>
    </div>

    <div class="list-group gamelist">
      <div class="card" v-for="game in games" :key="game.folder">
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <router-link
                :to="{ name: 'game', params: { name: game.folder } }"
                class="title game-title is-5"
                >{{ game.title }}</router-link
              >
              <br />
              <p class="subtitle is-6">{{ game.author }}</p>
            </div>
          </div>
          <div class="content">
            {{ game.description }}
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
  data() {
    return {
      games: []
    };
  },
  async mounted() {
    try {
      const response = await axios.get("/games.json");
      this.games = response.data;
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }
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
