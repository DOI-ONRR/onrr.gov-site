export const iconMixin = {
  methods: {
   fileIcon(fileType) {
      let type 
      switch (fileType) {
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
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
       case 'application/vnd.ms-powerpoint':
      case 'application/vnd.ms-powerpoint.presentation.macroEnabled.12':
          type = 'mdi-file-powerpoint-box'
          return 'x-office-presentation';
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
  }
}
