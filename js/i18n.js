/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// The file encoding is UTF-8 without BOM

document.addEventListener('DOMContentLoaded', function() {
    // Define available languages with their names
    var availableLangs = {
        be: {
            name: "Belarusian (беларуская)",
            translation: be
        },
        en: {
            name: "English",
            translation: en
        },
        hy: {
            name: "Armenian (հայերեն)",
            translation: hy
        },
        ru: {
            name: "Russian (русский)",
            translation: ru
        },
        uk: {
            name: "Ukrainian (українська)",
            translation: uk
        }
    };

    // Create resource object from available languages
    var resources = Object.entries(availableLangs).reduce((acc, [lng, { translation }]) => {
        acc[lng] = { translation };
        return acc;
    }, {});

    // Initializing i18next
    i18next
        .use(i18nextBrowserLanguageDetector)
        .init({
            resources: resources,
            detection: {
                order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
                lookupLocalStorage: 'i18nextLng',
                lookupCookie: 'i18next',
                cache: true
            },
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false
            },
            initImmediate: false
        })
        .then(() => {
            // Check if there is saved language
            var storedLang = localStorage.getItem('i18nextLng') || getCookie('i18next');
            // If there is saved language, use it
            if (storedLang && availableLangs[storedLang]) {
                i18next.changeLanguage(storedLang);
            }

            updateUI();
            fillLangSelect();
        });

    // User interface update function
    function updateUI() {
        var elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            var instructions = element.dataset.i18n;
            var parts = instructions.split(';');

            parts.forEach(part => {
                if (part.includes('[')) {
                    var [attrWithBrackets, key] = part.trim().split(']');
                    var attr = attrWithBrackets.slice(1);
                    if (element.hasAttribute(attr)) {
                        element.setAttribute(attr, i18next.t(key.trim()));
                    }
                } else {
//                    element.textContent = i18next.t(part.trim());
                    element.innerHTML = i18next.t(part.trim());
                }
            });
        });

    document.documentElement.setAttribute('lang', i18next.language);
    }

    // Language selector fill function
    function fillLangSelect() {
        var langSelect = document.getElementById('lang_select');

        Object.keys(availableLangs).forEach(lang => {
            var option = document.createElement('option');
            option.value = lang;
            option.textContent = availableLangs[lang].name;
            langSelect.appendChild(option);
        });

        langSelect.value = i18next.language;
        // Handling situation when language code contains additional groups, e.g., en-US
        if (!langSelect.value) {
            var baseLanguage = i18next.language.match(/^[a-z]+/)[0];
            langSelect.value = baseLanguage;
        }

        // Add language change handler
        langSelect.addEventListener('change', function() {
            var selectedLang = this.value;
            saveLanguage(selectedLang);
            i18next.changeLanguage(selectedLang, () => {
                updateUI();
            });
        });
    }

    // Save selected language function
    function saveLanguage(lang) {
        localStorage.setItem('i18nextLng', lang);
        document.cookie = `i18next=${lang}; path=/; max-age=${365 * 24 * 60 * 60}`;
    }

    // Get cookie value function
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
});
