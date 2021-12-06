export default class HorizontalRuleTool {

  // constructor({ data, config, api }) {
  // }

  static get toolbox() {
    return {
      title: 'Horizontal Rule',
      icon: '<svg width="20" height="20" viewBox="0 0 22 22"><path fill="#6F6F6F" d="M0,24H24V20H0V24Z"></path></svg>'
    };
  }

  render() {
    const node = document.createElement('div');
    node.innerHTML = '<hr>';
    node.style.paddingTop = '8px';
    node.style.paddingBottom = '8px';
    return node;
  }

  save(blockContent) {
    return {
      hr: blockContent.value
    }
  }

}
