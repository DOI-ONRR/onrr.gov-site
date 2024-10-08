export const iconMixin = {
  methods: {
   fileIcon(fileType) {
      let type
      switch (fileType) {
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          type = 'mdi-file-powerpoint-box'
        break;
        case 'vnd.openxmlformats-officedocument.presentationml.presentation':
          type = 'mdi-file-powerpoint-box'
            break;
        case 'pptx':
          type = 'mdi-file-powerpoint-box'
            break;
        case 'ppt':
            type = 'mdi-file-powerpoint-box'
            break;
        case 'PowerPoint Presentation':
            type = 'mdi-file-powerpoint-box'
            break;
        case 'application/pdf':
        case 'pdf':
          type = 'mdi-file-pdf-box'
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          type = 'mdi-file-word-box'
          break;
        case 'xls':
        case 'xlsx':
        case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          type = 'mdi-file-excel-box'
        break;
          case 'plain':
            type = 'mdi-text-box'
            break
          default:
            type = undefined
            break;
        }
        return type;
      },
      fileIconClass(filename) {
        const match = filename.toLowerCase().match(/\.([^.]+)$/);
        let iconClass = "";
        switch (match[1]) {
          case "pdf":
            iconClass = "onrr-link-pdf";
            break;
    
          case "pptx":
            iconClass = "onrr-link-powerpoint";
            break;
    
          case "docx":
            iconClass = "onrr-link-word";
            break;
    
          case "xlsx":
            iconClass = "onrr-link-excel";
            break;
    
          case "txt":
            iconClass = "onrr-link-text";
            break;
    
          default:
            break;
        }
        return iconClass;
      }
    }
  }
