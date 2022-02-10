import AlignmentBlockTune from "./custom-plugins/alignment-block-tool";
import InterfaceComponent from "./interface.vue";

export default {
	id: "extension-editorjs",
	name: "Editor.js",
	description:
		"Block-styled editor for rich media stories, outputs clean data in JSON using Editor.js",
	icon: "add_circle",
	component: InterfaceComponent,
	types: ["json"],
	options: [
		{
			field: "placeholder",
			name: "$t:placeholder",
			meta: {
				width: "half",
				interface: "text-input",
			},
		},
		{
			field: "font",
			name: "$t:font",
			type: "string",
			meta: {
				width: "half",
				interface: "select-dropdown",
				options: {
					choices: [
						{ text: "$t:sans_serif", value: "sans-serif" },
						{ text: "$t:monospace", value: "monospace" },
						{ text: "$t:serif", value: "serif" },
					],
				},
			},
			schema: {
				default_value: "sans-serif",
			},
		},
		{
			field: "tools",
			name: "$t:interfaces.input-rich-text-html.toolbar",
			type: "json",
			schema: {
				default_value: [
					"header",
					"list",
					"code",
					"image",
					"paragraph",
					// "delimiter",
					// "checklist",
					"quote",
					"underline",
					"link",
					"collections",
					"horizontalrule",
				],
			},
			meta: {
				width: "half",
				interface: "select-multiple-dropdown",
				options: {
					choices: [
						{ value: "header", text: "Header" },
						{ value: "list", text: "List" },
						{ value: "embed", text: "Embed" },
						{ value: "paragraph", text: "Paragraph" },
						{ value: "code", text: "Code" },
						{ value: "image", text: "Image" },
						{ value: "warning", text: "Warning" },
						{ value: "attaches", text: "Attaches" },
						{ value: "table", text: "Table" },
						{ value: "quote", text: "Quote" },
						{ value: "marker", text: "Marker" },
						{ value: "simpleimage", text: "Simple Image" },
						{ value: "underline", text: "Underline" },
						{ value: "inlinecode", text: "Inline Code" },
						{ value: "textalign", text: "Align" },
						{ value: "alert", text: "Alert" },
						{ value: "strikethrough", text: "Strikethrough" },
						{ value: "delimiter", text: "Delimiter" },
						{ value: "checklist", text: "Checklist" },
						{ value: "personality", text: "Personality" },
						{ value: "raw", text: "Raw HTML" },
						{ value: 'link', text: "Link" },
						{ value: 'collection', text: 'Collections'},
						{ value: 'horizontalrule', text: 'Horizontal Rule'},
						{ value: 'alignmentTune', text: 'Alignment' },
					],
				},
			},
		},
		{
			field: "bordered",
			name: "Border",
			type: "boolean",
			meta: {
				width: "half",
				interface: "toggle",
			},
			schema: {
				default_value: true,
			},
		},
		{
			field: "folder",
			name: "$t:interfaces.system-folder.folder",
			type: "uuid",
			meta: {
				width: "full",
				interface: "system-folder",
				note: "$t:interfaces.system-folder.field_hint",
			},
			schema: {
				default_value: undefined,
			},
		},
	],
};
