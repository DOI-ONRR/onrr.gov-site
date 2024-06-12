import NestedList from '@editorjs/nested-list';
import * as Dom from '../utils/editorjs-nested-list/dom';
import Caret from '../utils/editorjs-nested-list/caret';

export class OnrrNestedList extends NestedList {
    /**
     * Handles Enter keypress
     *
     * @param {KeyboardEvent} event - keydown
     * @returns {void}
     */
    enterPressed(event) {
        const currentItem = this.currentItem;

        /**
         * Prevent editor.js behaviour
         */
        event.stopPropagation();

        /**
         * Prevent browser behaviour
         */
        event.preventDefault();

        /**
         * Prevent duplicated event in Chinese, Japanese and Korean languages
         */
        if (event.isComposing) {
            return;
        }

        /**
         * On Enter in the last empty item, get out of list
         */
        const isEmpty = this.getItemContent(currentItem).trim().length === 0;
        const isFirstLevelItem = currentItem.parentNode === this.nodes.wrapper;
        const isLastItem = currentItem.nextElementSibling === null;

        if (isFirstLevelItem && isLastItem && isEmpty) {
            this.getOutOfList();

            return;
        } else if (isLastItem && isEmpty) {
            this.unshiftItem();

            return;
        }

        /**
         * On other Enters, get content from caret till the end of the block
         * And move it to the new item
         */
        const endingFragment =
            Caret.extractFragmentFromCaretPositionTillTheEnd();
        const endingHTML = Dom.fragmentToString(endingFragment);
        const itemChildren = currentItem.querySelector(
            `.${this.CSS.itemChildren}`
        );

        /**
         * Create the new list item
         */
        const itemEl = this.createItem(endingHTML, undefined);

        /**
         * Check if child items exist
         *
         * @type {boolean}
         */
        const childrenExist =
            itemChildren &&
            Array.from(itemChildren.querySelectorAll(`.${this.CSS.item}`))
                .length > 0;

        /**
         * If item has children, prepend to them
         * Otherwise, insert the new item after current
         */
        if (childrenExist) {
            itemChildren.prepend(itemEl);
        } else {
            currentItem.after(itemEl);
        }

        this.focusItem(itemEl);
    }
}