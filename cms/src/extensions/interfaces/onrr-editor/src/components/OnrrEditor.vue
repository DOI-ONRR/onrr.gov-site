<template>
    <v-container>
        <v-row>
            <v-col
                align="center">
                <h1>The ONRR Editor.js</h1>
                <p class="w-50">Please note that the ImageTool plugin cannot be properly tested here due to its reliance on Vue components provided upstream by Directus.</p>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <div id="onrrEditor"></div>
            </v-col>
        </v-row>
        <v-row>
            <v-col
            align="center">
                
                    <v-btn class="save">Generate JSON output</v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <pre id="outputData"></pre>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import EditorJS from '@editorjs/editorjs'
import { OnrrEditorConfig } from '../onrr-editor-config'
import { onMounted, ref, watchEffect, defineProps } from 'vue';
import { createDirectus, rest, readFolders } from '@directus/sdk';

const cmsUrl = process.env.VUE_APP_CMS_URL;

const folder = ref(null);
const editor = ref(null);

const props = defineProps({
    value: {
        type: Object,
        default: null
    },
    disabled: {
        type: Boolean,
        default: false
    },
    font: {
        type: String,
        default: 'sans-serif'
    },
    bordered: {
        type: Boolean,
        default: true
    }
});

const config = {
    holder: 'onrrEditor',
    baseURL: cmsUrl,
    changeHandler: null,
    data: getPreparedValue(props.value),
    picker: undefined
}

const editorJsConfig = new OnrrEditorConfig(config);

onMounted(() => {
    editor.value = new EditorJS(editorJsConfig.getConfig(cmsUrl));

    const btn = document.querySelector('.save');

    btn.addEventListener('click', () => {
        editor.value.save().then((outputData) => {
            const outputDiv = document.querySelector('#outputData');
            outputDiv.textContent = JSON.stringify(outputData, null, 4);
        })
    });
});

watchEffect(async () => {
    try {
        const client = createDirectus(cmsUrl).with(rest())

        const responseData = await client.request(readFolders({
            fields: ['id'],
            filter: {
                name: {
                    _eq : "Images"
                }
            }
        }));

        folder.value = responseData[0].id;
    }
    catch (error) {
        console.error('Failed to get folder:', error);
    }
});

function getPreparedValue(value) {
    if (typeof value !== 'object') {
        return {
            time: null,
            version: 0,
            blocks: [],
        };
    }

    return {
        time: value?.time,
        version: value?.version,
        blocks: value?.blocks || [],
    };	
}

</script>

<style lang="css" scoped>
    #outputData {
        max-width: 650px;
        margin: 0 auto;
    }
</style>

<style src="../styles/styles.css"></style>