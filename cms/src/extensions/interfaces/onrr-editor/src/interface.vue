<template>
	<v-dialog :model-value="fileHandler" @update:model-value="unsetFileHandler" @esc="unsetFileHandler">
		<v-card>
			<v-card-title>
				<i18n-t keypath="upload_from_device" />
			</v-card-title>
			<v-card-text>
				<v-upload 
				:ref="uploaderComponentElement" 
				@input="handleFile" 
				:multiple="false" 
				:folder="folder"
				:from-library="true"
				:from-url="false" />
			</v-card-text>
			<v-card-actions>
				<v-button secondary @click="unsetFileHandler">
					<i18n-t keypath="cancel" />
				</v-button>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<div :class="className" ref="editorElement"></div>
</template>

<script setup>
	import { ref, onMounted, onUnmounted, watch, watchEffect, useAttrs } from 'vue';
	import debounce from 'debounce';
	import EditorJS from '@editorjs/editorjs';
	import { OnrrEditorConfig } from './onrr-editor-config';
	import { useApi } from '@directus/extensions-sdk';
	import './styles/editorjs-content-reset.css'
	import './styles/editorjs-components.css'
	import './styles/styles.css'
	import { createDirectus, rest, readFolders } from '@directus/sdk';

	const editorjsInstance = ref(null);
	const uploaderComponentElement = ref(null);
	const editorElement = ref(null);
	const fileHandler = ref(null);
	const folder = ref(null);

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

	const emit = defineEmits(['input', 'error']);

	const attrs = useAttrs()

	const className = ref({
		[props.font]: true,
		bordered: props.bordered,
	});

	const api = useApi();

	const baseURL = api.defaults.baseURL

	const editorValueEmitter = debounce(function saver(context) {
		if (props.disabled || !context) return;

		context.saver
			.save()
			.then((result) => {
				if (!result || result.blocks.length < 1) {
					emit('input', null);
				} else {
					emit('input', result);
				}
			})
			.catch(() => emit('error', 'Cannot get content'));
	}, 250);

	onMounted(() => {

		const editorJsConfig = new OnrrEditorConfig({
			baseURL: baseURL,
			holder: editorElement.value,
			changeHandler: editorValueEmitter,
			data: getPreparedValue(props.value),
			picker: setFileHandler
		});

		editorjsInstance.value = new EditorJS(editorJsConfig.getConfig());

		if (attrs.autofocus) {
			editorjsInstance.value.focus();
		}
	});

	onUnmounted(() => {
		try {
			editorjsInstance.value.destroy();
		}
		catch (error) {
			console.error('Error in onUnmounted', error);
		}
	});

	watch(() => props.value,
	(newVal, oldVal) => {
		if (
			!editorjsInstance.value ||
			JSON.stringify(newVal?.blocks) === JSON.stringify(oldVal?.blocks)
		) {
			return;
		}

		editorjsInstance.value.isReady.then(() => {
			if (
				editorjsInstance.value.configuration.holder.contains(document.activeElement) ||
				fileHandler.value !== null
			) {
				return;
			}

			editorjsInstance.value.render(getPreparedValue(newVal));
		});
	}
	);

	watchEffect(async () => {
		try {
			const client = createDirectus(window.location.origin).with(rest())

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

	function unsetFileHandler() {
		fileHandler.value = null;
	}

	function setFileHandler(handler) {
		fileHandler.value = handler;
	}

	function handleFile(event) {
		fileHandler.value(event);
		unsetFileHandler();
	}

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
.bordered {
	padding: var(--input-padding);
	background-color: var(--background-page);
	border: var(--border-width) solid var(--border-normal);
	border-radius: var(--border-radius);
}

.bordered:hover {
	border-color: var(--border-normal-alt);
}

.bordered:focus-within {
	border-color: var(--primary);
}

.monospace {
	font-family: var(--family-monospace);
}

.serif {
	font-family: var(--family-serif);
}

.sans-serif {
	font-family: var(--family-sans-serif);
}
</style>