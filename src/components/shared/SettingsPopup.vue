<template>
  <Popup :open="open" :title="$t('settingsTitle')" @cancel="$emit('cancel')">
    <template slot="body">
      <p>
        {{ $t("homePage") }}
        <a :href="homepage" target="_blank">{{ homepage }}</a>
      </p>
      <div class="field">
        <p class="help">
          {{ $t("settingsLang") }}
        </p>

        <div class="control">
          <label class="radio" v-for="lang of availableLanguages" :key="lang">
            <input
              type="radio"
              name="lang"
              :checked="isLangSelected(lang)"
              @change="onLanguageSelect(lang)"
            />
            <LangFlag :iso="lang" style="margin-left: 0.5ex" />
          </label>
        </div>
      </div>
    </template>
  </Popup>
</template>

<script>
import LangFlag from "vue-lang-code-flags";
import { homepage } from "../../../package.json";
import Popup from "./Popup";
import { availableLanguages, loadLanguageAsync } from "../../i18n";

export default {
  name: "SettingsPopup",

  components: {
    Popup,
    LangFlag
  },

  props: {
    open: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      homepage,
      availableLanguages,
    };
  },

  methods: {
    isLangSelected(lang) {
      return this.$i18n.locale === lang;
    },

    onLanguageSelect(lang) {
      loadLanguageAsync(lang);
    }
  }
};
</script>

<style scoped>
.help {
  font-size: 120%;
}
</style>
