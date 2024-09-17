<template>
    <div class="border-2px padding-top-05 padding-left-1 maxw-tablet-lg">
        <h5 class="font-heading-md">{{ block.item.title }}</h5>
        <p v-html="block.item.formula_tex" ref="formula" class="font-serif-md"></p>
    </div>
</template>

<script>
export default {
    props: {
        block: {
            type: Object
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.renderMathJax();
        });
    },
    methods: {
        renderMathJax() {
            if (window.MathJax) {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, this.$refs.formula]);
            }
        }
    }
}
</script>
