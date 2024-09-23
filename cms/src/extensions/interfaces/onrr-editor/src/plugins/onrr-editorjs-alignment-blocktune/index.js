import AlignmentBlockTune from 'editorjs-text-alignment-blocktune';

import { make } from './util';

export class OnrrAlignmentBlockTune extends AlignmentBlockTune {

    /**
     * rendering block tune
     * @returns {*}
     */
    render() {
        const wrapper = make("div");
        this.alignmentSettings.map(align => {
            const button = document.createElement('button');
            button.classList.add(this.api.styles.settingsButton);
            button.innerHTML = align.icon;
            button.type = 'button';

            button.classList.toggle(this.api.styles.settingsButtonActive, align.name === this.data.alignment);
            wrapper.appendChild(button);
            return button
        }).forEach((element, index, elements) => {
            element.addEventListener('click', () => {
                this.data = {
                    alignment: this.alignmentSettings[index].name
                }

                this.block?.dispatchChange()
                
                elements.forEach((el, i) => {
                    const {name} = this.alignmentSettings[i];
                    el.classList.toggle(this.api.styles.settingsButtonActive, name === this.data.alignment);
                    //toggle alignment style class for block
                    this.wrapper.classList.toggle(this._CSS.alignment[name], name === this.data.alignment)
                });
            });
        });
        return wrapper;
    }
}