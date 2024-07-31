<template>
    <div class="border-2px padding-top-05 padding-left-1">
        <h4>{{ block.item.title }}</h4>
        <p v-html="block.item.formula_tex" ref="formula"></p>
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
