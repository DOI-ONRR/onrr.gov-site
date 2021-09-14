# editorjs

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Develop your custom editorjs plugin and add it to ~/components/EditorJs.vue as a tool
```
import MyCustomPlugin from '../custom-plugins/my-custom-plugin'
```

### Once plugin is ready add your new tool to ~/interface.vue and index.js
```
import MyCustomPlugin from '../custom-plugins/my-custom-plugin'
```
### Build interface extension
Run dist script
```
directus-extension build && mv dist editorjs && zip -r editorjs.zip editorjs
```

### Copy dist package of editorjs over to cms and restart
```
cp -r editorjs ../cms/extensions/interfaces
```
### Usage in cms
- Add a simple field with **JSON** type
- In the **Interface** section on the left choose **Editor.js**
- Enjoy! 🎉 🚀
