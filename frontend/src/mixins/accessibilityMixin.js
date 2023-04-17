export const accessibilityMixin = {
    methods: {
        addAriaLabelToCeButtons () {
            const buttons = this.$el.querySelectorAll('a.ce-link-inline__link-button');

            if (buttons.length == 0)
                return
            
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].setAttribute('aria-label', `${buttons[i].text} button`)
            }
        },

        removeAriaExpandedFromExpansionPanels () {
            const vm = this
            setTimeout(function () {
                const panels = vm.$el.querySelectorAll('.v-expansion-panel');

                if (panels.length == 0)
                    return;
                
                panels.forEach(panel => {
                    panel.removeAttribute('aria-expanded');
                });
            }, 500)
        }
    }
}