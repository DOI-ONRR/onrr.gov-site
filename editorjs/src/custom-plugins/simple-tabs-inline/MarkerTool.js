export default class MarkerTool {

  static get isInline() {
    return true;
  }

  constructor() {
    this.button = null;
    this.state = false;
  }

  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.textContent = 'M';
    this.button.classList.add(this.api.styles.inlineToolButton)

    return this.button;
  }

  surround(range) {
    if (this.state) {
        this.unwrap(range);
        return;
    }

    this.wrap(range);
}

wrap(range) {
    const selectedText = range.extractContents();
    const mark = document.createElement('MARK');

    mark.appendChild(selectedText);
    range.insertNode(mark);

    this.api.selection.expandToTag(mark);
}

unwrap(range) {
    const mark = this.api.selection.findParentTag('MARK');
    const text = range.extractContents();

    mark.remove();

    range.insertNode(text);
}

 
  checkState(selection) {
    const mark = this.api.selection.findParentTag(this.tag);

    this.state = !!mark;
  }
}
