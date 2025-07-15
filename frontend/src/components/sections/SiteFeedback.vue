<template>
    <div id="touchpoints-yes-no-form" class="onrr-feedback-form" v-show="isPageLoaded"></div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
    name: 'SiteFeedback',
    props: {
        feedbackFormKey: Number
    },
    mounted() {
        this.$nextTick(() => {
            document.addEventListener("onTouchpointsFormLoaded", this.handleTouchpointsFormLoaded);

            const script = document.createElement('script');
            script.src = '/2dcadeaf.js';
            script.async = true;
            this.$el.appendChild(script);
        });
    },
    methods: {
        handleTouchpointsFormLoaded(e) {
            if (e.detail && e.detail.formComponent
                .formComponent()
                .getAttribute("data-touchpoints-form-id") === "2dcadeaf") {

                var formElement = e.detail.formComponent.formComponent();
                var touchpointsFooter = document.querySelector("footer.touchpoints-footer-banner");
                var yesButton = formElement.querySelector('input.usa-radio__input[value="Yes"]');
                var noButton = formElement.querySelector('input.usa-radio__input[value="No"]');
                var questions = formElement.querySelectorAll(".questions .question");
                var header = formElement.querySelector("header");
                var submitButton = formElement.querySelector('button.submit_form_button[type="submit"]');

                // Hide the touchpoints footer always 
                if (touchpointsFooter) {
                    touchpointsFooter.classList.add("display-none");
                }

                // Hide the second question and submit button initially 
                if (questions.length > 0 && !!submitButton) {
                    questions[1].classList.add("display-none");
                    submitButton.classList.add("display-none");
                }

                // Use function expressions for inner functions to avoid block-scoping issues
                var handleYesNoButtonClick = function (event, response) {
                    if (questions.length > 0 && !!header && !!submitButton) {
                        questions[0].classList.add("display-none");
                        header.classList.add("display-none");
                        questions[1].classList.remove("display-none");
                        submitButton.classList.remove("display-none");
                    }

                    const gas4Function = eval('typeof gas4 !== "undefined" ? gas4 : undefined');

                    if (typeof gas4Function === "function") {
                        gas4Function('was_this_helpful_submit', {
                            'event_category': 'cx_feedback',
                            'event_action': 'was_this_page_helpful2',
                            'event_label': response
                        });
                    }
                };

                var handleYesButtonClick = function (event) {
                    handleYesNoButtonClick(event, 'yes');
                };

                var handleNoButtonClick = function (event) {
                    handleYesNoButtonClick(event, 'no');
                };

                yesButton.addEventListener("click", handleYesButtonClick);
                noButton.addEventListener("click", handleNoButtonClick);

                // ONRR-specific changes:
                var newHeader = document.createElement('p');
                var haychOne = header.querySelector('h1');
                if (haychOne) {
                    newHeader.innerHTML = haychOne.innerHTML;
                    for (const attr of haychOne.attributes) {
                        newHeader.setAttribute(attr.name, attr.value);
                    }
                    newHeader.classList.add('font-ui-lg', 'text-medium', 'text-center');
                    haychOne.parentNode.replaceChild(newHeader, haychOne);
                }

                var questionOptions = formElement.querySelectorAll('.question-options label');
                for (const questionOption of questionOptions) {
                    if (questionOption.classList.contains('usa-radio__label')) {
                        questionOption.classList.remove('usa-radio__label');

                        var optionSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        optionSvg.setAttribute("class", "usa-icon thumb-icon");
                        optionSvg.setAttribute("aria-hidden", "true");
                        optionSvg.setAttribute("focusable", "false");
                        optionSvg.setAttribute("role", "img");

                        var div = document.createElement("div");
                        div.className = "option-text";

                        var use = document.createElementNS("http://www.w3.org/2000/svg", "use");

                        if (questionOption.innerHTML === 'Yes') {
                            use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/uswds/img/sprite.svg#thumb_up_alt");
                            div.textContent = "Yes";
                        }
                        if (questionOption.innerHTML === 'No') {
                            use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/uswds/img/sprite.svg#thumb_down_alt");
                            div.textContent = "No";
                        }
                        optionSvg.appendChild(use);
                        questionOption.innerHTML = '';
                        questionOption.appendChild(optionSvg);
                        questionOption.appendChild(div);
                    }
                }

                submitButton.classList.add('onrr-submit-button');

                var questionLabel = formElement.querySelectorAll('.question label')[2];
                questionLabel.classList.add('font-sans-sm', 'margin-top-0');
                
                var questionTextarea = formElement.querySelector('.question textarea');
                questionTextarea.classList.add('font-sans-xs');

                // Handle form submission
                formElement.addEventListener('submit', function(event) {
                    const xpath = "//label[contains(normalize-space(.), 'What were you looking for?')]/following-sibling::textarea[1]";

                    const result = document.evaluate(
                        xpath,
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    );

                    const whatWereYouLookingFor = result.singleNodeValue;

                    if (typeof gas4Function === "function") {
                        gas4('form_submit', {  
                            'event_category': 'cx_feedback',  
                            'event_action': 'what_were_you_looking_for', 
                            'event_label': whatWereYouLookingFor.value 
                        });
                    } 
                });
            } 
        }
    },
    watch: {
        feedbackFormKey: function(newVal, oldVal) {
            if (oldVal > 0) {
                let FBAform = eval('typeof FBAform !== "undefined" ? FBAform : undefined');
                let touchpointFormOptions2dcadeaf = eval('typeof touchpointFormOptions2dcadeaf !== "undefined" ? touchpointFormOptions2dcadeaf : undefined');
                new FBAform(document,window).init(touchpointFormOptions2dcadeaf);
            }
        }
    },
    computed: {
        ...mapGetters([
            'isPageLoaded',
        ])
    }
}
</script>
