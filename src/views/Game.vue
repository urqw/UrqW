<template>
    <div>
        <Navbar/>
        <div class="section">
            <div class="container">
                <Content :content="Client.text"/>
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
        },
        data() {
            return {
                questName: this.$route.params.name,
                Client: {},
            };
        },
        mounted() {
            let LoaderInstance = new Loader();

            LoaderInstance.loadZipFromLocalFolder(this.questName).then(GameInstance => {
                this.$set(this, 'Client', GameInstance.Client);

                window.onbeforeunload = function(e) {
                    return 'confirm please';
                };
            });
        },
        methods: {
            buttonClicked(action) {
                this.Client.btn(action)
            }
        }
    };

</script>
