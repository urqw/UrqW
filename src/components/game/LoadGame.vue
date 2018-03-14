<template>
    <div>
        <div class="panel-block-back">
            <button class="button" @click="clickBtn('returnToGame')">
              <span class="icon">
                <font-awesome-icon :icon="arrowLeft"/>
              </span>
                <span>
                  Return to game
              </span>
            </button>
        </div>
        <nav class="panel">
            <a v-for="i in 10" class="panel-block" @click="clickLoad(i)">
                <template v-if="saves[i - 1]">
                    {{ saves[i - 1] }}
                </template>
                <template v-else>
                    Empty save slot #{{ i }}
                </template>
            </a>
        </nav>
    </div>
</template>

<script>
    import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
    import FaArrowAltCircleLeft from '@fortawesome/fontawesome-free-solid/faArrowAltCircleLeft'

    export default {
        name: 'loadgame',
        computed: {
            arrowLeft() {
                return FaArrowAltCircleLeft
            }
        },
        data () {
            return {
                saves: []
            }
        },
        mounted () {
            this.loadSaves()
        },
        components: {
            FontAwesomeIcon,
        },
        methods: {
            loadSaves() {
                this.saves = Array(10).fill().map((_, i) => localStorage.getItem(`${this.Game.name}_${i + 1}_name`))
            },
            clickBtn(name) {
                this.$emit('clicked', name);
            },
            clickLoad(id) {
                var data = localStorage.getItem(this.Game.name + '_' + id + '_data');

                if (data) {
                    this.Game.load(JSON.parse(data));

                    this.clickBtn('returnToGame');
                }
            }
        },
        props: {
            Game: Object
        }
    }
</script>
<style scoped>
    .panel-block-back {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1em;
    }
</style>