<template>
    <div>
        <Navbar :page="currentPage" v-on:clickBtn="clickBtn"/>
        <div class="section">
            <div class="container">
                <template v-if="Game && currentPage === 'load'">
                    <LoadGame :Game="Game" v-on:clicked="clickBtn"></LoadGame>
                </template>
                <template v-else-if="Game && currentPage === 'save'">
                    <SaveGame :Game="Game" v-on:clicked="clickBtn"></SaveGame>
                </template>
                <template v-else>
                    <Content :content="Client.text"/>
                    <Buttons :buttons="Client.buttons" v-on:clicked="buttonClicked"/>
                    <Info/>
                </template>
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
    import SaveGame from "@/components/game/SaveGame.vue";
    import LoadGame from "@/components/game/LoadGame.vue";
    import Loader from "@/engine/Loader";
    import Client from "@/engine/src/Client";

    export default {
        name: "game",
        components: {
            Navbar,
            Buttons,
            Content,
            Input,
            Info,
            SaveGame,
            LoadGame,
        },
        data() {
            return {
                questName: this.$route.params.name,
                Client: {},
                Game: {},
                currentPage: 'game',
            };
        },
        mounted() {
            let LoaderInstance = new Loader();

            LoaderInstance.loadZipFromLocalFolder(this.questName).then(GameInstance => {
                this.$set(this, 'Game', GameInstance);
                this.$set(this, 'Client', GameInstance.Client);

                window.onbeforeunload = function(e) {
                    return 'confirm please';
                };
            });
        },
        methods: {
            buttonClicked(action) {
                this.Client.btn(action)
            },
            clickBtn(name) {
                if (name === 'loadGame') {
                    this.currentPage = 'load'
                } else if (name === 'saveGame') {
                    this.currentPage = 'save'
                } else if (name === 'returnToGame') {
                    this.currentPage = 'game'
                } else if (name === 'restartGame') {
                    if (!this.Game.locked && confirm('Restart the game?')) {
                        this.Game.restart();
                        this.$set(this, 'Client', this.Game.Client);
                    }
                } else if (name === 'switchVolume') {
                }
            }
        }
    };

</script>
