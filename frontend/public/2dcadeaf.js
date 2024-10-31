// Form components are namespaced under 'fba' = 'Feedback Analytics'
// Updated: July 2024
'use strict';

function FBAform(d, N) {
	return {
		formComponent: function() {
			return d.querySelector("[data-touchpoints-form-id='" + this.options.formId + "']")
		},
		formElement: function() {
			return this.formComponent().querySelector("form");
		},
		isFormSubmitted: false, // defaults to false
		// enable Javascript experience
		javascriptIsEnabled: function() {
			var javascriptDisabledMessage = d.getElementsByClassName("javascript-disabled-message")[0];
			var touchpointForm = d.getElementsByClassName("touchpoint-form")[0];
			if (javascriptDisabledMessage) {
				javascriptDisabledMessage.classList.add("hide");
			}
			if (touchpointForm) {
				touchpointForm.classList.remove("hide");
			}
		},
		init: function(options) {
			this.javascriptIsEnabled();
			this.options = options;
			if (this.options.loadCSS) {
				this._loadCss();
			}
			this._loadHtml();
			if (!this.options.suppressUI && (this.options.deliveryMethod && this.options.deliveryMethod === 'modal')) {
				this.loadButton();
			}
			this._bindEventListeners();
			this.successState = false; // initially false
			this._pagination();
			if (this.options.formSpecificScript) {
				this.options.formSpecificScript();
			}
			d.dispatchEvent(new CustomEvent('onTouchpointsFormLoaded', {
				detail: {
					formComponent: this
				}
			}));
			return this;
		},
		_bindEventListeners: function() {
			var self = this;

			const textareas = this.formComponent().querySelectorAll(".usa-textarea");
			textareas.forEach(function(textarea) {
				if (textarea.getAttribute("maxlength") != '0' && textarea.getAttribute("maxlength") != '10000')  {
					textarea.addEventListener("keyup", self.textCounter);
				}
			});

			const textFields = this.formComponent().querySelectorAll(".usa-input[type='text']");
			textFields.forEach(function(textField) {
				if (textField.getAttribute("maxlength") != '0' && textField.getAttribute("maxlength") != '10000')  {
					textField.addEventListener("keyup", self.textCounter);
				}
			});

		},
		_loadCss: function() {
			if (this.options.loadCSS) {
				var style = d.createElement('style');
				style.innerHTML = this.options.css;
				d.head.appendChild(style);
			}
		},
		_loadHtml: function() {
		if ((this.options.deliveryMethod && this.options.deliveryMethod === 'inline') && this.options.suppressSubmitButton) {
			if (this.options.elementSelector) {
				if(d.getElementById(this.options.elementSelector) != null) {
					d.getElementById(this.options.elementSelector).innerHTML = this.options.htmlFormBodyNoModal();
				}
			}
		} else if (this.options.deliveryMethod && this.options.deliveryMethod === 'inline') { 
			if (this.options.elementSelector) {
				if(d.getElementById(this.options.elementSelector) != null) {
					d.getElementById(this.options.elementSelector).classList.add('fba-inline-container');
					d.getElementById(this.options.elementSelector).innerHTML = this.options.htmlFormBody();
				}
			}
		}
		if (this.options.deliveryMethod && (this.options.deliveryMethod === 'modal' || this.options.deliveryMethod === 'custom-button-modal')) {
			this.dialogEl = d.createElement('div');
			this.dialogEl.setAttribute('class', "fba-usa-modal fba-modal");
			this.dialogEl.setAttribute('id', this.modalId());
			this.dialogEl.setAttribute('aria-labelledby', `fba-form-title-${this.options.formId}`);
			this.dialogEl.setAttribute('aria-describedby', `fba-form-instructions-${this.options.formId}`);
			this.dialogEl.setAttribute('data-touchpoints-form-id', this.options.formId);

			this.dialogEl.innerHTML = this.options.htmlFormBody();
			d.body.appendChild(this.dialogEl);
		}
		var otherElements = this.formElement().querySelectorAll(".usa-input.other-option");
		for (var i = 0; i < otherElements.length; i++) {
		    otherElements[i].addEventListener('keyup', this.handleOtherOption.bind(this), false);
		}
		var phoneElements = this.formElement().querySelectorAll("input[type='tel']");
		for (var i = 0; i < phoneElements.length; i++) {
		    phoneElements[i].addEventListener('keyup', this.handlePhoneInput.bind(this), false);
		}
		if (this.options.deliveryMethod && this.options.deliveryMethod === 'custom-button-modal') {
			if (this.options.elementSelector) {
				const customButtonEl = d.getElementById(this.options.elementSelector);
				if (customButtonEl != null) {
					customButtonEl.setAttribute('data-open-modal', '');
					customButtonEl.setAttribute('aria-controls', this.modalId());
					customButtonEl.addEventListener('click', () => d.dispatchEvent(new Event('onTouchpointsModalOpen')));
				}
			}
		}

			var formElement = this.formElement();
			// returns 1 or more submit buttons within the Touchpoints form
			var submitButtons = formElement.querySelectorAll("[type='submit']");
			var that = this;

			var yesNoForm = formElement.querySelector('.touchpoints-yes-no-buttons');

			if (yesNoForm) { // only for yes/no questions
				Array.prototype.forEach.call(submitButtons, function(submitButton) {
					submitButton.addEventListener('click', that.handleYesNoSubmitClick.bind(that), false);
				})
			} else { // for all other types of forms/questions
				if (submitButtons) {
					Array.prototype.forEach.call(submitButtons, function(submitButton) {
						submitButton.addEventListener('click', that.handleSubmitClick.bind(that), false);
					})
				}
			}
		},
		resetErrors: function() {
			var formComponent = this.formComponent();
			var alertElement = formComponent.querySelector(".fba-alert");
			var alertElementHeading = formComponent.getElementsByClassName("usa-alert__heading")[0];
			var alertElementBody = formComponent.getElementsByClassName("usa-alert__text")[0];
			var alertErrorElement = formComponent.querySelector(".fba-alert-error");
			var alertErrorElementBody = alertErrorElement.getElementsByClassName("usa-alert__text")[0];
			alertElement.setAttribute("hidden", true);
			alertElementHeading.innerHTML = "";
			alertElementBody.innerHTML = "";
			alertErrorElement.setAttribute("hidden", true);
			alertErrorElementBody.innerHTML = "";
		},
		handleOtherOption: function(e) {
			var selectorId =  "#" + e.srcElement.getAttribute("data-option-id");
			var other_val = e.target.value.replace(/,/g, '');
			if (other_val == '') other_val = 'other';
			var option = this.formElement().querySelector(selectorId);
			option.value = other_val;
		},
		handlePhoneInput: function(e) {
		    var number = e.srcElement.value.replace(/[^\d]/g, '');
		    if (number.length == 7) {
		      number = number.replace(/(\d{3})(\d{4})/, "$1-$2");
		    } else if (number.length == 10) {
		      number = number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
		    }
		    e.srcElement.value = number;
		},
		handleEmailInput: function(e) {
			var EmailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			var email = e.srcElement.value.trim();
			if (email.length == 0) {
				return;
			}
			result = EmailRegex.test(email);
			if (!result) {
				showWarning($(this),"Please enter a valid email address");
			} else {
				showValid($(this));
	    	}
		    e.srcElement.value = number;
		},
		handleSubmitClick: function(e) {
			e.preventDefault();
			this.resetErrors();
			var formElement = this.formElement();
			var self = this;
			if (self.validateForm(formElement)) {
				// disable submit button and show sending feedback message
				var submitButton = formElement.querySelector("[type='submit']");
				submitButton.disabled = true;
				submitButton.classList.add("aria-disabled");
				self.sendFeedback();
			}
		},
		handleYesNoSubmitClick: function(e) {
			e.preventDefault();

			var input = this.formComponent().querySelector('.fba-touchpoints-page-form');
			input.value = e.target.value;
			this.resetErrors();
			var self = this;
			var formElement = this.formElement();
			if (self.validateForm(formElement)) {
				var submitButtons = formElement.querySelectorAll("[type='submit']");
				Array.prototype.forEach.call(submitButtons, function(submitButton) {
					submitButton.disabled = true;
				})
				self.sendFeedback();
			}
		},
		validateForm: function(form) {
			this.hideValidationError(form);
			var valid = this.checkRequired(form) && this.checkEmail(form) && this.checkPhone(form) && this.checkDate(form);
			return valid;
		},
		checkRequired: function(form) {
			var requiredItems = form.querySelectorAll('[required]');
			var questions = {};
			// Build a dictionary of questions which require an answer
			Array.prototype.forEach.call(requiredItems, function(item) { questions[item.name] = item });

			Array.prototype.forEach.call(requiredItems, function(item) {
				switch (item.type) {
				case 'radio':
					if (item.checked) delete(questions[item.name]);
					break;
				case 'checkbox':
				  if (item.checked) delete(questions[item.name]);
					break;
				case 'select-one':
					if (item.selectedIndex > 0) delete(questions[item.name]);
					break;
				default:
					if (item.value.length > 0) delete(questions[item.name]);
				}
			});
			for (var key in questions) {
				this.showValidationError(questions[key], 'A response is required: ');
				return false;
			}
			return true;
		},
		checkDate: function(form) {
			var dateItems = form.querySelectorAll('.date-select');
			var questions = {};
			// Build a dictionary of questions which require an answer
			Array.prototype.forEach.call(dateItems, function(item) { questions[item.name] = item });
			Array.prototype.forEach.call(dateItems, function(item) {
			  if (item.value.length == 0) {
			  	delete(questions[item.name]);
			  } else {
				var isValidDate = Date.parse(item.value);
			    if (!isNaN(isValidDate)) delete(questions[item.name]);
			  }
			});
			for (var key in questions) {
				this.showValidationError(questions[key], 'Please enter a valid value: ');
				return false;
			}
			return true;
		},
		checkEmail: function(form) {
			var emailItems = form.querySelectorAll('input[type="email"]');
			var questions = {};
			// Build a dictionary of questions which require an answer
			Array.prototype.forEach.call(emailItems, function(item) { questions[item.name] = item });
			Array.prototype.forEach.call(emailItems, function(item) {
			  if (item.value.length == 0) {
			  	delete(questions[item.name]);
			  } else {
			    var EmailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			    if (EmailRegex.test(item.value)) delete(questions[item.name]);
			  }
			});
			for (var key in questions) {
				this.showValidationError(questions[key], 'Please enter a valid value: ');
				return false;
			}
			return true;
		},
		checkPhone: function(form) {
			var phoneItems = form.querySelectorAll('input[type="tel"]');
			var questions = {};
			// Build a dictionary of questions which require an answer
			Array.prototype.forEach.call(phoneItems, function(item) { questions[item.name] = item });
			Array.prototype.forEach.call(phoneItems, function(item) {
			  if (item.value.length == 0) {
			  	delete(questions[item.name]);
			  } else {
			    const PhoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
			    if (PhoneRegex.test(item.value)) delete(questions[item.name]);
			  }
			});
			for (var key in questions) {
				this.showValidationError(questions[key], 'Please enter a valid value: ');
				return false;
			}
			return true;
		},
		showValidationError: function(question, error) {
			var questionDiv = question.closest(".question");
			var label = questionDiv.querySelector(".usa-label") || questionDiv.querySelector(".usa-legend");
			var questionNum = label.innerText;

			// show page with validation error
			var errorPage = question.closest(".section");
			if (!errorPage.classList.contains("fba-visible")) {
				var visiblePage = this.formComponent().getElementsByClassName("section fba-visible")[0];
				visiblePage.classList.remove("fba-visible");
				errorPage.classList.add("fba-visible");
			}

			questionDiv.setAttribute('class', 'usa-form-group usa-form-group--error');
			var span = d.createElement('span');
			span.setAttribute('id', 'input-error-message');
			span.setAttribute('role','alert');
			span.setAttribute('class','usa-error-message');
			span.innerText = error + questionNum;
			label.parentNode.insertBefore(span, label.nextSibling);
			var input = d.createElement('input');
			input.setAttribute('hidden', 'true');
			input.setAttribute('id','input-error');
			input.setAttribute('type','text');
			input.setAttribute('name','input-error');
			input.setAttribute('aria-describedby','input-error-message');
			questionDiv.appendChild(input);
			questionDiv.scrollIntoView();
			questionDiv.focus();

			// enable submit button ( so user can fix error and resubmit )
			var submitButton = this.formComponent().querySelector("[type='submit']");
			submitButton.disabled = false;
			submitButton.classList.remove("aria-disabled");
		},
		hideValidationError: function(form) {
			var elem = form.querySelector('.usa-form-group--error');
			if (elem == null) return;
			elem.setAttribute('class','question');
			var elem = form.querySelector('#input-error-message');
			if (elem != null) elem.parentNode.removeChild(elem);
			elem = form.querySelector('#input-error');
			if (elem != null) elem.parentNode.removeChild(elem);
		},
		textCounter: function(event) {
			const field = event.target;
			const maxLimit = event.target.getAttribute("maxlength");

			var countfield = field.parentNode.querySelector(".counter-msg");
			if (field.value.length > maxLimit) {
				field.value = field.value.substring(0, maxLimit);
				countfield.innerText = '0 characters left';
				return false;
			} else {
				countfield.innerText = "" + (maxLimit - field.value.length) + " characters left";
			}
		},
		loadButton: function() {
			// Add a landmark for button
			this.landmarkElement = d.createElement('div');
			this.landmarkElement.setAttribute('aria-label', 'Feedback button');
			this.landmarkElement.setAttribute('role', 'complementary');

			// Add the fixed, floating tab button
			this.buttonEl = d.createElement('a');
			this.buttonEl.setAttribute('id', 'fba-button');
			this.buttonEl.setAttribute('data-id', this.options.formId);
			this.buttonEl.setAttribute('class', 'fba-button fixed-tab-button usa-button');
			this.buttonEl.setAttribute('name', 'fba-button');
			this.buttonEl.setAttribute('href', 'javascript:void(0)');
			this.buttonEl.setAttribute('aria-haspopup', 'dialog');
			this.buttonEl.setAttribute('aria-controls', this.modalId());
			this.buttonEl.setAttribute('data-open-modal', '');
			this.buttonEl.innerHTML = this.options.modalButtonText;
			this.buttonEl.addEventListener('click', () => d.dispatchEvent(new Event('onTouchpointsModalOpen')));
			this.landmarkElement.appendChild(this.buttonEl);
			d.body.appendChild(this.landmarkElement);

			this.loadFeebackSkipLink();
		},
		loadFeebackSkipLink: function() {
			this.skipLink = d.createElement('a');
			this.skipLink.setAttribute('class', 'usa-skipnav touchpoints-skipnav');
			this.skipLink.setAttribute('href', '#fba-button');
			this.skipLink.addEventListener('click', function() {
				d.querySelector("#fba-button").focus();
			});
			this.skipLink.innerHTML = 'Skip to feedback';

			var existingSkipLinks = d.querySelector('.usa-skipnav');
			if(existingSkipLinks) {
				existingSkipLinks.insertAdjacentElement('afterend', this.skipLink);
			} else {
				d.body.prepend(this.skipLink);
			}
		},
		sendFeedback: function() {
			d.dispatchEvent(new Event('onTouchpointsFormSubmission'));
			var form = this.formElement();
			this.ajaxPost(form, this.formSuccess);
		},
		successHeadingText: function() {
			return this.options.successTextHeading;
		},
		successText: function() {
			return this.options.successText;
		},
		showFormSuccess: function(e) {
			var formComponent = this.formComponent();
			var formElement = this.formElement();
			var alertElement = formComponent.querySelector(".fba-alert");
			var alertElementHeading = formComponent.querySelector(".usa-alert__heading");
			var alertElementBody = formComponent.querySelector(".usa-alert__text");

			// Display success Message
			alertElementHeading.innerHTML += this.successHeadingText();
			alertElementBody.innerHTML = this.successText();
			alertElement.removeAttribute("hidden");
			this.formComponent().scrollIntoView();

			// Hide Form Elements
			if (formElement) {
				// And clear the Form's Fields
				formElement.reset();
				if (formElement.querySelector('.touchpoints-form-body')) {
					var formBody = formElement.querySelector('.touchpoints-form-body');
					if(formBody) {
						formBody.setAttribute("hidden", true);
					}
				}
				if (formComponent.querySelector('.touchpoints-form-disclaimer')) {
					var formDisclaimer = formComponent.querySelector('.touchpoints-form-disclaimer');
					if(formDisclaimer) {
						formDisclaimer.setAttribute("hidden", true);
					}
				}

			}
		},
		resetFormDisplay: function() {
			if (this.successState === false) {
				return false;
			}

			// Hide and Reset Flash Message
			this.resetErrors();

			// Re-enable Submit Button
			var formElement = this.formElement();
			var submitButton = formElement.querySelector("[type='submit']");
			submitButton.disabled = false;

			// Show Form Elements
			if (formElement) {
				if (formElement.querySelector('.touchpoints-form-body')) {
					var formBody = formElement.querySelector('.touchpoints-form-body')
					if(formBody) {
						formBody.removeAttribute("hidden");
					}
				}
			}
		},
		formSuccess: function(e) {
			// Clear the alert box
			var formComponent = this.formComponent();
			var alertElement = formComponent.querySelector(".fba-alert");
			var alertElementBody = formComponent.getElementsByClassName("usa-alert__text")[0];
			var alertErrorElement = formComponent.querySelector(".fba-alert-error");
			var alertErrorElementBody = alertErrorElement.getElementsByClassName("usa-alert__text")[0];
			alertElementBody.innerHTML = "";
			alertErrorElementBody.innerHTML = "";

			var formElement = this.formElement();
			var submitButton = formElement.querySelector("[type='submit']");

			if (e.target.readyState === 4) {
	      		if (e.target.status === 201) { // SUCCESS!
					this.successState = true;
					d.dispatchEvent(new Event('onTouchpointsFormSubmissionSuccess'));
					this.isFormSubmitted = true;
					if(submitButton) {
						submitButton.disabled = true;
					}
					this.showFormSuccess();
				} else if (e.target.status === 422) { // FORM ERRORS
					this.successState = false;
					d.dispatchEvent(new Event('onTouchpointsFormSubmissionError'));
					if(submitButton) {
						submitButton.disabled = false;
					}

					var jsonResponse = JSON.parse(e.target.response);
					var errors = jsonResponse.messages;

					for (var err in errors) {
						if (errors.hasOwnProperty(err)) {
							alertErrorElementBody.innerHTML += err;
							alertErrorElementBody.innerHTML += " ";
							alertErrorElementBody.innerHTML += errors[err];
							alertErrorElementBody.innerHTML += "<br />";
						}
					}

					alertErrorElement.removeAttribute("hidden");
				} else { // OTHER SERVER ERROR
					alertErrorElement.removeAttribute("hidden");
					alertErrorElementBody.innerHTML += "Server error. We're sorry, but this submission was not successful. The Product Team has been notified.";
				}
			}
		},
		ajaxPost: function (form, callback) {
	    var url = form.action;
	    var xhr = new XMLHttpRequest();
			// for each form question
			var params = this.options.questionParams(form);

			// Combine Referrer and Pathname with Form-specific params
			params["referer"] = d.referrer;
			params["hostname"] = N.location.hostname;
			params["page"] = N.location.pathname;
			params["location_code"] = form.querySelector("#fba_location_code") ? form.querySelector("#fba_location_code").value : null;
			params["fba_directive"] = form.querySelector("#fba_directive") ? form.querySelector("#fba_directive").value : null;
			params["language"] = "en";

			// Submit Feedback with a POST
			xhr.open("POST", url);
			xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8;");
			xhr.onload = callback.bind(this);
			xhr.send(JSON.stringify({
				"submission": params,
			}));
		},
		currentPageNumber: 1, // start at 1
		showInstructions: function() {
			const instructions = this.formComponent().getElementsByClassName("fba-instructions")[0];

			if(instructions) {
				if (this.currentPageNumber == 1) {
					instructions.removeAttribute("hidden");
				} else {
					instructions.setAttribute("hidden", true);
				}
			}

			const requiredQuestionsNotice = this.formComponent().getElementsByClassName("required-questions-notice")[0];
			if(requiredQuestionsNotice) {
				if (this.currentPageNumber == 1) {
					requiredQuestionsNotice.removeAttribute("hidden");
				} else {
					requiredQuestionsNotice.setAttribute("hidden", true);
				}
			}
		},
		_pagination: function() {
			var previousButtons = this.formComponent().getElementsByClassName("previous-section");
			var nextButtons =  this.formComponent().getElementsByClassName("next-section");

			var self = this;
			for (var i = 0; i < previousButtons.length; i++) {
				previousButtons[i].addEventListener('click', function(e) {
					e.preventDefault();
					var currentPage = e.target.closest(".section");
					if (!this.validateForm(currentPage)) return false;
					currentPage.classList.remove("fba-visible");
					this.currentPageNumber--;
					this.showInstructions();
					currentPage.previousElementSibling.classList.add("fba-visible");

					const previousPageEvent = new CustomEvent('onTouchpointsFormPreviousPage', {
						detail: {
							formComponent: this
						}
					});
					d.dispatchEvent(previousPageEvent);

					// if in a modal, scroll to the top of the modal on previous button click
					if(this.formComponent().getElementsByClassName("fba-modal")[0]) {
						this.formComponent().scrollTo(0,0);
					} else {
						N.scrollTo(0, 0);
					}
				}.bind(self));
			}
			for (var i = 0; i < nextButtons.length; i++) {
				nextButtons[i].addEventListener('click', function(e) {
					e.preventDefault();
					var currentPage = e.target.closest(".section");
					if (!this.validateForm(currentPage)) return false;
					currentPage.classList.remove("fba-visible");
					this.currentPageNumber++;
					this.showInstructions();
					currentPage.nextElementSibling.classList.add("fba-visible");

					const nextPageEvent = new CustomEvent('onTouchpointsFormNextPage', {
						detail: {
							formComponent: this
						}
					});
					d.dispatchEvent(nextPageEvent);

					// if in a modal, scroll to the top of the modal on next button click
					if(this.formComponent().getElementsByClassName("fba-modal")[0]) {
						this.formComponent().scrollTo(0,0);
					} else {
						N.scrollTo(0, 0);
					}
				}.bind(self))
			}
		},
		modalId: function() {
			return `fba-modal-${this.options.formId}`;
		},
	};
};

// Specify the options for your form
var touchpointFormOptions2dcadeaf = {
	'formId': "2dcadeaf",
	'modalButtonText': "Help improve this site",
	'elementSelector': "touchpoints-yes-no-form",
	'css' : ".fba-modal-dialog {\n  font-family: Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size: 100%;\n}\n\n.fba-modal-dialog h1 {\n  margin-right: 20px;\n  margin-top: -1rem;\n  word-wrap: break-word;\n}\n\n.fba-inline-container {\n  background: #fff;\n  border: 1px solid #E5E5E5;\n  max-width: 35rem;\n  margin: 0 auto 40px auto;\n}\n\n.fixed-tab-button {\n  bottom: 0;\n  padding: 5px 10px;\n  position: fixed;\n  right: 12px;\n  z-index: 9999;\n\n}\n#fba-button.usa-button:hover,\n.fixed-tab-button.usa-button:hover {\n  color:white;\n  background-color:#1a4480;\n  border-bottom:0;\n  text-decoration:none;\n}\n\n#fba-text-name, #fba-text-email {\n  max-width: 100% !important;\n  font-size: 100%\n}\n\n/* Form Sections */\n.touchpoints-form-wrapper form div.section {\n  display: none;\n}\n.touchpoints-form-wrapper form div.section.fba-visible {\n  display: block;\n}\n\n.hide {\n  display: none;\n}\n\n/* This file was generated by the gulp task \'compileWidgetSass\'. */\n\n@charset \"UTF-8\";\n.usa-js-no-click{\n  pointer-events:none;\n  -webkit-user-select:none;\n     -moz-user-select:none;\n          user-select:none;\n}\n.usa-js-no-click .fba-usa-modal,\n.usa-js-no-click .fba-usa-modal *{\n  pointer-events:auto;\n  -webkit-user-select:text;\n     -moz-user-select:text;\n          user-select:text;\n}\n\n[data-open-modal] *{\n  pointer-events:none;\n}\n\n.fba-usa-modal-wrapper{\n  text-align:center;\n  transition:opacity 0.15s ease-in-out;\n}\n.fba-usa-modal-wrapper.is-hidden{\n  visibility:hidden;\n  opacity:0;\n  position:fixed;\n}\n.fba-usa-modal-wrapper.is-visible{\n  visibility:visible;\n  opacity:1;\n  position:fixed;\n  z-index:99999;\n}\n\n.fba-usa-modal-overlay{\n  background:rgba(0, 0, 0, 0.7);\n  bottom:0;\n  height:100%;\n  left:0;\n  overflow:scroll;\n  overflow-x:hidden;\n  padding:1.5rem;\n  position:fixed;\n  scroll-behavior:smooth;\n  top:0;\n  width:100%;\n}\n.fba-usa-modal-overlay:before{\n  content:\"\";\n  display:inline-block;\n  height:100%;\n  vertical-align:middle;\n}\n.fba-usa-modal-overlay[data-force-action=true]{\n  pointer-events:none;\n}\n.fba-usa-modal-overlay[data-force-action=true] *{\n  pointer-events:auto;\n}\n\n.usa-js-loading .fba-usa-modal-wrapper{\n  position:absolute;\n  left:-999em;\n  right:auto;\n}\n.usa-js-loading .fba-usa-modal-wrapper:target{\n  position:static;\n}\n\n.fba-usa-modal{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  border-radius:0.5rem;\n  background:white;\n  color:#1b1b1b;\n  display:inline-block;\n  margin:1.25rem auto;\n  max-width:35rem;\n  position:relative;\n  text-align:left;\n  vertical-align:middle;\n  width:100%;\n}\n.fba-usa-modal:focus{\n  outline:none;\n}\n\n.fba-usa-modal__content{\n  display:flex;\n  flex-direction:column-reverse;\n  padding-top:2rem;\n  width:100%;\n}\n\n.fba-usa-modal__main{\n  margin:0 auto;\n  padding:0.5rem 2rem 2rem;\n}\n\n.fba-usa-modal-wrapper [data-close-modal] > .usa-icon,\n.fba-usa-modal-wrapper [data-close-modal] > .usa-icon use{\n  pointer-events:none !important;\n}\n\n.fba-modal .fba-usa-modal__content .fba-usa-modal__close{\n  align-items:center;\n  align-self:flex-end;\n  background-color:transparent;\n  color:#71767a;\n  display:flex;\n  flex-shrink:0;\n  font-size:0.93rem;\n  margin:-2rem 0 0 auto;\n  padding:0.25rem 0.25rem;\n  width:auto;\n}\n.fba-modal .fba-usa-modal__content .fba-usa-modal__close:hover, .fba-modal .fba-usa-modal__content .fba-usa-modal__close:active{\n  background-color:transparent;\n  color:#1b1b1b;\n}\n.fba-modal .fba-usa-modal__content .fba-usa-modal__close:focus{\n  outline-offset:0;\n}\n.fba-modal .fba-usa-modal__content .fba-usa-modal__close .usa-icon{\n  height:2rem;\n  margin:2px 2px 0 0;\n  width:2rem;\n}\n\n.fba-usa-modal__heading{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:1.34rem;\n  line-height:1.4;\n  margin-top:0;\n}\n\n.fba-usa-modal__footer{\n  margin-top:1.5rem;\n}\n\n.fba-usa-modal--lg{\n  max-width:55rem;\n  width:100%;\n}\n.fba-usa-modal--lg .fba-usa-modal__main{\n  padding-bottom:4rem;\n  padding-top:1.25rem;\n  width:100%;\n  max-width:40rem;\n}\n@media all and (min-width: 40em){\n  .fba-usa-modal--lg .fba-usa-modal__heading{\n    font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n    font-size:1.95rem;\n  }\n}\n\n.usa-js-modal--active{\n  overflow:hidden;\n}\n\n.fba-modal-dialog{\n}\n.fba-modal-dialog .usa-textarea, .fba-modal-dialog .usa-select, .fba-modal-dialog .usa-range, .fba-modal-dialog .usa-radio__label, .fba-modal-dialog .usa-input, .fba-modal-dialog .usa-hint, .fba-modal-dialog .usa-fieldset, .fba-modal-dialog .usa-combo-box__input, .fba-modal-dialog .usa-combo-box__list, .fba-modal-dialog .usa-checkbox__label{\n  box-sizing:border-box;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.3;\n}\n.fba-modal-dialog .usa-textarea, .fba-modal-dialog .usa-select, .fba-modal-dialog .usa-range, .fba-modal-dialog .usa-input, .fba-modal-dialog .usa-combo-box__input{\n  border-width:1px;\n  border-color:#565c65;\n  border-style:solid;\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  border-radius:0;\n  color:#1b1b1b;\n  display:block;\n  height:2.5rem;\n  margin-top:0.5rem;\n  max-width:none;\n  padding:0.5rem;\n  width:100%;\n}\n.fba-modal-dialog .usa-accordion{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n  color:#1b1b1b;\n  margin:0;\n  padding:0;\n  width:100%;\n  box-sizing:border-box;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n}\n.fba-modal-dialog .usa-accordion > li{\n  margin-bottom:0;\n  max-width:unset;\n}\n.fba-modal-dialog .usa-accordion > ul li ul{\n  list-style:disc;\n}\n.fba-modal-dialog .usa-accordion > ul li ul > li > ul{\n  list-style:circle;\n}\n.fba-modal-dialog .usa-accordion > ul li ul > li > ul > li > ul{\n  list-style:square;\n}\n.fba-modal-dialog .usa-accordion::after, .fba-modal-dialog .usa-accordion::before, .fba-modal-dialog .usa-accordion *, .fba-modal-dialog .usa-accordion *::after, .fba-modal-dialog .usa-accordion *::before{\n  box-sizing:inherit;\n}\n.fba-modal-dialog .usa-accordion + .usa-accordion,\n.fba-modal-dialog .usa-accordion + .usa-accordion--bordered{\n  margin-top:0.5rem;\n}\n.fba-modal-dialog .usa-accordion--bordered .usa-accordion__content{\n  border-bottom:0.25rem solid #f0f0f0;\n  border-left:0.25rem solid #f0f0f0;\n  border-right:0.25rem solid #f0f0f0;\n  padding-bottom:1rem;\n}\n.fba-modal-dialog .usa-accordion--bordered .usa-accordion__heading{\n  margin-bottom:0;\n}\n.fba-modal-dialog .usa-accordion__heading,\n.fba-modal-dialog .usa-prose .usa-accordion__heading{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:0.9;\n  margin:0;\n}\n.fba-modal-dialog .usa-accordion__heading:not(:first-child),\n.fba-modal-dialog .usa-prose .usa-accordion__heading:not(:first-child){\n  margin-top:0.5rem;\n}\n.fba-modal-dialog .usa-accordion__content{\n  color:#1b1b1b;\n  background-color:white;\n  margin-top:0;\n  overflow:auto;\n  padding:1rem 1.25rem calc(1rem - 0.25rem) 1.25rem;\n}\n.fba-modal-dialog .usa-accordion__content > *:first-child{\n  margin-top:0;\n}\n.fba-modal-dialog .usa-accordion__content > *:last-child{\n  margin-bottom:0;\n}\n.fba-modal-dialog .usa-accordion__button{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n  color:#1b1b1b;\n  background-color:#f0f0f0;\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/remove.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-position:right 1.25rem center;\n  background-size:1.5rem;\n  cursor:pointer;\n  display:inline-block;\n  font-weight:700;\n  margin:0;\n  padding:1rem 3.5rem 1rem 1.25rem;\n  text-decoration:none;\n  width:100%;\n}\n.fba-modal-dialog .usa-accordion__button:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-accordion__button:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-accordion__button:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-accordion__button:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-accordion__button:hover, .fba-modal-dialog .usa-accordion__button.usa-button--hover, .fba-modal-dialog .usa-accordion__button:disabled:hover, .fba-modal-dialog .usa-accordion__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-accordion__button:disabled.usa-button--hover, .fba-modal-dialog .usa-accordion__button[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-accordion__button:active, .fba-modal-dialog .usa-accordion__button.usa-button--active, .fba-modal-dialog .usa-accordion__button:disabled:active, .fba-modal-dialog .usa-accordion__button[aria-disabled=true]:active, .fba-modal-dialog .usa-accordion__button:disabled.usa-button--active, .fba-modal-dialog .usa-accordion__button[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-accordion__button:disabled:focus, .fba-modal-dialog .usa-accordion__button[aria-disabled=true]:focus, .fba-modal-dialog .usa-accordion__button:disabled.usa-focus, .fba-modal-dialog .usa-accordion__button[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-accordion__button:disabled, .fba-modal-dialog .usa-accordion__button[aria-disabled=true], .fba-modal-dialog .usa-accordion__button.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-accordion__button.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-accordion__button.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-accordion__button:disabled, .fba-modal-dialog .usa-accordion__button[aria-disabled=true], .fba-modal-dialog .usa-accordion__button:disabled:hover, .fba-modal-dialog .usa-accordion__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-accordion__button[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-accordion__button:disabled, .fba-modal-dialog .usa-accordion__button[aria-disabled=true], .fba-modal-dialog .usa-accordion__button:disabled:hover, .fba-modal-dialog .usa-accordion__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-accordion__button[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-accordion__button:hover{\n  color:#1b1b1b;\n  background-color:#dfe1e2;\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/remove.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  text-decoration:none;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-accordion__button{\n    border:2px solid transparent;\n    position:relative;\n  }\n  .fba-modal-dialog .usa-accordion__button::before{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/remove.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1.5rem 1.5rem;\n    display:inline-block;\n    height:1.5rem;\n    width:1.5rem;\n    height:100%;\n    position:absolute;\n    right:1.25rem;\n    top:0;\n    content:\"\";\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-accordion__button::before{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/remove.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/remove.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1.5rem 1.5rem;\n              mask-size:1.5rem 1.5rem;\n    }\n  }\n}\n.fba-modal-dialog .usa-accordion__button[aria-expanded=false]{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/add.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-size:1.5rem;\n}\n.fba-modal-dialog .usa-accordion__button[aria-expanded=false]:hover{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/add.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-accordion__button[aria-expanded=false]::before{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/add.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1.5rem 1.5rem;\n    display:inline-block;\n    height:1.5rem;\n    width:1.5rem;\n    height:100%;\n    position:absolute;\n    right:1.25rem;\n    top:0;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-accordion__button[aria-expanded=false]::before{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/add.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/add.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1.5rem 1.5rem;\n              mask-size:1.5rem 1.5rem;\n    }\n  }\n}\n.fba-modal-dialog .usa-alert{\n  background-color:#f0f0f0;\n  border-left:0.5rem solid #a9aeb1;\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-alert .usa-alert__body{\n  box-sizing:border-box;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  padding-bottom:1rem;\n  padding-top:1rem;\n  position:relative;\n}\n.fba-modal-dialog .usa-alert .usa-alert__body::after, .fba-modal-dialog .usa-alert .usa-alert__body::before, .fba-modal-dialog .usa-alert .usa-alert__body *, .fba-modal-dialog .usa-alert .usa-alert__body *::after, .fba-modal-dialog .usa-alert .usa-alert__body *::before{\n  box-sizing:inherit;\n}\n.fba-modal-dialog .usa-alert .usa-alert__text{\n  margin-bottom:0;\n  margin-top:0;\n}\n.fba-modal-dialog .usa-alert .usa-alert__text:only-child{\n  padding-bottom:0;\n  padding-top:0;\n}\n.fba-modal-dialog .usa-alert .usa-alert__heading{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.46rem;\n  line-height:0.9;\n  margin-top:0;\n  margin-bottom:0.5rem;\n}\n.fba-modal-dialog .usa-alert > .usa-list,\n.fba-modal-dialog .usa-alert .usa-alert__body > .usa-list{\n  padding-left:2ch;\n}\n.fba-modal-dialog .usa-alert > .usa-list:last-child,\n.fba-modal-dialog .usa-alert .usa-alert__body > .usa-list:last-child{\n  margin-bottom:0;\n}\n.fba-modal-dialog .usa-alert .usa-alert__body{\n  padding-left:1.25rem;\n  padding-right:1.25rem;\n}\n.fba-modal-dialog .usa-alert .usa-alert__body::before{\n  left:1.0833333333rem;\n}\n.fba-modal-dialog * + .usa-alert{\n  margin-top:1rem;\n}\n.fba-modal-dialog .usa-alert--success{\n  background-color:#ecf3ec;\n  border-left-color:#00a91c;\n}\n.fba-modal-dialog .usa-alert--success .usa-alert__body{\n  color:#1b1b1b;\n  background-color:#ecf3ec;\n  display:flex;\n  flex-direction:column;\n  justify-content:center;\n  min-height:3.3333333333rem;\n}\n.fba-modal-dialog .usa-alert--success .usa-alert__body::before{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/check_circle.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:2rem 2rem;\n  display:inline-block;\n  height:2rem;\n  width:2rem;\n  content:\"\";\n  display:block;\n  position:absolute;\n  top:0.6666666667rem;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-alert--success .usa-alert__body::before{\n    background:none;\n    background-color:#1b1b1b;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/check_circle.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/check_circle.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:2rem 2rem;\n            mask-size:2rem 2rem;\n  }\n}\n.fba-modal-dialog .usa-alert--success .usa-alert__body > *{\n  margin-left:2.5rem;\n}\n.fba-modal-dialog .usa-alert--success .usa-alert__body .usa-link{\n  color:#005ea2;\n}\n.fba-modal-dialog .usa-alert--success .usa-alert__body .usa-link:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-alert--success .usa-alert__body .usa-link:hover, .fba-modal-dialog .usa-alert--success .usa-alert__body .usa-link:active{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-alert--warning{\n  background-color:#faf3d1;\n  border-left-color:#ffbe2e;\n}\n.fba-modal-dialog .usa-alert--warning .usa-alert__body{\n  color:#1b1b1b;\n  background-color:#faf3d1;\n  display:flex;\n  flex-direction:column;\n  justify-content:center;\n  min-height:3.3333333333rem;\n}\n.fba-modal-dialog .usa-alert--warning .usa-alert__body::before{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/warning.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:2rem 2rem;\n  display:inline-block;\n  height:2rem;\n  width:2rem;\n  content:\"\";\n  display:block;\n  position:absolute;\n  top:0.6666666667rem;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-alert--warning .usa-alert__body::before{\n    background:none;\n    background-color:#1b1b1b;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/warning.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/warning.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:2rem 2rem;\n            mask-size:2rem 2rem;\n  }\n}\n.fba-modal-dialog .usa-alert--warning .usa-alert__body > *{\n  margin-left:2.5rem;\n}\n.fba-modal-dialog .usa-alert--warning .usa-alert__body .usa-link{\n  color:#005ea2;\n}\n.fba-modal-dialog .usa-alert--warning .usa-alert__body .usa-link:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-alert--warning .usa-alert__body .usa-link:hover, .fba-modal-dialog .usa-alert--warning .usa-alert__body .usa-link:active{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-alert--error{\n  background-color:#f4e3db;\n  border-left-color:#d54309;\n}\n.fba-modal-dialog .usa-alert--error .usa-alert__body{\n  color:#1b1b1b;\n  background-color:#f4e3db;\n  display:flex;\n  flex-direction:column;\n  justify-content:center;\n  min-height:3.3333333333rem;\n}\n.fba-modal-dialog .usa-alert--error .usa-alert__body::before{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/error.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:2rem 2rem;\n  display:inline-block;\n  height:2rem;\n  width:2rem;\n  content:\"\";\n  display:block;\n  position:absolute;\n  top:0.6666666667rem;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-alert--error .usa-alert__body::before{\n    background:none;\n    background-color:#1b1b1b;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/error.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/error.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:2rem 2rem;\n            mask-size:2rem 2rem;\n  }\n}\n.fba-modal-dialog .usa-alert--error .usa-alert__body > *{\n  margin-left:2.5rem;\n}\n.fba-modal-dialog .usa-alert--error .usa-alert__body .usa-link{\n  color:#005ea2;\n}\n.fba-modal-dialog .usa-alert--error .usa-alert__body .usa-link:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-alert--error .usa-alert__body .usa-link:hover, .fba-modal-dialog .usa-alert--error .usa-alert__body .usa-link:active{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-alert--info{\n  background-color:#e7f6f8;\n  border-left-color:#00bde3;\n}\n.fba-modal-dialog .usa-alert--info .usa-alert__body{\n  color:#1b1b1b;\n  background-color:#e7f6f8;\n  display:flex;\n  flex-direction:column;\n  justify-content:center;\n  min-height:3.3333333333rem;\n}\n.fba-modal-dialog .usa-alert--info .usa-alert__body::before{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/info.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:2rem 2rem;\n  display:inline-block;\n  height:2rem;\n  width:2rem;\n  content:\"\";\n  display:block;\n  position:absolute;\n  top:0.6666666667rem;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-alert--info .usa-alert__body::before{\n    background:none;\n    background-color:#1b1b1b;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/info.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/info.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:2rem 2rem;\n            mask-size:2rem 2rem;\n  }\n}\n.fba-modal-dialog .usa-alert--info .usa-alert__body > *{\n  margin-left:2.5rem;\n}\n.fba-modal-dialog .usa-alert--info .usa-alert__body .usa-link{\n  color:#005ea2;\n}\n.fba-modal-dialog .usa-alert--info .usa-alert__body .usa-link:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-alert--info .usa-alert__body .usa-link:hover, .fba-modal-dialog .usa-alert--info .usa-alert__body .usa-link:active{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-alert--emergency{\n  background-color:#9c3d10;\n  border-left-color:#9c3d10;\n}\n.fba-modal-dialog .usa-alert--emergency .usa-alert__body{\n  color:white;\n  background-color:#9c3d10;\n  display:flex;\n  flex-direction:column;\n  justify-content:center;\n  min-height:3.3333333333rem;\n}\n.fba-modal-dialog .usa-alert--emergency .usa-alert__body::before{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons-bg/error--white.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:2rem 2rem;\n  display:inline-block;\n  height:2rem;\n  width:2rem;\n  content:\"\";\n  display:block;\n  position:absolute;\n  top:0.6666666667rem;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-alert--emergency .usa-alert__body::before{\n    background:none;\n    background-color:white;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/error.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/error.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:2rem 2rem;\n            mask-size:2rem 2rem;\n  }\n}\n.fba-modal-dialog .usa-alert--emergency .usa-alert__body > *{\n  margin-left:2.5rem;\n}\n.fba-modal-dialog .usa-alert--emergency .usa-alert__body .usa-link{\n  color:#dfe1e2;\n}\n.fba-modal-dialog .usa-alert--emergency .usa-alert__body .usa-link:visited{\n  color:#dfe1e2;\n}\n.fba-modal-dialog .usa-alert--emergency .usa-alert__body .usa-link:hover, .fba-modal-dialog .usa-alert--emergency .usa-alert__body .usa-link:active{\n  color:#f0f0f0;\n}\n.fba-modal-dialog .usa-alert--slim .usa-alert__body{\n  padding-bottom:0.5rem;\n  padding-top:0.5rem;\n  min-height:0;\n}\n.fba-modal-dialog .usa-alert--slim .usa-alert__body:before{\n  height:1.5rem;\n  top:0.5rem;\n  width:1.5rem;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-alert--slim .usa-alert__body:before{\n    -webkit-mask-size:1.5rem;\n            mask-size:1.5rem;\n  }\n}\n.fba-modal-dialog .usa-alert--slim .usa-alert__body > *{\n  margin-left:2rem;\n}\n.fba-modal-dialog .usa-alert--slim .usa-alert__body::before{\n  left:1.125rem;\n}\n.fba-modal-dialog .usa-alert--no-icon .usa-alert__body{\n  min-height:0;\n}\n.fba-modal-dialog .usa-alert--no-icon .usa-alert__body:before{\n  display:none;\n}\n.fba-modal-dialog .usa-alert--no-icon .usa-alert__body > *{\n  margin-left:0;\n}\n.fba-modal-dialog .usa-alert--validation .usa-checklist{\n  margin-top:1rem;\n}\n.fba-modal-dialog .usa-banner{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  box-sizing:border-box;\n  background-color:#f0f0f0;\n}\n.fba-modal-dialog .usa-banner::after, .fba-modal-dialog .usa-banner::before, .fba-modal-dialog .usa-banner *, .fba-modal-dialog .usa-banner *::after, .fba-modal-dialog .usa-banner *::before{\n  box-sizing:inherit;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner{\n    font-size:0.87rem;\n    padding-bottom:0rem;\n  }\n}\n.fba-modal-dialog .usa-banner .usa-accordion{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n}\n.fba-modal-dialog .usa-banner .grid-row{\n  display:flex;\n  flex-wrap:wrap;\n  box-sizing:border-box;\n}\n.fba-modal-dialog .usa-banner .grid-row.grid-gap-lg{\n  margin-left:-0.75rem;\n  margin-right:-0.75rem;\n}\n.fba-modal-dialog .usa-banner .grid-row.grid-gap-lg > *{\n  box-sizing:border-box;\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner .grid-row .tablet\\:grid-col-6{\n    box-sizing:border-box;\n    flex:0 1 auto;\n    width:50%;\n  }\n}\n.fba-modal-dialog .usa-banner__header,\n.fba-modal-dialog .usa-banner__content{\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-banner__content{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  box-sizing:border-box;\n  padding-left:1rem;\n  padding-right:1rem;\n  background-color:transparent;\n  font-size:1rem;\n  overflow:hidden;\n  padding-bottom:1rem;\n  padding-left:0.5rem;\n  padding-top:0.25rem;\n  width:100%;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-banner__content{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-banner__content{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__content{\n    padding-bottom:1.5rem;\n    padding-top:1.5rem;\n  }\n}\n.fba-modal-dialog .usa-banner__content p:first-child{\n  margin:0;\n}\n.fba-modal-dialog .usa-banner__guidance{\n  display:flex;\n  align-items:flex-start;\n  max-width:64ex;\n  padding-top:1rem;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__guidance{\n    padding-top:0rem;\n  }\n}\n.fba-modal-dialog .usa-banner__lock-image{\n  height:1.5ex;\n  width:1.21875ex;\n}\n.fba-modal-dialog .usa-banner__lock-image path{\n  fill:currentColor;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-banner__lock-image path{\n    fill:CanvasText;\n  }\n}\n.fba-modal-dialog .usa-banner__inner{\n  padding-left:1rem;\n  padding-right:1rem;\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  box-sizing:border-box;\n  display:flex;\n  flex-wrap:wrap;\n  box-sizing:border-box;\n  align-items:flex-start;\n  padding-right:0rem;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-banner__inner{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-banner__inner{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__inner{\n    align-items:center;\n  }\n}\n.fba-modal-dialog .usa-banner__header{\n  padding-bottom:0.5rem;\n  padding-top:0.5rem;\n  font-size:0.8rem;\n  font-weight:normal;\n  min-height:3rem;\n  position:relative;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__header{\n    padding-bottom:0.25rem;\n    padding-top:0.25rem;\n    min-height:0;\n  }\n}\n.fba-modal-dialog .usa-banner__header-text{\n  margin-bottom:0;\n  margin-top:0;\n  font-size:0.8rem;\n  line-height:1.1;\n}\n.fba-modal-dialog .usa-banner__header-action{\n  color:#005ea2;\n  line-height:1.1;\n  margin-bottom:0rem;\n  margin-top:2px;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-banner__header-action::after{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:1rem 1rem;\n  display:inline-block;\n  height:1rem;\n  width:1rem;\n  content:\"\";\n  vertical-align:middle;\n  margin-left:auto;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-banner__header-action::after{\n    background:none;\n    background-color:#005ea2;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:1rem 1rem;\n            mask-size:1rem 1rem;\n  }\n  .fba-modal-dialog .usa-banner__header-action::after:hover{\n    background-color:#1a4480;\n  }\n}\n.fba-modal-dialog .usa-banner__header-action:hover::after{\n  content:\"\";\n  background-color:#1a4480;\n}\n.fba-modal-dialog .usa-banner__header-action:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-banner__header-action:hover, .fba-modal-dialog .usa-banner__header-action:active{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-banner__header--expanded .usa-banner__header-action{\n  display:none;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__header-action{\n    display:none;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-banner__header-action{\n    color:LinkText;\n  }\n  .fba-modal-dialog .usa-banner__header-action::after{\n    background-color:ButtonText;\n  }\n}\n.fba-modal-dialog .usa-banner__header-flag{\n  float:left;\n  margin-right:0.5rem;\n  width:1rem;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__header-flag{\n    margin-right:0.5rem;\n    padding-top:0rem;\n  }\n}\n.fba-modal-dialog .usa-banner__header--expanded{\n  padding-right:3.5rem;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__header--expanded{\n    background-color:transparent;\n    display:block;\n    font-size:0.8rem;\n    font-weight:normal;\n    min-height:0rem;\n    padding-right:0rem;\n  }\n}\n.fba-modal-dialog .usa-banner__header--expanded .usa-banner__inner{\n  margin-left:0rem;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__header--expanded .usa-banner__inner{\n    margin-left:auto;\n  }\n}\n.fba-modal-dialog .usa-banner__header--expanded .usa-banner__header-action{\n  display:none;\n}\n.fba-modal-dialog .usa-banner__button{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n  position:absolute;\n  left:0;\n  position:absolute;\n  bottom:0;\n  top:0;\n  color:#005ea2;\n  text-decoration:underline;\n  color:#005ea2;\n  display:block;\n  font-size:0.8rem;\n  height:auto;\n  line-height:1.1;\n  padding-top:0rem;\n  padding-left:0rem;\n  text-decoration:none;\n  width:auto;\n}\n.fba-modal-dialog .usa-banner__button:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-banner__button:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-banner__button:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-banner__button:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-banner__button:hover, .fba-modal-dialog .usa-banner__button.usa-button--hover, .fba-modal-dialog .usa-banner__button:disabled:hover, .fba-modal-dialog .usa-banner__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-banner__button:disabled.usa-button--hover, .fba-modal-dialog .usa-banner__button[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-banner__button:active, .fba-modal-dialog .usa-banner__button.usa-button--active, .fba-modal-dialog .usa-banner__button:disabled:active, .fba-modal-dialog .usa-banner__button[aria-disabled=true]:active, .fba-modal-dialog .usa-banner__button:disabled.usa-button--active, .fba-modal-dialog .usa-banner__button[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-banner__button:disabled:focus, .fba-modal-dialog .usa-banner__button[aria-disabled=true]:focus, .fba-modal-dialog .usa-banner__button:disabled.usa-focus, .fba-modal-dialog .usa-banner__button[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-banner__button:disabled, .fba-modal-dialog .usa-banner__button[aria-disabled=true], .fba-modal-dialog .usa-banner__button.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-banner__button.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-banner__button.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-banner__button:disabled, .fba-modal-dialog .usa-banner__button[aria-disabled=true], .fba-modal-dialog .usa-banner__button:disabled:hover, .fba-modal-dialog .usa-banner__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-banner__button[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-banner__button:disabled, .fba-modal-dialog .usa-banner__button[aria-disabled=true], .fba-modal-dialog .usa-banner__button:disabled:hover, .fba-modal-dialog .usa-banner__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-banner__button[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-banner__button:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-banner__button:hover, .fba-modal-dialog .usa-banner__button:active{\n  color:#1a4480;\n}\n@media all and (max-width: 39.99em){\n  .fba-modal-dialog .usa-banner__button{\n    width:100%;\n  }\n  .fba-modal-dialog .usa-banner__button:enabled:focus{\n    outline-offset:-0.25rem;\n  }\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__button{\n    color:#005ea2;\n    position:static;\n    bottom:auto;\n    left:auto;\n    right:auto;\n    top:auto;\n    display:inline;\n    margin-left:0.5rem;\n    position:relative;\n  }\n  .fba-modal-dialog .usa-banner__button::after{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1rem 1rem;\n    display:inline-block;\n    height:1rem;\n    width:1rem;\n    content:\"\";\n    vertical-align:middle;\n    margin-left:2px;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-banner__button::after{\n      background:none;\n      background-color:#005ea2;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1rem 1rem;\n              mask-size:1rem 1rem;\n    }\n    .fba-modal-dialog .usa-banner__button::after:hover{\n      background-color:#1a4480;\n    }\n  }\n  .fba-modal-dialog .usa-banner__button:hover::after{\n    content:\"\";\n    background-color:#1a4480;\n  }\n  .fba-modal-dialog .usa-banner__button:visited{\n    color:#54278f;\n  }\n  .fba-modal-dialog .usa-banner__button:hover, .fba-modal-dialog .usa-banner__button:active{\n    color:#1a4480;\n  }\n  .fba-modal-dialog .usa-banner__button::after, .fba-modal-dialog .usa-banner__button:hover::after{\n    position:absolute;\n  }\n}\n@media (min-width: 40em) and (forced-colors: active){\n  .fba-modal-dialog .usa-banner__button::after, .fba-modal-dialog .usa-banner__button:hover::after{\n    background-color:ButtonText;\n  }\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__button:hover{\n    text-decoration:none;\n  }\n}\n.fba-modal-dialog .usa-banner__button[aria-expanded=false], .fba-modal-dialog .usa-banner__button[aria-expanded=false]:hover, .fba-modal-dialog .usa-banner__button[aria-expanded=true], .fba-modal-dialog .usa-banner__button[aria-expanded=true]:hover{\n  background-image:none;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-banner__button[aria-expanded=false]::before, .fba-modal-dialog .usa-banner__button[aria-expanded=false]:hover::before, .fba-modal-dialog .usa-banner__button[aria-expanded=true]::before, .fba-modal-dialog .usa-banner__button[aria-expanded=true]:hover::before{\n    content:none;\n  }\n}\n@media all and (max-width: 39.99em){\n  .fba-modal-dialog .usa-banner__button[aria-expanded=true]::after{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/close.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1.5rem 1.5rem;\n    display:inline-block;\n    height:3rem;\n    width:3rem;\n    content:\"\";\n    vertical-align:middle;\n    margin-left:0rem;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-banner__button[aria-expanded=true]::after{\n      background:none;\n      background-color:#005ea2;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/close.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/close.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1.5rem 1.5rem;\n              mask-size:1.5rem 1.5rem;\n    }\n  }\n  .fba-modal-dialog .usa-banner__button[aria-expanded=true]::before{\n    position:absolute;\n    bottom:0;\n    top:0;\n    position:absolute;\n    right:0;\n    background-color:#dfe1e2;\n    content:\"\";\n    display:block;\n    height:3rem;\n    width:3rem;\n  }\n  .fba-modal-dialog .usa-banner__button[aria-expanded=true]::after{\n    position:absolute;\n    bottom:0;\n    top:0;\n    position:absolute;\n    right:0;\n  }\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__button[aria-expanded=true]{\n    height:auto;\n    padding:0rem;\n    position:relative;\n  }\n  .fba-modal-dialog .usa-banner__button[aria-expanded=true]::after{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_less.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1rem 1rem;\n    display:inline-block;\n    height:1rem;\n    width:1rem;\n    content:\"\";\n    vertical-align:middle;\n    margin-left:2px;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-banner__button[aria-expanded=true]::after{\n      background:none;\n      background-color:#005ea2;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_less.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_less.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1rem 1rem;\n              mask-size:1rem 1rem;\n    }\n    .fba-modal-dialog .usa-banner__button[aria-expanded=true]::after:hover{\n      background-color:#1a4480;\n    }\n  }\n  .fba-modal-dialog .usa-banner__button[aria-expanded=true]:hover::after{\n    content:\"\";\n    background-color:#1a4480;\n  }\n  .fba-modal-dialog .usa-banner__button[aria-expanded=true]::after, .fba-modal-dialog .usa-banner__button[aria-expanded=true]:hover::after{\n    position:absolute;\n  }\n}\n@media (min-width: 40em) and (forced-colors: active){\n  .fba-modal-dialog .usa-banner__button[aria-expanded=true]::after, .fba-modal-dialog .usa-banner__button[aria-expanded=true]:hover::after{\n    background-color:ButtonText;\n  }\n}\n.fba-modal-dialog .usa-banner__button-text{\n  position:absolute;\n  left:-999em;\n  right:auto;\n  text-decoration:underline;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-banner__button-text{\n    position:static;\n    display:inline;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-banner__button-text{\n    color:LinkText;\n  }\n}\n.fba-modal-dialog .usa-banner__icon{\n  width:2.5rem;\n}\n.fba-modal-dialog .usa-js-loading .usa-banner__content{\n  position:absolute;\n  left:-999em;\n  right:auto;\n}\n.fba-modal-dialog .usa-button{\n  box-sizing:border-box;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:0.9;\n  color:white;\n  background-color:#005ea2;\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  align-items:center;\n  border:0;\n  border-radius:0.25rem;\n  cursor:pointer;\n  -moz-column-gap:0.5rem;\n       column-gap:0.5rem;\n  display:inline-flex;\n  font-weight:700;\n  justify-content:center;\n  margin-right:0.5rem;\n  padding:0.75rem 1.25rem;\n  text-align:center;\n  text-decoration:none;\n  width:100%;\n}\n.fba-modal-dialog .usa-button::after, .fba-modal-dialog .usa-button::before, .fba-modal-dialog .usa-button *, .fba-modal-dialog .usa-button *::after, .fba-modal-dialog .usa-button *::before{\n  box-sizing:inherit;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-button{\n    width:auto;\n  }\n}\n.fba-modal-dialog .usa-button:visited{\n  color:white;\n}\n.fba-modal-dialog .usa-button:hover, .fba-modal-dialog .usa-button.usa-button--hover{\n  color:white;\n  background-color:#1a4480;\n  border-bottom:0;\n  text-decoration:none;\n}\n.fba-modal-dialog .usa-button:active, .fba-modal-dialog .usa-button.usa-button--active{\n  color:white;\n  background-color:#162e51;\n}\n.fba-modal-dialog .usa-button:not([disabled]):focus, .fba-modal-dialog .usa-button:not([disabled]).usa-focus{\n  outline-offset:0.25rem;\n}\n.fba-modal-dialog .usa-button:disabled, .fba-modal-dialog .usa-button[aria-disabled=true]{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-button:disabled:hover, .fba-modal-dialog .usa-button:disabled:active, .fba-modal-dialog .usa-button:disabled:focus, .fba-modal-dialog .usa-button:disabled.usa-focus, .fba-modal-dialog .usa-button[aria-disabled=true]:hover, .fba-modal-dialog .usa-button[aria-disabled=true]:active, .fba-modal-dialog .usa-button[aria-disabled=true]:focus, .fba-modal-dialog .usa-button[aria-disabled=true].usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-button:disabled, .fba-modal-dialog .usa-button[aria-disabled=true]{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-button:disabled:hover, .fba-modal-dialog .usa-button:disabled:active, .fba-modal-dialog .usa-button:disabled:focus, .fba-modal-dialog .usa-button:disabled.usa-focus, .fba-modal-dialog .usa-button[aria-disabled=true]:hover, .fba-modal-dialog .usa-button[aria-disabled=true]:active, .fba-modal-dialog .usa-button[aria-disabled=true]:focus, .fba-modal-dialog .usa-button[aria-disabled=true].usa-focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-button:disabled.usa-button--hover, .fba-modal-dialog .usa-button:disabled.usa-button--active, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--active{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-button:disabled.usa-button--hover:hover, .fba-modal-dialog .usa-button:disabled.usa-button--hover:active, .fba-modal-dialog .usa-button:disabled.usa-button--hover:focus, .fba-modal-dialog .usa-button:disabled.usa-button--hover.usa-focus, .fba-modal-dialog .usa-button:disabled.usa-button--active:hover, .fba-modal-dialog .usa-button:disabled.usa-button--active:active, .fba-modal-dialog .usa-button:disabled.usa-button--active:focus, .fba-modal-dialog .usa-button:disabled.usa-button--active.usa-focus, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--hover:hover, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--hover:active, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--hover:focus, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--hover.usa-focus, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--active:hover, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--active:active, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--active:focus, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--active.usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-button:disabled.usa-button--hover, .fba-modal-dialog .usa-button:disabled.usa-button--active, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--active{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-button:disabled.usa-button--hover:hover, .fba-modal-dialog .usa-button:disabled.usa-button--hover:active, .fba-modal-dialog .usa-button:disabled.usa-button--hover:focus, .fba-modal-dialog .usa-button:disabled.usa-button--hover.usa-focus, .fba-modal-dialog .usa-button:disabled.usa-button--active:hover, .fba-modal-dialog .usa-button:disabled.usa-button--active:active, .fba-modal-dialog .usa-button:disabled.usa-button--active:focus, .fba-modal-dialog .usa-button:disabled.usa-button--active.usa-focus, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--hover:hover, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--hover:active, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--hover:focus, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--hover.usa-focus, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--active:hover, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--active:active, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--active:focus, .fba-modal-dialog .usa-button[aria-disabled=true].usa-button--active.usa-focus{\n    color:GrayText;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-button:disabled:not(.usa-button--unstyled), .fba-modal-dialog .usa-button[aria-disabled=true]:not(.usa-button--unstyled){\n    border:2px solid GrayText;\n  }\n}\n.fba-modal-dialog .usa-button .usa-icon{\n  flex-shrink:0;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-button:not(.usa-button--unstyled){\n    border:2px solid transparent;\n  }\n}\n.fba-modal-dialog .usa-button--accent-cool{\n  color:#1b1b1b;\n  background-color:#00bde3;\n}\n.fba-modal-dialog .usa-button--accent-cool:visited{\n  color:#1b1b1b;\n  background-color:#00bde3;\n}\n.fba-modal-dialog .usa-button--accent-cool:hover, .fba-modal-dialog .usa-button--accent-cool.usa-button--hover{\n  color:#1b1b1b;\n  background-color:#28a0cb;\n}\n.fba-modal-dialog .usa-button--accent-cool:active, .fba-modal-dialog .usa-button--accent-cool.usa-button--active{\n  color:white;\n  background-color:#07648d;\n}\n.fba-modal-dialog .usa-button--accent-warm{\n  color:#1b1b1b;\n  background-color:#fa9441;\n}\n.fba-modal-dialog .usa-button--accent-warm:visited{\n  color:#1b1b1b;\n  background-color:#fa9441;\n}\n.fba-modal-dialog .usa-button--accent-warm:hover, .fba-modal-dialog .usa-button--accent-warm.usa-button--hover{\n  color:white;\n  background-color:#c05600;\n}\n.fba-modal-dialog .usa-button--accent-warm:active, .fba-modal-dialog .usa-button--accent-warm.usa-button--active{\n  color:white;\n  background-color:#775540;\n}\n.fba-modal-dialog .usa-button--outline{\n  background-color:transparent;\n  box-shadow:inset 0 0 0 2px #005ea2;\n  color:#005ea2;\n}\n.fba-modal-dialog .usa-button--outline:visited{\n  color:#005ea2;\n}\n.fba-modal-dialog .usa-button--outline:hover, .fba-modal-dialog .usa-button--outline.usa-button--hover{\n  background-color:transparent;\n  box-shadow:inset 0 0 0 2px #1a4480;\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-button--outline:active, .fba-modal-dialog .usa-button--outline.usa-button--active{\n  background-color:transparent;\n  box-shadow:inset 0 0 0 2px #162e51;\n  color:#162e51;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse{\n  box-shadow:inset 0 0 0 2px #dfe1e2;\n  color:#dfe1e2;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse:visited{\n  color:#dfe1e2;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse:hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--hover{\n  box-shadow:inset 0 0 0 2px #f0f0f0;\n  color:#f0f0f0;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse:active, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--active{\n  background-color:transparent;\n  box-shadow:inset 0 0 0 2px white;\n  color:white;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n  color:#dfe1e2;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled.usa-button--hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled:hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true]:hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled.usa-button--hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:active, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled.usa-button--active, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled:active, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true]:active, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled.usa-button--active, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled:focus, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true]:focus, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled.usa-focus, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true], .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true], .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled:hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true]:hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true], .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:disabled:hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true]:hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:visited{\n  color:#dfe1e2;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:hover, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled.usa-button--hover{\n  color:#f0f0f0;\n}\n.fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled:active, .fba-modal-dialog .usa-button--outline.usa-button--inverse.usa-button--unstyled.usa-button--active{\n  color:white;\n}\n.fba-modal-dialog .usa-button--base{\n  color:white;\n  background-color:#71767a;\n}\n.fba-modal-dialog .usa-button--base:hover, .fba-modal-dialog .usa-button--base.usa-button--hover{\n  color:white;\n  background-color:#565c65;\n}\n.fba-modal-dialog .usa-button--base:active, .fba-modal-dialog .usa-button--base.usa-button--active{\n  color:white;\n  background-color:#3d4551;\n}\n.fba-modal-dialog .usa-button--secondary{\n  color:white;\n  background-color:#d83933;\n}\n.fba-modal-dialog .usa-button--secondary:hover, .fba-modal-dialog .usa-button--secondary.usa-button--hover{\n  color:white;\n  background-color:#b50909;\n}\n.fba-modal-dialog .usa-button--secondary:active, .fba-modal-dialog .usa-button--secondary.usa-button--active{\n  color:white;\n  background-color:#8b0a03;\n}\n.fba-modal-dialog .usa-button--big{\n  border-radius:0.25rem;\n  font-size:1.46rem;\n  padding:1rem 1.5rem;\n}\n.fba-modal-dialog .usa-button--outline:disabled, .fba-modal-dialog .usa-button--outline:disabled:hover, .fba-modal-dialog .usa-button--outline:disabled:active, .fba-modal-dialog .usa-button--outline:disabled:focus,\n.fba-modal-dialog .usa-button--outline[aria-disabled=true],\n.fba-modal-dialog .usa-button--outline[aria-disabled=true]:hover,\n.fba-modal-dialog .usa-button--outline[aria-disabled=true]:active,\n.fba-modal-dialog .usa-button--outline[aria-disabled=true]:focus,\n.fba-modal-dialog .usa-button--outline-inverse:disabled,\n.fba-modal-dialog .usa-button--outline-inverse:disabled:hover,\n.fba-modal-dialog .usa-button--outline-inverse:disabled:active,\n.fba-modal-dialog .usa-button--outline-inverse:disabled:focus,\n.fba-modal-dialog .usa-button--outline-inverse[aria-disabled=true],\n.fba-modal-dialog .usa-button--outline-inverse[aria-disabled=true]:hover,\n.fba-modal-dialog .usa-button--outline-inverse[aria-disabled=true]:active,\n.fba-modal-dialog .usa-button--outline-inverse[aria-disabled=true]:focus{\n  background-color:transparent;\n  color:#757575;\n}\n.fba-modal-dialog .usa-button--outline:disabled,\n.fba-modal-dialog .usa-button--outline[aria-disabled=true]{\n  box-shadow:inset 0 0 0 2px #c9c9c9;\n}\n.fba-modal-dialog .usa-button--outline:disabled.usa-button--inverse,\n.fba-modal-dialog .usa-button--outline[aria-disabled=true].usa-button--inverse{\n  box-shadow:inset 0 0 0 2px #919191;\n  color:#919191;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-button--outline:disabled.usa-button--inverse,\n  .fba-modal-dialog .usa-button--outline[aria-disabled=true].usa-button--inverse{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-button--unstyled{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n}\n.fba-modal-dialog .usa-button--unstyled:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-button--unstyled:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-button--unstyled:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-button--unstyled:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-button--unstyled:hover, .fba-modal-dialog .usa-button--unstyled.usa-button--hover, .fba-modal-dialog .usa-button--unstyled:disabled:hover, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true]:hover, .fba-modal-dialog .usa-button--unstyled:disabled.usa-button--hover, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-button--unstyled:active, .fba-modal-dialog .usa-button--unstyled.usa-button--active, .fba-modal-dialog .usa-button--unstyled:disabled:active, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true]:active, .fba-modal-dialog .usa-button--unstyled:disabled.usa-button--active, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-button--unstyled:disabled:focus, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true]:focus, .fba-modal-dialog .usa-button--unstyled:disabled.usa-focus, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-button--unstyled:disabled, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true], .fba-modal-dialog .usa-button--unstyled.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-button--unstyled.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-button--unstyled.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-button--unstyled:disabled, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true], .fba-modal-dialog .usa-button--unstyled:disabled:hover, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true]:hover, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-button--unstyled:disabled, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true], .fba-modal-dialog .usa-button--unstyled:disabled:hover, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true]:hover, .fba-modal-dialog .usa-button--unstyled[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-character-count__status{\n  display:inline-block;\n  padding-top:0.25rem;\n}\n.fba-modal-dialog .usa-character-count__status.usa-character-count__status--invalid{\n  color:#b50909;\n  font-weight:700;\n}\n.fba-modal-dialog .usa-checkbox{\n  background:white;\n}\n.fba-modal-dialog .usa-checkbox__label{\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-checkbox__label::before{\n  background:white;\n  box-shadow:0 0 0 2px #1b1b1b;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-checkbox__label::before{\n    outline:2px solid transparent;\n    outline-offset:2px;\n  }\n}\n.fba-modal-dialog .usa-checkbox__input:checked + [class*=__label]::before{\n  background-color:#005ea2;\n  box-shadow:0 0 0 2px #005ea2;\n}\n.fba-modal-dialog .usa-checkbox__input:disabled + [class*=__label], .fba-modal-dialog .usa-checkbox__input[aria-disabled=true] + [class*=__label]{\n  color:#757575;\n  cursor:not-allowed;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-checkbox__input:disabled + [class*=__label], .fba-modal-dialog .usa-checkbox__input[aria-disabled=true] + [class*=__label]{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-checkbox__input:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input[aria-disabled=true] + [class*=__label]::before{\n  background-color:white;\n  box-shadow:0 0 0 2px #757575;\n}\n.fba-modal-dialog .usa-checkbox__input--tile + [class*=__label]{\n  background-color:white;\n  border:2px solid #c9c9c9;\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-checkbox__input--tile:checked + [class*=__label]{\n  background-color:rgba(0, 94, 162, 0.1);\n  border-color:#005ea2;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-checkbox__input--tile:checked + [class*=__label]{\n    border:ButtonText solid 0.25rem;\n  }\n}\n.fba-modal-dialog .usa-checkbox__input--tile:disabled + [class*=__label], .fba-modal-dialog .usa-checkbox__input--tile[aria-disabled=true] + [class*=__label]{\n  border-color:#e6e6e6;\n}\n.fba-modal-dialog .usa-checkbox__input--tile:disabled:checked + [class*=__label], .fba-modal-dialog .usa-checkbox__input--tile:disabled:indeterminate + [class*=__label], .fba-modal-dialog .usa-checkbox__input--tile:disabled[data-indeterminate] + [class*=__label], .fba-modal-dialog .usa-checkbox__input--tile[aria-disabled=true]:checked + [class*=__label], .fba-modal-dialog .usa-checkbox__input--tile[aria-disabled=true]:indeterminate + [class*=__label], .fba-modal-dialog .usa-checkbox__input--tile[aria-disabled=true][data-indeterminate] + [class*=__label]{\n  background-color:white;\n}\n.fba-modal-dialog .usa-checkbox__input:indeterminate + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input[data-indeterminate] + [class*=__label]::before{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/checkbox-indeterminate.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-color:#005ea2;\n  box-shadow:0 0 0 2px #005ea2;\n  background-position:center center;\n  background-size:0.75rem auto;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-checkbox__input:indeterminate + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input[data-indeterminate] + [class*=__label]::before{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/checkbox-indeterminate-alt.svg\"), linear-gradient(transparent, transparent);\n    background-repeat:no-repeat;\n    background-color:SelectedItem;\n  }\n}\n.fba-modal-dialog .usa-checkbox__input:indeterminate:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:indeterminate[aria-disabled=true] + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input[data-indeterminate]:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input[data-indeterminate][aria-disabled=true] + [class*=__label]::before{\n  box-shadow:0 0 0 2px #757575;\n}\n.fba-modal-dialog .usa-checkbox__input:indeterminate:disabled + [class*=__label], .fba-modal-dialog .usa-checkbox__input:indeterminate[aria-disabled=true] + [class*=__label], .fba-modal-dialog .usa-checkbox__input[data-indeterminate]:disabled + [class*=__label], .fba-modal-dialog .usa-checkbox__input[data-indeterminate][aria-disabled=true] + [class*=__label]{\n  border-color:#e6e6e6;\n}\n.fba-modal-dialog .usa-checkbox__input--tile:indeterminate + [class*=__label], .fba-modal-dialog .usa-checkbox__input--tile[data-indeterminate] + [class*=__label]{\n  background-color:rgba(0, 94, 162, 0.1);\n  border-color:#005ea2;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-checkbox__input--tile:indeterminate + [class*=__label], .fba-modal-dialog .usa-checkbox__input--tile[data-indeterminate] + [class*=__label]{\n    border:ButtonText solid 0.25rem;\n  }\n}\n.fba-modal-dialog .usa-checkbox__input:checked + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:checked:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:checked[aria-disabled=true] + [class*=__label]::before{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/correct8.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-checkbox__input:checked + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:checked:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:checked[aria-disabled=true] + [class*=__label]::before{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/correct8-alt.svg\"), linear-gradient(transparent, transparent);\n    background-repeat:no-repeat;\n  }\n}\n.fba-modal-dialog .usa-checkbox__input:checked:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:checked[aria-disabled=true] + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:indeterminate:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:indeterminate[aria-disabled=true] + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input[data-indeterminate]:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input[data-indeterminate][aria-disabled=true] + [class*=__label]::before{\n  background-color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-checkbox__input:checked:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:checked[aria-disabled=true] + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:indeterminate:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input:indeterminate[aria-disabled=true] + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input[data-indeterminate]:disabled + [class*=__label]::before, .fba-modal-dialog .usa-checkbox__input[data-indeterminate][aria-disabled=true] + [class*=__label]::before{\n    background-color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-checkbox__input{\n  position:absolute;\n  left:-999em;\n  right:auto;\n}\n.fba-modal-dialog .usa-checkbox__input:focus + [class*=__label]::before{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0.25rem;\n}\n.fba-modal-dialog .usa-checkbox__input--tile + [class*=__label]{\n  border-radius:0.25rem;\n  margin-top:0.5rem;\n  padding:0.75rem 1rem 0.75rem 2.5rem;\n}\n.fba-modal-dialog .usa-checkbox__input--tile + [class*=__label]::before{\n  left:0.5rem;\n}\n.fba-modal-dialog .usa-checkbox__input:checked + [class*=__label]::before{\n  background-position:center center;\n  background-size:0.75rem auto;\n}\n@media print{\n  .fba-modal-dialog .usa-checkbox__input:checked + [class*=__label]::before{\n    background-image:none;\n    background-color:white;\n    content:\"✔\";\n    text-align:center;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-checkbox__input:checked + [class*=__label]::before{\n    background-color:SelectedItem;\n  }\n}\n.fba-modal-dialog .usa-checkbox__label{\n  cursor:pointer;\n  display:inherit;\n  font-weight:normal;\n  margin-top:0.75rem;\n  padding-left:2rem;\n  position:relative;\n}\n.fba-modal-dialog .usa-checkbox__label::before{\n  content:\" \";\n  display:block;\n  left:0;\n  margin-left:2px;\n  margin-top:0.064rem;\n  position:absolute;\n}\n.fba-modal-dialog .usa-checkbox__label::before{\n  height:1.25rem;\n  width:1.25rem;\n  border-radius:2px;\n}\n.fba-modal-dialog .usa-checkbox__label-description{\n  display:block;\n  font-size:0.93rem;\n  margin-top:0.5rem;\n}\n.fba-modal-dialog .usa-checklist{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n  box-sizing:border-box;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n}\n.fba-modal-dialog .usa-checklist::after, .fba-modal-dialog .usa-checklist::before, .fba-modal-dialog .usa-checklist *, .fba-modal-dialog .usa-checklist *::after, .fba-modal-dialog .usa-checklist *::before{\n  box-sizing:inherit;\n}\n.fba-modal-dialog .usa-checklist__item{\n  text-indent:-2.5rem;\n  margin-bottom:0;\n  margin-top:0;\n  margin-bottom:0;\n  margin-top:0.5rem;\n}\n.fba-modal-dialog .usa-checklist__item::before{\n  content:\" \";\n  display:inline-block;\n  height:1rem;\n  margin-left:-0.25rem;\n  margin-right:0.75rem;\n  width:2rem;\n}\n.fba-modal-dialog .usa-checklist__item.usa-checklist__item--checked::before{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons-bg/check--blue-60v.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-position:center;\n  background-size:1.5rem;\n}\n.fba-modal-dialog .usa-combo-box{\n  max-width:none;\n  position:relative;\n}\n.fba-modal-dialog .usa-combo-box--pristine .usa-combo-box__input{\n  padding-right:calc(5em + 4px);\n}\n.fba-modal-dialog .usa-combo-box--pristine .usa-combo-box__input::-ms-clear{\n  display:none;\n}\n.fba-modal-dialog .usa-combo-box--pristine .usa-combo-box__clear-input{\n  display:block;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-combo-box--pristine .usa-combo-box__clear-input{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/close.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1rem 1rem;\n    display:inline-block;\n    height:1rem;\n    width:1rem;\n    height:1.5rem;\n    width:auto;\n    top:0.5rem;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-combo-box--pristine .usa-combo-box__clear-input{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/close.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/close.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1rem 1rem;\n              mask-size:1rem 1rem;\n    }\n  }\n}\n.fba-modal-dialog .usa-combo-box__input{\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  margin-bottom:0;\n  max-width:none;\n  padding-right:calc(2.5em + 3px);\n}\n.fba-modal-dialog .usa-combo-box__input:disabled, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n  -webkit-text-fill-color:#454545;\n}\n.fba-modal-dialog .usa-combo-box__input:disabled:hover, .fba-modal-dialog .usa-combo-box__input:disabled:active, .fba-modal-dialog .usa-combo-box__input:disabled:focus, .fba-modal-dialog .usa-combo-box__input:disabled.usa-focus, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]:hover, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]:active, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]:focus, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true].usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-combo-box__input:disabled, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-combo-box__input:disabled:hover, .fba-modal-dialog .usa-combo-box__input:disabled:active, .fba-modal-dialog .usa-combo-box__input:disabled:focus, .fba-modal-dialog .usa-combo-box__input:disabled.usa-focus, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]:hover, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]:active, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]:focus, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true].usa-focus{\n    color:GrayText;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-combo-box__input:disabled, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]{\n    border:2px solid GrayText;\n  }\n}\n.fba-modal-dialog .usa-combo-box__input:disabled::-moz-placeholder, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]::-moz-placeholder{\n  opacity:1;\n}\n.fba-modal-dialog .usa-combo-box__input:disabled::placeholder, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true]::placeholder{\n  opacity:1;\n}\n.fba-modal-dialog .usa-combo-box__input:disabled ~ .usa-combo-box__input-button-separator, .fba-modal-dialog .usa-combo-box__input[aria-disabled=true] ~ .usa-combo-box__input-button-separator{\n  background-color:#454545;\n  cursor:not-allowed;\n}\n.fba-modal-dialog button.usa-combo-box__toggle-list:focus,\n.fba-modal-dialog button.usa-combo-box__clear-input:focus{\n  outline-offset:-4px;\n}\n.fba-modal-dialog button.usa-combo-box__toggle-list:disabled, .fba-modal-dialog button.usa-combo-box__toggle-list[aria-disabled=true],\n.fba-modal-dialog button.usa-combo-box__clear-input:disabled,\n.fba-modal-dialog button.usa-combo-box__clear-input[aria-disabled=true]{\n  cursor:not-allowed;\n}\n.fba-modal-dialog .usa-combo-box__toggle-list__wrapper:focus,\n.fba-modal-dialog .usa-combo-box__clear-input__wrapper:focus{\n  outline:0;\n}\n.fba-modal-dialog .usa-combo-box__toggle-list,\n.fba-modal-dialog .usa-combo-box__clear-input{\n  background-color:transparent;\n  background-position:center;\n  background-size:auto 1.5rem;\n  border:0;\n  bottom:1px;\n  cursor:pointer;\n  margin-bottom:0;\n  opacity:0.6;\n  padding-right:2rem;\n  position:absolute;\n  top:1px;\n  z-index:100;\n}\n.fba-modal-dialog .usa-combo-box__clear-input{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/close.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  display:none;\n  right:calc(2.5em + 3px);\n}\n.fba-modal-dialog .usa-combo-box__toggle-list{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  background-size:auto 2rem;\n  right:1px;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-combo-box__toggle-list{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1rem 1rem;\n    display:inline-block;\n    height:1rem;\n    width:1rem;\n    height:auto;\n    width:auto;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-combo-box__toggle-list{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1rem 1rem;\n              mask-size:1rem 1rem;\n    }\n  }\n  .fba-modal-dialog .usa-combo-box__toggle-list:disabled, .fba-modal-dialog .usa-combo-box__toggle-list[aria-disabled=true]{\n    background-color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-combo-box__input-button-separator{\n  background-color:#c6cace;\n  position:absolute;\n  top:1px;\n  height:calc(100% - 1rem);\n  margin-bottom:0.5rem;\n  margin-top:0.5rem;\n  width:1px;\n  right:calc(2.5em + 2px);\n  box-sizing:border-box;\n  z-index:200;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-combo-box__input-button-separator{\n    background-color:ButtonText;\n  }\n}\n.fba-modal-dialog .usa-combo-box__list{\n  border-width:1px;\n  border-color:#565c65;\n  border-style:solid;\n  background-color:white;\n  border-radius:0;\n  border-top:0;\n  margin:0;\n  max-height:12.1em;\n  overflow-x:hidden;\n  overflow-y:scroll;\n  padding:0;\n  position:absolute;\n  width:100%;\n  z-index:300;\n}\n.fba-modal-dialog .usa-combo-box__list:focus{\n  outline:0;\n}\n.fba-modal-dialog .usa-combo-box__list-option{\n  border-bottom:1px solid #dfe1e2;\n  cursor:pointer;\n  display:block;\n  padding:0.5rem;\n}\n.fba-modal-dialog .usa-combo-box__list-option--focused{\n  outline:2px solid #162e51;\n  outline-offset:-2px;\n  position:relative;\n  z-index:100;\n}\n.fba-modal-dialog .usa-combo-box__list-option--focused:focus{\n  outline-offset:-4px;\n}\n.fba-modal-dialog .usa-combo-box__list-option--selected{\n  background-color:#005ea2;\n  border-color:#005ea2;\n  color:white;\n}\n.fba-modal-dialog .usa-combo-box__list-option--no-results{\n  cursor:not-allowed;\n  display:block;\n  padding:0.5rem;\n}\n.fba-modal-dialog .usa-date-picker__wrapper{\n  display:none;\n  position:relative;\n  max-width:none;\n}\n.fba-modal-dialog .usa-date-picker__wrapper:focus{\n  outline:0;\n}\n.fba-modal-dialog .usa-date-picker__external-input[aria-disabled=true] + .usa-date-picker__button, .fba-modal-dialog .usa-date-picker__calendar__year:disabled, .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:disabled,\n.fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:disabled, .fba-modal-dialog .usa-date-picker__calendar__month:disabled, .fba-modal-dialog .usa-date-picker__calendar__year-selection:disabled,\n.fba-modal-dialog .usa-date-picker__calendar__month-selection:disabled, .fba-modal-dialog .usa-date-picker__calendar__date:disabled, .fba-modal-dialog .usa-date-picker__calendar__previous-year:disabled,\n.fba-modal-dialog .usa-date-picker__calendar__previous-month:disabled,\n.fba-modal-dialog .usa-date-picker__calendar__next-year:disabled,\n.fba-modal-dialog .usa-date-picker__calendar__next-month:disabled, .fba-modal-dialog .usa-date-picker__button:disabled, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__year, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-year-chunk,\n.fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-year-chunk, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__month, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__year-selection,\n.fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__month-selection, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__date, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-year,\n.fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-month,\n.fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-year,\n.fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-month, .fba-modal-dialog [aria-disabled=true].usa-date-picker__button{\n  cursor:not-allowed;\n  opacity:0.6;\n}\n.fba-modal-dialog .usa-date-picker__external-input[aria-disabled=true] + .usa-date-picker__button:hover, .fba-modal-dialog .usa-date-picker__calendar__year:hover:disabled, .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:hover:disabled,\n.fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:hover:disabled, .fba-modal-dialog .usa-date-picker__calendar__month:hover:disabled, .fba-modal-dialog .usa-date-picker__calendar__year-selection:hover:disabled,\n.fba-modal-dialog .usa-date-picker__calendar__month-selection:hover:disabled, .fba-modal-dialog .usa-date-picker__calendar__date:hover:disabled, .fba-modal-dialog .usa-date-picker__calendar__previous-year:hover:disabled,\n.fba-modal-dialog .usa-date-picker__calendar__previous-month:hover:disabled,\n.fba-modal-dialog .usa-date-picker__calendar__next-year:hover:disabled,\n.fba-modal-dialog .usa-date-picker__calendar__next-month:hover:disabled, .fba-modal-dialog .usa-date-picker__button:hover:disabled, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__year:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-year-chunk:hover,\n.fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-year-chunk:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__month:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__year-selection:hover,\n.fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__month-selection:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__date:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-year:hover,\n.fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-month:hover,\n.fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-year:hover,\n.fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-month:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__button:hover{\n  background-color:initial;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__external-input[aria-disabled=true] + .usa-date-picker__button, .fba-modal-dialog .usa-date-picker__calendar__year:disabled, .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:disabled,\n  .fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:disabled, .fba-modal-dialog .usa-date-picker__calendar__month:disabled, .fba-modal-dialog .usa-date-picker__calendar__year-selection:disabled,\n  .fba-modal-dialog .usa-date-picker__calendar__month-selection:disabled, .fba-modal-dialog .usa-date-picker__calendar__date:disabled, .fba-modal-dialog .usa-date-picker__calendar__previous-year:disabled,\n  .fba-modal-dialog .usa-date-picker__calendar__previous-month:disabled,\n  .fba-modal-dialog .usa-date-picker__calendar__next-year:disabled,\n  .fba-modal-dialog .usa-date-picker__calendar__next-month:disabled, .fba-modal-dialog .usa-date-picker__button:disabled, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__year, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-year-chunk,\n  .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-year-chunk, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__month, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__year-selection,\n  .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__month-selection, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__date, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-year,\n  .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-month,\n  .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-year,\n  .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-month, .fba-modal-dialog [aria-disabled=true].usa-date-picker__button{\n    background-color:GrayText;\n  }\n  .fba-modal-dialog .usa-date-picker__external-input[aria-disabled=true] + .usa-date-picker__button:hover, .fba-modal-dialog .usa-date-picker__calendar__year:hover:disabled, .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:hover:disabled,\n  .fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:hover:disabled, .fba-modal-dialog .usa-date-picker__calendar__month:hover:disabled, .fba-modal-dialog .usa-date-picker__calendar__year-selection:hover:disabled,\n  .fba-modal-dialog .usa-date-picker__calendar__month-selection:hover:disabled, .fba-modal-dialog .usa-date-picker__calendar__date:hover:disabled, .fba-modal-dialog .usa-date-picker__calendar__previous-year:hover:disabled,\n  .fba-modal-dialog .usa-date-picker__calendar__previous-month:hover:disabled,\n  .fba-modal-dialog .usa-date-picker__calendar__next-year:hover:disabled,\n  .fba-modal-dialog .usa-date-picker__calendar__next-month:hover:disabled, .fba-modal-dialog .usa-date-picker__button:hover:disabled, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__year:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-year-chunk:hover,\n  .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-year-chunk:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__month:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__year-selection:hover,\n  .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__month-selection:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__date:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-year:hover,\n  .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__previous-month:hover,\n  .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-year:hover,\n  .fba-modal-dialog [aria-disabled=true].usa-date-picker__calendar__next-month:hover, .fba-modal-dialog [aria-disabled=true].usa-date-picker__button:hover{\n    background-color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__year, .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk,\n.fba-modal-dialog .usa-date-picker__calendar__next-year-chunk, .fba-modal-dialog .usa-date-picker__calendar__month, .fba-modal-dialog .usa-date-picker__calendar__year-selection,\n.fba-modal-dialog .usa-date-picker__calendar__month-selection, .fba-modal-dialog .usa-date-picker__calendar__date, .fba-modal-dialog .usa-date-picker__calendar__previous-year,\n.fba-modal-dialog .usa-date-picker__calendar__previous-month,\n.fba-modal-dialog .usa-date-picker__calendar__next-year,\n.fba-modal-dialog .usa-date-picker__calendar__next-month, .fba-modal-dialog .usa-date-picker__button{\n  background-color:#f0f0f0;\n  border:0;\n  width:100%;\n}\n.fba-modal-dialog .usa-date-picker__calendar__year:not([disabled]), .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled]),\n.fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled]), .fba-modal-dialog .usa-date-picker__calendar__month:not([disabled]), .fba-modal-dialog .usa-date-picker__calendar__year-selection:not([disabled]),\n.fba-modal-dialog .usa-date-picker__calendar__month-selection:not([disabled]), .fba-modal-dialog .usa-date-picker__calendar__date:not([disabled]), .fba-modal-dialog .usa-date-picker__calendar__previous-year:not([disabled]),\n.fba-modal-dialog .usa-date-picker__calendar__previous-month:not([disabled]),\n.fba-modal-dialog .usa-date-picker__calendar__next-year:not([disabled]),\n.fba-modal-dialog .usa-date-picker__calendar__next-month:not([disabled]), .fba-modal-dialog .usa-date-picker__button:not([disabled]){\n  cursor:pointer;\n}\n.fba-modal-dialog .usa-date-picker__calendar__year:not([disabled]):focus, .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled]):focus,\n.fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled]):focus, .fba-modal-dialog .usa-date-picker__calendar__month:not([disabled]):focus, .fba-modal-dialog .usa-date-picker__calendar__year-selection:not([disabled]):focus,\n.fba-modal-dialog .usa-date-picker__calendar__month-selection:not([disabled]):focus, .fba-modal-dialog .usa-date-picker__calendar__date:not([disabled]):focus, .fba-modal-dialog .usa-date-picker__calendar__previous-year:not([disabled]):focus,\n.fba-modal-dialog .usa-date-picker__calendar__previous-month:not([disabled]):focus,\n.fba-modal-dialog .usa-date-picker__calendar__next-year:not([disabled]):focus,\n.fba-modal-dialog .usa-date-picker__calendar__next-month:not([disabled]):focus, .fba-modal-dialog .usa-date-picker__button:not([disabled]):focus{\n  outline-offset:-4px;\n}\n.fba-modal-dialog .usa-date-picker__calendar__year:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled]):hover,\n.fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__month:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__year-selection:not([disabled]):hover,\n.fba-modal-dialog .usa-date-picker__calendar__month-selection:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__date:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__previous-year:not([disabled]):hover,\n.fba-modal-dialog .usa-date-picker__calendar__previous-month:not([disabled]):hover,\n.fba-modal-dialog .usa-date-picker__calendar__next-year:not([disabled]):hover,\n.fba-modal-dialog .usa-date-picker__calendar__next-month:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__button:not([disabled]):hover{\n  background-color:#dfe1e2;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__year:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled]):hover,\n  .fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__month:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__year-selection:not([disabled]):hover,\n  .fba-modal-dialog .usa-date-picker__calendar__month-selection:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__date:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__previous-year:not([disabled]):hover,\n  .fba-modal-dialog .usa-date-picker__calendar__previous-month:not([disabled]):hover,\n  .fba-modal-dialog .usa-date-picker__calendar__next-year:not([disabled]):hover,\n  .fba-modal-dialog .usa-date-picker__calendar__next-month:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__button:not([disabled]):hover{\n    background-color:buttontext;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__year:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled]):active,\n.fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__month:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__year-selection:not([disabled]):active,\n.fba-modal-dialog .usa-date-picker__calendar__month-selection:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__date:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__previous-year:not([disabled]):active,\n.fba-modal-dialog .usa-date-picker__calendar__previous-month:not([disabled]):active,\n.fba-modal-dialog .usa-date-picker__calendar__next-year:not([disabled]):active,\n.fba-modal-dialog .usa-date-picker__calendar__next-month:not([disabled]):active, .fba-modal-dialog .usa-date-picker__button:not([disabled]):active{\n  background-color:#a9aeb1;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__year:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled]):active,\n  .fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__month:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__year-selection:not([disabled]):active,\n  .fba-modal-dialog .usa-date-picker__calendar__month-selection:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__date:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__previous-year:not([disabled]):active,\n  .fba-modal-dialog .usa-date-picker__calendar__previous-month:not([disabled]):active,\n  .fba-modal-dialog .usa-date-picker__calendar__next-year:not([disabled]):active,\n  .fba-modal-dialog .usa-date-picker__calendar__next-month:not([disabled]):active, .fba-modal-dialog .usa-date-picker__button:not([disabled]):active{\n    background-color:buttontext;\n  }\n}\n.fba-modal-dialog .usa-date-picker--active .usa-date-picker__button{\n  background-color:#f0f0f0;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker--active .usa-date-picker__button{\n    background-color:buttontext;\n  }\n}\n.fba-modal-dialog .usa-date-picker--active .usa-date-picker__calendar{\n  z-index:400;\n}\n.fba-modal-dialog .usa-date-picker__button{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/calendar_today.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  align-self:stretch;\n  background-color:transparent;\n  background-position:center;\n  background-size:1.5rem;\n  margin-top:0.5em;\n  width:3em;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__button{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/calendar_today.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:2.5rem 2.5rem;\n    display:inline-block;\n    height:2.5rem;\n    width:3rem;\n    -webkit-mask-size:1.5rem !important;\n            mask-size:1.5rem !important;\n    position:relative;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-date-picker__button{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/calendar_today.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/calendar_today.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:2.5rem 2.5rem;\n              mask-size:2.5rem 2.5rem;\n    }\n  }\n  .fba-modal-dialog .usa-date-picker__button:not([disabled]):focus, .fba-modal-dialog .usa-date-picker__button:not([disabled]):hover{\n    background-color:Highlight;\n  }\n}\n.fba-modal-dialog .usa-date-picker--initialized .usa-date-picker__wrapper{\n  display:flex;\n}\n.fba-modal-dialog .usa-date-picker__calendar{\n  background-color:#f0f0f0;\n  left:auto;\n  max-width:20rem;\n  position:absolute;\n  right:0;\n  width:100%;\n  z-index:100;\n}\n.fba-modal-dialog .usa-date-picker__calendar__table{\n  border-spacing:0;\n  border-collapse:collapse;\n  table-layout:fixed;\n  text-align:center;\n  width:100%;\n}\n.fba-modal-dialog .usa-date-picker__calendar__table th{\n  font-weight:normal;\n}\n.fba-modal-dialog .usa-date-picker__calendar__table td{\n  padding:0;\n}\n.fba-modal-dialog .usa-date-picker__calendar__row{\n  display:flex;\n  flex-wrap:wrap;\n  box-sizing:border-box;\n  text-align:center;\n  width:100%;\n}\n.fba-modal-dialog .usa-date-picker__calendar__cell{\n  background-color:#f0f0f0;\n  flex:1;\n}\n.fba-modal-dialog .usa-date-picker__calendar__cell--center-items{\n  display:flex;\n  justify-content:center;\n  align-items:center;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__cell--center-items:not([disabled]):hover{\n    outline:2px solid transparent;\n    outline-offset:-2px;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__previous-year,\n.fba-modal-dialog .usa-date-picker__calendar__previous-month,\n.fba-modal-dialog .usa-date-picker__calendar__next-year,\n.fba-modal-dialog .usa-date-picker__calendar__next-month{\n  background-position:center;\n  background-size:auto 1.5rem;\n  height:1.5rem;\n  padding:20px 10px;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__previous-year,\n  .fba-modal-dialog .usa-date-picker__calendar__previous-month,\n  .fba-modal-dialog .usa-date-picker__calendar__next-year,\n  .fba-modal-dialog .usa-date-picker__calendar__next-month{\n    -webkit-mask-size:1.5rem !important;\n            mask-size:1.5rem !important;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__previous-year:not([disabled]){\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_far_before.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__previous-year:not([disabled]){\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_far_before.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:2.5rem 2.5rem;\n    display:inline-block;\n    height:2.5rem;\n    width:3rem;\n    background-color:buttonText;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-date-picker__calendar__previous-year:not([disabled]){\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_far_before.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_far_before.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:2.5rem 2.5rem;\n              mask-size:2.5rem 2.5rem;\n    }\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__previous-month:not([disabled]){\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_before.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__previous-month:not([disabled]){\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_before.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:2.5rem 2.5rem;\n    display:inline-block;\n    height:2.5rem;\n    width:3rem;\n    background-color:buttonText;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-date-picker__calendar__previous-month:not([disabled]){\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_before.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_before.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:2.5rem 2.5rem;\n              mask-size:2.5rem 2.5rem;\n    }\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__next-year:not([disabled]){\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_far_next.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__next-year:not([disabled]){\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_far_next.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:2.5rem 2.5rem;\n    display:inline-block;\n    height:2.5rem;\n    width:3rem;\n    background-color:buttonText;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-date-picker__calendar__next-year:not([disabled]){\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_far_next.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_far_next.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:2.5rem 2.5rem;\n              mask-size:2.5rem 2.5rem;\n    }\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__next-month:not([disabled]){\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__next-month:not([disabled]){\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:2.5rem 2.5rem;\n    display:inline-block;\n    height:2.5rem;\n    width:3rem;\n    background-color:buttonText;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-date-picker__calendar__next-month:not([disabled]){\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:2.5rem 2.5rem;\n              mask-size:2.5rem 2.5rem;\n    }\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__day-of-week{\n  padding:6px 0px;\n}\n.fba-modal-dialog .usa-date-picker__calendar__date{\n  padding:10px 0px;\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--focused{\n  outline:2px solid #162e51;\n  outline-offset:-2px;\n  position:relative;\n  z-index:100;\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--next-month:not([disabled]), .fba-modal-dialog .usa-date-picker__calendar__date--previous-month:not([disabled]){\n  color:#5d5d52;\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--selected, .fba-modal-dialog .usa-date-picker__calendar__date--range-date{\n  background-color:#0050d8;\n  color:#f9f9f9;\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--selected:not([disabled]), .fba-modal-dialog .usa-date-picker__calendar__date--range-date:not([disabled]){\n  background-color:#0050d8;\n  color:#f9f9f9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__date--selected:not([disabled]), .fba-modal-dialog .usa-date-picker__calendar__date--range-date:not([disabled]){\n    border:ActiveText 2px solid;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--selected:not([disabled]):hover, .fba-modal-dialog .usa-date-picker__calendar__date--range-date:not([disabled]):hover{\n  background-color:#0050d8;\n  color:#e6e6e6;\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--selected:not([disabled]):focus, .fba-modal-dialog .usa-date-picker__calendar__date--range-date:not([disabled]):focus{\n  background-color:#0050d8;\n  color:#f9f9f9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__date--selected:not([disabled]):focus, .fba-modal-dialog .usa-date-picker__calendar__date--range-date:not([disabled]):focus{\n    border:ActiveText 2px solid;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--selected:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__date--range-date:not([disabled]):active{\n  background-color:#1a4480;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__date--selected:not([disabled]):active, .fba-modal-dialog .usa-date-picker__calendar__date--range-date:not([disabled]):active{\n    background-color:Highlight;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--range-date-start{\n  border-top-left-radius:10%;\n  border-bottom-left-radius:10%;\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--range-date-end{\n  border-top-right-radius:10%;\n  border-bottom-right-radius:10%;\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--within-range{\n  background-color:#cfe8ff;\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--within-range:not([disabled]){\n  background-color:#cfe8ff;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__date--within-range:not([disabled]){\n    border:Highlight 2px solid;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--within-range:not([disabled]):hover{\n  background-color:#cfe8ff;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__date--within-range:not([disabled]):hover{\n    border:Highlight 2px solid;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--within-range:not([disabled]):focus{\n  background-color:#cfe8ff;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__date--within-range:not([disabled]):focus{\n    border:Highlight 2px solid;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__date--within-range:not([disabled]):active{\n  background-color:#cfe8ff;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__date--within-range:not([disabled]):active{\n    background-color:Highlight;\n  }\n}\n@media all and (max-width: 19.99em){\n  .fba-modal-dialog .usa-date-picker__calendar__month-label{\n    min-width:100%;\n    order:-1;\n  }\n}\n@media all and (min-width: 20em){\n  .fba-modal-dialog .usa-date-picker__calendar__month-label{\n    flex:4;\n    text-align:center;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__year-selection,\n.fba-modal-dialog .usa-date-picker__calendar__month-selection{\n  display:inline-block;\n  height:100%;\n  padding:8px 4px;\n  width:auto;\n}\n@media all and (max-width: 19.99em){\n  .fba-modal-dialog .usa-date-picker__calendar__year-selection,\n  .fba-modal-dialog .usa-date-picker__calendar__month-selection{\n    padding-bottom:0;\n    padding-top:12px;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__month-picker{\n  padding:20px 5px;\n}\n@media all and (max-width: 19.99em){\n  .fba-modal-dialog .usa-date-picker__calendar__month-picker{\n    padding-bottom:12px;\n    padding-top:12px;\n  }\n  .fba-modal-dialog .usa-date-picker__calendar__month-picker tr{\n    display:flex;\n    flex-direction:column;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__month{\n  padding:10px 0;\n}\n.fba-modal-dialog .usa-date-picker__calendar__month--focused{\n  outline:2px solid #162e51;\n  outline-offset:-2px;\n  position:relative;\n  z-index:100;\n}\n.fba-modal-dialog .usa-date-picker__calendar__month--selected{\n  background-color:#0050d8;\n  color:#f9f9f9;\n}\n.fba-modal-dialog .usa-date-picker__calendar__month--selected:not([disabled]){\n  background-color:#0050d8;\n  color:#f9f9f9;\n}\n.fba-modal-dialog .usa-date-picker__calendar__month--selected:not([disabled]):hover{\n  background-color:#0050d8;\n  color:#e6e6e6;\n}\n.fba-modal-dialog .usa-date-picker__calendar__month--selected:not([disabled]):focus{\n  background-color:#0050d8;\n  color:#f9f9f9;\n}\n.fba-modal-dialog .usa-date-picker__calendar__month--selected:not([disabled]):active{\n  background-color:#1a4480;\n}\n.fba-modal-dialog .usa-date-picker__calendar__year-picker{\n  padding:20px 5px;\n}\n.fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk,\n.fba-modal-dialog .usa-date-picker__calendar__next-year-chunk{\n  background-position:center;\n  background-size:auto 2rem;\n  margin:auto;\n  padding:40px 0;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk,\n  .fba-modal-dialog .usa-date-picker__calendar__next-year-chunk{\n    -webkit-mask-size:1.5rem !important;\n            mask-size:1.5rem !important;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled]){\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_before.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled]){\n    background-image:none;\n  }\n  .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled])::after{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_before.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:2.5rem 2.5rem;\n    display:inline-block;\n    height:2.5rem;\n    width:3rem;\n    content:\"\";\n    vertical-align:middle;\n    margin-left:auto;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled])::after{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_before.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_before.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:2.5rem 2.5rem;\n              mask-size:2.5rem 2.5rem;\n    }\n  }\n  .fba-modal-dialog .usa-date-picker__calendar__previous-year-chunk:not([disabled]):hover{\n    border:2px solid transparent;\n    background-color:transparent;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled]){\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled]){\n    background-image:none;\n  }\n  .fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled])::after{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:2.5rem 2.5rem;\n    display:inline-block;\n    height:2.5rem;\n    width:3rem;\n    content:\"\";\n    vertical-align:middle;\n    margin-left:auto;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled])::after{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:2.5rem 2.5rem;\n              mask-size:2.5rem 2.5rem;\n    }\n  }\n  .fba-modal-dialog .usa-date-picker__calendar__next-year-chunk:not([disabled]):hover{\n    border:2px solid transparent;\n    background-color:transparent;\n  }\n}\n.fba-modal-dialog .usa-date-picker__calendar__year{\n  padding:10px 0;\n}\n.fba-modal-dialog .usa-date-picker__calendar__year--focused{\n  outline:2px solid #162e51;\n  outline-offset:-2px;\n  position:relative;\n  z-index:100;\n}\n.fba-modal-dialog .usa-date-picker__calendar__year--selected{\n  background-color:#0050d8;\n  color:#f9f9f9;\n}\n.fba-modal-dialog .usa-date-picker__calendar__year--selected:not([disabled]){\n  background-color:#0050d8;\n  color:#f9f9f9;\n}\n.fba-modal-dialog .usa-date-picker__calendar__year--selected:not([disabled]):hover{\n  background-color:#0050d8;\n  color:#e6e6e6;\n}\n.fba-modal-dialog .usa-date-picker__calendar__year--selected:not([disabled]):focus{\n  background-color:#0050d8;\n  color:#f9f9f9;\n}\n.fba-modal-dialog .usa-date-picker__calendar__year--selected:not([disabled]):active{\n  background-color:#1a4480;\n}\n.fba-modal-dialog .usa-embed-container iframe,\n.fba-modal-dialog .usa-embed-container object,\n.fba-modal-dialog .usa-embed-container embed{\n  position:absolute;\n  top:0;\n  left:0;\n  width:100%;\n  height:100%;\n}\n.fba-modal-dialog .usa-embed-container{\n  box-sizing:border-box;\n  height:0;\n  overflow:hidden;\n  padding-bottom:56.25%;\n  position:relative;\n  max-width:100%;\n}\n@supports (aspect-ratio: 1){\n  .fba-modal-dialog .usa-embed-container{\n    height:inherit;\n    padding:inherit;\n    aspect-ratio:1.7777777778;\n    max-width:100%;\n  }\n  .fba-modal-dialog .usa-embed-container > *{\n    position:absolute;\n    top:0;\n    left:0;\n    width:100%;\n    height:100%;\n  }\n  .fba-modal-dialog img.usa-embed-container, .fba-modal-dialog .usa-embed-container > img{\n    -o-object-fit:cover;\n       object-fit:cover;\n  }\n}\n.fba-modal-dialog .usa-error-message{\n  padding-bottom:0.25rem;\n  padding-top:0.25rem;\n  color:#b50909;\n  display:block;\n  font-weight:700;\n}\n.fba-modal-dialog .usa-footer{\n  box-sizing:border-box;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  overflow:hidden;\n}\n.fba-modal-dialog .usa-footer::after, .fba-modal-dialog .usa-footer::before, .fba-modal-dialog .usa-footer *, .fba-modal-dialog .usa-footer *::after, .fba-modal-dialog .usa-footer *::before{\n  box-sizing:inherit;\n}\n.fba-modal-dialog .usa-footer > .grid-container{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  box-sizing:border-box;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-footer > .grid-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n.fba-modal-dialog .usa-footer__return-to-top{\n  padding-bottom:1.25rem;\n  padding-top:1.25rem;\n  line-height:0.9;\n}\n.fba-modal-dialog .usa-footer__return-to-top a{\n  color:#005ea2;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-footer__return-to-top a:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-footer__return-to-top a:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-footer__return-to-top a:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-footer__return-to-top a:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-footer__nav{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  box-sizing:border-box;\n  padding-left:0;\n  padding-right:0;\n  border-bottom:1px solid #a9aeb1;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-footer__nav{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer__nav{\n    padding-left:1rem;\n    padding-right:1rem;\n    border-bottom:none;\n  }\n}\n@media all and (min-width: 30em) and (min-width: 64em){\n  .fba-modal-dialog .usa-footer__nav{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n.fba-modal-dialog .usa-footer__nav > ul{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n.fba-modal-dialog .usa-footer__primary-section{\n  background-color:#f0f0f0;\n}\n.fba-modal-dialog .usa-footer__primary-section > .grid-container{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  box-sizing:border-box;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-footer__primary-section > .grid-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n.fba-modal-dialog .usa-footer__primary-container{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  box-sizing:border-box;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-footer__primary-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-footer__primary-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n.fba-modal-dialog .usa-footer__primary-content{\n  line-height:1.1;\n}\n.fba-modal-dialog .usa-footer__primary-link{\n  padding-left:1rem;\n  padding-right:1rem;\n  padding-bottom:1rem;\n  padding-top:1rem;\n  color:#1b1b1b;\n  font-weight:700;\n  display:block;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer__primary-link{\n    padding-left:0;\n    padding-right:0;\n  }\n}\n.fba-modal-dialog .usa-footer__primary-link--button{\n  width:100%;\n  border:0;\n  cursor:pointer;\n}\n.fba-modal-dialog .usa-footer__primary-link--button::before{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:1.25rem 1.25rem;\n  display:inline-block;\n  height:1.25rem;\n  width:1.25rem;\n  content:\"\";\n  vertical-align:middle;\n  margin-right:0.25rem;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-footer__primary-link--button::before{\n    background:none;\n    background-color:currentColor;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:1.25rem 1.25rem;\n            mask-size:1.25rem 1.25rem;\n  }\n}\n.fba-modal-dialog .usa-footer__primary-link--button:not([disabled]):focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:-0.25rem;\n}\n.fba-modal-dialog .usa-footer__primary-link--button::before{\n  height:1.25rem;\n  width:1.25rem;\n  align-items:center;\n  background-size:contain;\n  content:\"\";\n  display:inline-flex;\n  justify-content:center;\n  margin-right:0.25rem;\n  margin-left:-0.25rem;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-footer__primary-link--button::before{\n    background-color:buttonText !important;\n  }\n}\n.fba-modal-dialog .usa-footer__primary-link--button + .usa-list--unstyled{\n  margin-top:0.5rem;\n  margin-bottom:0.5rem;\n}\n.fba-modal-dialog .usa-footer__primary-link--button[aria-expanded=false]::before{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:1.25rem 1.25rem;\n  display:inline-block;\n  height:1.25rem;\n  width:1.25rem;\n  content:\"\";\n  vertical-align:middle;\n  margin-right:0.25rem;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-footer__primary-link--button[aria-expanded=false]::before{\n    background:none;\n    background-color:currentColor;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/navigate_next.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:1.25rem 1.25rem;\n            mask-size:1.25rem 1.25rem;\n  }\n}\n.fba-modal-dialog .usa-footer__primary-link--button[aria-expanded=false] + .usa-list--unstyled{\n  display:none;\n}\n.fba-modal-dialog .usa-footer__secondary-link{\n  line-height:1.1;\n  margin-left:1rem;\n  padding:0;\n}\n.fba-modal-dialog .usa-footer__secondary-link a{\n  color:#005ea2;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-footer__secondary-link a:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-footer__secondary-link a:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-footer__secondary-link a:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-footer__secondary-link a:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-footer__secondary-link + .usa-footer__secondary-link{\n  padding-top:1rem;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer__secondary-link{\n    margin-left:0;\n  }\n}\n.fba-modal-dialog .usa-footer__contact-info{\n  line-height:1.1;\n}\n.fba-modal-dialog .usa-footer__contact-info a{\n  color:#1b1b1b;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer__contact-info{\n    justify-content:flex-end;\n    margin-top:0.5rem;\n  }\n}\n.fba-modal-dialog .usa-footer__primary-content{\n  border-top:1px solid #a9aeb1;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer__primary-content{\n    border:none;\n  }\n}\n.fba-modal-dialog .usa-sign-up{\n  padding-bottom:2rem;\n  padding-top:1.5rem;\n}\n.fba-modal-dialog .usa-sign-up .usa-label,\n.fba-modal-dialog .usa-sign-up .usa-button{\n  margin-top:0.75rem;\n}\n.fba-modal-dialog .usa-sign-up__heading{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:1.34rem;\n  line-height:1.2;\n  font-weight:700;\n  margin:0;\n}\n.fba-modal-dialog .usa-footer__secondary-section{\n  padding-bottom:1.25rem;\n  padding-top:1.25rem;\n  color:#1b1b1b;\n  background-color:#dfe1e2;\n}\n.fba-modal-dialog .usa-footer__secondary-section > .grid-container{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n  box-sizing:border-box;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-footer__secondary-section > .grid-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n.fba-modal-dialog .usa-footer__secondary-section > .grid-container > .grid-row{\n  justify-content:space-between;\n}\n.fba-modal-dialog .usa-footer__secondary-section a{\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-footer__logo{\n  margin-bottom:0.5rem;\n  margin-top:0.5rem;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer__logo{\n    margin-bottom:0;\n    margin-top:0;\n    align-items:center;\n  }\n}\n.fba-modal-dialog .usa-footer__logo-img{\n  max-width:5rem;\n}\n.fba-modal-dialog .usa-footer__logo-heading{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.46rem;\n  line-height:0.9;\n  font-weight:700;\n  margin-bottom:0.5rem;\n  margin-top:0.5rem;\n}\n.fba-modal-dialog .usa-footer__contact-links{\n  margin-top:1.5rem;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer__contact-links{\n    margin-top:0;\n    text-align:right;\n  }\n}\n.fba-modal-dialog .usa-footer__contact-heading{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.46rem;\n  line-height:1.1;\n  font-weight:700;\n  margin-top:0;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer__contact-heading{\n    margin-bottom:0.25rem;\n    margin-top:0.25rem;\n  }\n}\n.fba-modal-dialog .usa-footer__social-links{\n  line-height:0.9;\n  padding-bottom:0.5rem;\n}\n.fba-modal-dialog .usa-footer__social-links a{\n  text-decoration:none;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer__social-links{\n    justify-content:flex-end;\n  }\n}\n.fba-modal-dialog .usa-social-link{\n  height:3rem;\n  width:3rem;\n  background-color:rgba(0, 0, 0, 0.1);\n  display:inline-block;\n  padding:0.25rem;\n}\n.fba-modal-dialog .usa-social-link:hover{\n  background-color:white;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-social-link{\n    background-color:lightgrey;\n    forced-color-adjust:none;\n  }\n}\n.fba-modal-dialog .usa-social-link__icon{\n  display:block;\n  height:auto;\n  width:100%;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer__address{\n    justify-content:flex-end;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-footer--slim .usa-footer__nav{\n    padding-left:0;\n    padding-right:0;\n  }\n}\n.fba-modal-dialog .usa-footer--slim .usa-footer__address{\n  padding-left:1rem;\n  padding-right:1rem;\n  padding-bottom:1rem;\n  padding-top:1rem;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer--slim .usa-footer__address{\n    padding:0;\n  }\n}\n.fba-modal-dialog .usa-footer--slim .usa-footer__logo{\n  align-items:center;\n}\n.fba-modal-dialog .usa-footer--slim .usa-footer__logo-img{\n  max-width:3rem;\n}\n.fba-modal-dialog .usa-footer--slim .usa-footer__contact-info{\n  display:inline-block;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer--slim .usa-footer__contact-info{\n    padding-bottom:1rem;\n    padding-top:1rem;\n    margin-top:0;\n  }\n}\n.fba-modal-dialog .usa-footer--big .usa-footer__nav{\n  margin-left:-1rem;\n  margin-right:-1rem;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer--big .usa-footer__nav{\n    border-bottom:1px solid #a9aeb1;\n    padding-top:2rem;\n  }\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-footer--big .usa-footer__nav{\n    margin-left:0;\n    margin-right:0;\n    padding-left:0;\n    padding-right:0;\n    border-bottom:none;\n  }\n}\n.fba-modal-dialog .usa-footer--big .usa-footer__primary-link{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:0.98rem;\n  line-height:1.2;\n  font-weight:700;\n  line-height:1.2;\n  margin:0;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer--big .usa-footer__primary-link{\n    padding-bottom:0;\n    padding-top:0;\n    margin-bottom:0.5rem;\n  }\n  .fba-modal-dialog .usa-footer--big .usa-footer__primary-link:hover{\n    cursor:auto;\n    text-decoration:none;\n  }\n}\n.fba-modal-dialog .usa-footer--big .usa-footer__primary-content--collapsible .usa-footer__primary-link{\n  align-items:center;\n  display:flex;\n  justify-content:flex-start;\n}\n.fba-modal-dialog .usa-footer--big .usa-footer__primary-content--collapsible .usa-list--unstyled{\n  padding-left:1rem;\n  padding-right:1rem;\n  padding-bottom:1.25rem;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-footer--big .usa-footer__primary-content--collapsible .usa-list--unstyled{\n    padding-left:0;\n    padding-right:0;\n    padding-bottom:2rem;\n    padding-top:0.75rem;\n  }\n}\n.fba-modal-dialog .usa-form{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.3;\n  box-sizing:border-box;\n}\n.fba-modal-dialog .usa-form::after, .fba-modal-dialog .usa-form::before, .fba-modal-dialog .usa-form *, .fba-modal-dialog .usa-form *::after, .fba-modal-dialog .usa-form *::before{\n  box-sizing:inherit;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-form{\n    max-width:20rem;\n  }\n}\n.fba-modal-dialog .usa-form abbr[title=required]{\n  text-decoration:none;\n}\n.fba-modal-dialog .usa-form .usa-input,\n.fba-modal-dialog .usa-form .usa-range,\n.fba-modal-dialog .usa-form .usa-select,\n.fba-modal-dialog .usa-form .usa-textarea{\n  max-width:none;\n}\n.fba-modal-dialog .usa-form .usa-input--2xs,\n.fba-modal-dialog .usa-form .usa-input-group--2xs{\n  max-width:5ex;\n}\n.fba-modal-dialog .usa-form .usa-input--xs,\n.fba-modal-dialog .usa-form .usa-input-group--xs{\n  max-width:9ex;\n}\n.fba-modal-dialog .usa-form .usa-input--sm, .fba-modal-dialog .usa-form .usa-input--small,\n.fba-modal-dialog .usa-form .usa-input-group--sm,\n.fba-modal-dialog .usa-form .usa-input-group--small{\n  max-width:13ex;\n}\n.fba-modal-dialog .usa-form .usa-input--md, .fba-modal-dialog .usa-form .usa-input--medium,\n.fba-modal-dialog .usa-form .usa-input-group--md,\n.fba-modal-dialog .usa-form .usa-input-group--medium{\n  max-width:20ex;\n}\n.fba-modal-dialog .usa-form .usa-input--lg,\n.fba-modal-dialog .usa-form .usa-input-group--lg{\n  max-width:30ex;\n}\n.fba-modal-dialog .usa-form .usa-input--xl,\n.fba-modal-dialog .usa-form .usa-input-group--xl{\n  max-width:40ex;\n}\n.fba-modal-dialog .usa-form .usa-input--2xl,\n.fba-modal-dialog .usa-form .usa-input-group--2xl{\n  max-width:50ex;\n}\n.fba-modal-dialog .usa-form .usa-button{\n  margin-top:0.5rem;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-form .usa-button{\n    margin-top:1.5rem;\n  }\n}\n.fba-modal-dialog .usa-form a:where(:not(.usa-button)){\n  color:#005ea2;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-form a:where(:not(.usa-button)):visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-form a:where(:not(.usa-button)):hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-form a:where(:not(.usa-button)):active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-form a:where(:not(.usa-button)):focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-form--large{\n    max-width:30rem;\n  }\n}\n.fba-modal-dialog .usa-show-password{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n  cursor:pointer;\n}\n.fba-modal-dialog .usa-show-password:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-show-password:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-show-password:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-show-password:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-show-password:hover, .fba-modal-dialog .usa-show-password.usa-button--hover, .fba-modal-dialog .usa-show-password:disabled:hover, .fba-modal-dialog .usa-show-password[aria-disabled=true]:hover, .fba-modal-dialog .usa-show-password:disabled.usa-button--hover, .fba-modal-dialog .usa-show-password[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-show-password:active, .fba-modal-dialog .usa-show-password.usa-button--active, .fba-modal-dialog .usa-show-password:disabled:active, .fba-modal-dialog .usa-show-password[aria-disabled=true]:active, .fba-modal-dialog .usa-show-password:disabled.usa-button--active, .fba-modal-dialog .usa-show-password[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-show-password:disabled:focus, .fba-modal-dialog .usa-show-password[aria-disabled=true]:focus, .fba-modal-dialog .usa-show-password:disabled.usa-focus, .fba-modal-dialog .usa-show-password[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-show-password:disabled, .fba-modal-dialog .usa-show-password[aria-disabled=true], .fba-modal-dialog .usa-show-password.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-show-password.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-show-password.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-show-password:disabled, .fba-modal-dialog .usa-show-password[aria-disabled=true], .fba-modal-dialog .usa-show-password:disabled:hover, .fba-modal-dialog .usa-show-password[aria-disabled=true]:hover, .fba-modal-dialog .usa-show-password[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-show-password:disabled, .fba-modal-dialog .usa-show-password[aria-disabled=true], .fba-modal-dialog .usa-show-password:disabled:hover, .fba-modal-dialog .usa-show-password[aria-disabled=true]:hover, .fba-modal-dialog .usa-show-password[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-form__note,\n.fba-modal-dialog .usa-show-password{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:0.93rem;\n  line-height:1.3;\n  float:right;\n  margin:0.25rem 0 1rem;\n}\n.fba-modal-dialog .usa-form-group{\n  margin-top:1.5rem;\n}\n.fba-modal-dialog .usa-form-group .usa-label:first-child{\n  margin-top:0;\n}\n.fba-modal-dialog .usa-form-group--error{\n  border-left-width:0.25rem;\n  border-left-color:#b50909;\n  border-left-style:solid;\n  padding-left:1rem;\n  position:relative;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-form-group--error{\n    margin-left:-1.25rem;\n  }\n}\n.fba-modal-dialog .usa-fieldset{\n  border:none;\n  margin:0;\n  padding:0;\n}\n.fba-modal-dialog .usa-header{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  box-sizing:border-box;\n}\n.fba-modal-dialog .usa-header::after{\n  clear:both;\n  content:\"\";\n  display:block;\n}\n.fba-modal-dialog .usa-header::after, .fba-modal-dialog .usa-header::before, .fba-modal-dialog .usa-header *, .fba-modal-dialog .usa-header *::after, .fba-modal-dialog .usa-header *::before{\n  box-sizing:inherit;\n}\n.fba-modal-dialog .usa-header a{\n  border-bottom:none;\n}\n.fba-modal-dialog .usa-header .usa-search{\n  margin-top:0.5rem;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header .usa-search{\n    float:right;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header [role=search]{\n    float:right;\n    max-width:calc(27ch + 3rem);\n    width:100%;\n  }\n}\n.fba-modal-dialog .usa-header [type=search]{\n  min-width:0;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header + .usa-hero{\n    border-top:1px solid white;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header + .usa-section,\n  .fba-modal-dialog .usa-header + main{\n    border-top:1px solid #dfe1e2;\n  }\n}\n@media all and (max-width: 63.99em){\n  .fba-modal-dialog .usa-logo{\n    flex:1 1 0%;\n    font-size:0.93rem;\n    line-height:0.9;\n    margin-left:1rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-logo{\n    margin-top:2rem;\n    margin-bottom:1rem;\n    font-size:1.46rem;\n    line-height:1.1;\n  }\n}\n.fba-modal-dialog .usa-logo a{\n  color:#1b1b1b;\n  text-decoration:none;\n}\n.fba-modal-dialog .usa-logo__text{\n  display:block;\n  font-style:normal;\n  font-weight:700;\n  margin:0;\n}\n.fba-modal-dialog .usa-menu-btn{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n  flex:0 1 auto;\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n  background-color:#005ea2;\n  color:white;\n  font-size:0.87rem;\n  height:3rem;\n  text-align:center;\n  text-decoration:none;\n  text-transform:uppercase;\n}\n.fba-modal-dialog .usa-menu-btn:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-menu-btn:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-menu-btn:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-menu-btn:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-menu-btn:hover, .fba-modal-dialog .usa-menu-btn.usa-button--hover, .fba-modal-dialog .usa-menu-btn:disabled:hover, .fba-modal-dialog .usa-menu-btn[aria-disabled=true]:hover, .fba-modal-dialog .usa-menu-btn:disabled.usa-button--hover, .fba-modal-dialog .usa-menu-btn[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-menu-btn:active, .fba-modal-dialog .usa-menu-btn.usa-button--active, .fba-modal-dialog .usa-menu-btn:disabled:active, .fba-modal-dialog .usa-menu-btn[aria-disabled=true]:active, .fba-modal-dialog .usa-menu-btn:disabled.usa-button--active, .fba-modal-dialog .usa-menu-btn[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-menu-btn:disabled:focus, .fba-modal-dialog .usa-menu-btn[aria-disabled=true]:focus, .fba-modal-dialog .usa-menu-btn:disabled.usa-focus, .fba-modal-dialog .usa-menu-btn[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-menu-btn:disabled, .fba-modal-dialog .usa-menu-btn[aria-disabled=true], .fba-modal-dialog .usa-menu-btn.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-menu-btn.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-menu-btn.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-menu-btn:disabled, .fba-modal-dialog .usa-menu-btn[aria-disabled=true], .fba-modal-dialog .usa-menu-btn:disabled:hover, .fba-modal-dialog .usa-menu-btn[aria-disabled=true]:hover, .fba-modal-dialog .usa-menu-btn[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-menu-btn:disabled, .fba-modal-dialog .usa-menu-btn[aria-disabled=true], .fba-modal-dialog .usa-menu-btn:disabled:hover, .fba-modal-dialog .usa-menu-btn[aria-disabled=true]:hover, .fba-modal-dialog .usa-menu-btn[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-menu-btn{\n    display:none;\n  }\n}\n.fba-modal-dialog .usa-menu-btn:hover{\n  background-color:#1a4480;\n  color:white;\n  text-decoration:none;\n}\n.fba-modal-dialog .usa-menu-btn:active{\n  color:white;\n}\n.fba-modal-dialog .usa-menu-btn:visited{\n  color:white;\n}\n.fba-modal-dialog .usa-overlay{\n  position:absolute;\n  bottom:0;\n  left:0;\n  right:0;\n  top:0;\n  position:fixed;\n  background:rgba(0, 0, 0, 0.7);\n  opacity:0;\n  transition:opacity 0.15s ease-in-out;\n  visibility:hidden;\n  z-index:400;\n}\n.fba-modal-dialog .usa-overlay.is-visible{\n  opacity:1;\n  visibility:visible;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--basic .usa-navbar{\n    position:relative;\n    width:33%;\n  }\n  .fba-modal-dialog .usa-header--basic .usa-nav{\n    flex-direction:row;\n    align-items:center;\n    justify-content:flex-end;\n    display:flex;\n    padding:0 0 0.5rem 0.5rem;\n    width:100%;\n  }\n  .fba-modal-dialog .usa-header--basic .usa-nav-container{\n    align-items:flex-end;\n    justify-content:space-between;\n    display:flex;\n  }\n  .fba-modal-dialog .usa-header--basic .usa-nav__primary-item > .usa-current,\n  .fba-modal-dialog .usa-header--basic .usa-nav__link:hover{\n    position:relative;\n  }\n  .fba-modal-dialog .usa-header--basic .usa-nav__primary-item > .usa-current::after,\n  .fba-modal-dialog .usa-header--basic .usa-nav__link:hover::after{\n    background-color:#005ea2;\n    border-radius:0;\n    content:\"\";\n    display:block;\n    position:absolute;\n    height:0.25rem;\n    left:1rem;\n    right:1rem;\n    bottom:-0.25rem;\n  }\n}\n@media (min-width: 64em) and (forced-colors: active){\n  .fba-modal-dialog .usa-header--basic .usa-nav__primary-item > .usa-current::after,\n  .fba-modal-dialog .usa-header--basic .usa-nav__link:hover::after{\n    background-color:ButtonText;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--basic .usa-nav__link[aria-expanded=true]::after,\n  .fba-modal-dialog .usa-header--basic .usa-nav__link[aria-expanded=true]:hover::after{\n    display:none;\n  }\n  .fba-modal-dialog .usa-header--basic .usa-nav__primary{\n    width:auto;\n  }\n  .fba-modal-dialog .usa-header--basic .usa-nav__primary-item:last-of-type{\n    position:relative;\n  }\n  .fba-modal-dialog .usa-header--basic .usa-nav__primary-item:last-of-type .usa-nav__submenu{\n    position:absolute;\n    right:0;\n  }\n  .fba-modal-dialog .usa-header--basic .usa-search{\n    top:0;\n  }\n}\n.fba-modal-dialog .usa-header--basic.usa-header--megamenu .usa-nav__inner{\n  display:flex;\n  flex-direction:column;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--basic.usa-header--megamenu .usa-nav__inner{\n    display:block;\n    float:right;\n    margin-top:-2.5rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--basic.usa-header--megamenu .usa-nav__primary-item:last-of-type{\n    position:static;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended{\n    padding-top:0;\n  }\n  .fba-modal-dialog .usa-header--extended .usa-nav__primary-item > .usa-current,\n  .fba-modal-dialog .usa-header--extended .usa-nav__primary-item > .usa-nav__link:hover{\n    position:relative;\n  }\n  .fba-modal-dialog .usa-header--extended .usa-nav__primary-item > .usa-current::after,\n  .fba-modal-dialog .usa-header--extended .usa-nav__primary-item > .usa-nav__link:hover::after{\n    background-color:#005ea2;\n    border-radius:0;\n    content:\"\";\n    display:block;\n    position:absolute;\n    height:0.25rem;\n    left:1rem;\n    right:1rem;\n    bottom:0rem;\n  }\n}\n@media (min-width: 64em) and (forced-colors: active){\n  .fba-modal-dialog .usa-header--extended .usa-nav__primary-item > .usa-current::after,\n  .fba-modal-dialog .usa-header--extended .usa-nav__primary-item > .usa-nav__link:hover::after{\n    background-color:ButtonText;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-nav__link[aria-expanded=true]::after,\n  .fba-modal-dialog .usa-header--extended .usa-nav__link[aria-expanded=true]:hover::after{\n    display:none;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-logo{\n    font-size:2.13rem;\n    margin:2rem 0 1.5rem;\n    max-width:33%;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-navbar{\n    margin-left:auto;\n    margin-right:auto;\n    max-width:64rem;\n    padding-left:1rem;\n    padding-right:1rem;\n    box-sizing:border-box;\n    display:block;\n    height:auto;\n    overflow:auto;\n  }\n}\n@media all and (min-width: 64em) and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-navbar{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-nav{\n    border-top:1px solid #dfe1e2;\n    padding:0;\n    width:100%;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-nav__inner{\n    margin-left:auto;\n    margin-right:auto;\n    max-width:64rem;\n    padding-left:1rem;\n    padding-right:1rem;\n    box-sizing:border-box;\n    position:relative;\n  }\n}\n@media all and (min-width: 64em) and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-nav__inner{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-nav__primary{\n    margin-left:-1rem;\n  }\n  .fba-modal-dialog .usa-header--extended .usa-nav__primary::after{\n    clear:both;\n    content:\"\";\n    display:block;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-nav__link{\n    padding-bottom:1rem;\n    padding-top:1rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-nav__submenu .usa-grid-full{\n    padding-left:0.75rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-nav__submenu.usa-megamenu{\n    left:0;\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n.fba-modal-dialog html.usa-js-loading .usa-nav__submenu,\n.fba-modal-dialog html.usa-js-loading .usa-nav__submenu.usa-megamenu{\n  position:absolute;\n  left:-999em;\n  right:auto;\n}\n.fba-modal-dialog .usa-megamenu .usa-col{\n  flex:1 1 auto;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-megamenu .usa-col{\n    flex:4 1 0%;\n  }\n  .fba-modal-dialog .usa-megamenu .usa-col .usa-nav__submenu-item a{\n    padding-left:0.5rem;\n    padding-right:0.5rem;\n  }\n  .fba-modal-dialog .usa-megamenu .usa-col:first-child .usa-nav__submenu-item a{\n    padding-left:0;\n  }\n  .fba-modal-dialog .usa-megamenu .usa-col:last-child .usa-nav__submenu-item a{\n    padding-right:0;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-megamenu.usa-nav__submenu{\n    padding-left:0;\n    padding-right:0;\n    padding-bottom:2rem;\n    padding-top:2rem;\n    left:-33%;\n    right:0;\n    width:auto;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-megamenu.usa-nav__submenu::before{\n    position:absolute;\n    bottom:0;\n    top:0;\n    background-color:#162e51;\n    content:\"\";\n    display:block;\n    position:absolute;\n    width:calc(50vw - 32rem + 2rem);\n    right:100%;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-megamenu.usa-nav__submenu::after{\n    position:absolute;\n    bottom:0;\n    top:0;\n    background-color:#162e51;\n    content:\"\";\n    display:block;\n    position:absolute;\n    width:calc(50vw - 32rem + 2rem);\n    left:100%;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-megamenu.usa-nav__submenu::before{\n    position:absolute;\n    bottom:0;\n    top:0;\n    background-color:#162e51;\n    content:\"\";\n    display:block;\n    position:absolute;\n    width:calc(50vw - 32rem);\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-header--extended .usa-megamenu.usa-nav__submenu::after{\n    position:absolute;\n    bottom:0;\n    top:0;\n    background-color:#162e51;\n    content:\"\";\n    display:block;\n    position:absolute;\n    width:calc(50vw - 32rem);\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav-container{\n    margin-left:auto;\n    margin-right:auto;\n    max-width:64rem;\n    padding-left:1rem;\n    padding-right:1rem;\n    box-sizing:border-box;\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n  .fba-modal-dialog .usa-nav-container::after{\n    clear:both;\n    content:\"\";\n    display:block;\n  }\n}\n@media all and (min-width: 64em) and (min-width: 64em){\n  .fba-modal-dialog .usa-nav-container{\n    padding-left:2rem;\n    padding-right:2rem;\n  }\n}\n.fba-modal-dialog .usa-navbar{\n  box-sizing:border-box;\n  height:3rem;\n}\n.fba-modal-dialog .usa-navbar::after, .fba-modal-dialog .usa-navbar::before, .fba-modal-dialog .usa-navbar *, .fba-modal-dialog .usa-navbar *::after, .fba-modal-dialog .usa-navbar *::before{\n  box-sizing:inherit;\n}\n@media all and (max-width: 63.99em){\n  .fba-modal-dialog .usa-navbar{\n    align-items:center;\n    border-bottom:1px solid #dfe1e2;\n    display:flex;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-navbar{\n    border-bottom:none;\n    display:inline-block;\n    height:auto;\n  }\n}\n.fba-modal-dialog .usa-hint{\n  color:#71767a;\n}\n.fba-modal-dialog .usa-hint--required{\n  color:#b50909;\n}\n.fba-modal-dialog .usa-input:disabled, .fba-modal-dialog .usa-input[aria-disabled=true]{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n  -webkit-text-fill-color:#454545;\n}\n.fba-modal-dialog .usa-input:disabled:hover, .fba-modal-dialog .usa-input:disabled:active, .fba-modal-dialog .usa-input:disabled:focus, .fba-modal-dialog .usa-input:disabled.usa-focus, .fba-modal-dialog .usa-input[aria-disabled=true]:hover, .fba-modal-dialog .usa-input[aria-disabled=true]:active, .fba-modal-dialog .usa-input[aria-disabled=true]:focus, .fba-modal-dialog .usa-input[aria-disabled=true].usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-input:disabled, .fba-modal-dialog .usa-input[aria-disabled=true]{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-input:disabled:hover, .fba-modal-dialog .usa-input:disabled:active, .fba-modal-dialog .usa-input:disabled:focus, .fba-modal-dialog .usa-input:disabled.usa-focus, .fba-modal-dialog .usa-input[aria-disabled=true]:hover, .fba-modal-dialog .usa-input[aria-disabled=true]:active, .fba-modal-dialog .usa-input[aria-disabled=true]:focus, .fba-modal-dialog .usa-input[aria-disabled=true].usa-focus{\n    color:GrayText;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-input:disabled, .fba-modal-dialog .usa-input[aria-disabled=true]{\n    border:2px solid GrayText;\n  }\n}\n.fba-modal-dialog .usa-input--error{\n  border-width:0.25rem;\n  border-color:#b50909;\n  border-style:solid;\n  padding-top:calc(0.5rem - 0.25rem);\n  padding-bottom:calc(0.5rem - 0.25rem);\n}\n.fba-modal-dialog .usa-input--success{\n  border-width:0.25rem;\n  border-color:#00a91c;\n  border-style:solid;\n  padding-top:calc(0.5rem - 0.25rem);\n  padding-bottom:calc(0.5rem - 0.25rem);\n}\n.fba-modal-dialog .usa-input-list{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n.fba-modal-dialog .usa-input-list li{\n  line-height:1.3;\n}\n.fba-modal-dialog .usa-prose .usa-input-list{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n.fba-modal-dialog .usa-prose .usa-input-list li{\n  line-height:1.3;\n}\n.fba-modal-dialog .usa-intro{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:1.34rem;\n  line-height:1.8;\n  font-weight:400;\n  max-width:88ex;\n}\n.fba-modal-dialog .usa-label{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.3;\n  display:block;\n  font-weight:normal;\n  margin-top:1.5rem;\n  max-width:none;\n}\n.fba-modal-dialog .usa-label--error{\n  font-weight:700;\n  margin-top:0;\n}\n.fba-modal-dialog .usa-label--required{\n  color:#b50909;\n}\n.fba-modal-dialog .usa-legend{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.3;\n  display:block;\n  font-weight:normal;\n  margin-top:1.5rem;\n  max-width:none;\n}\n.fba-modal-dialog .usa-legend--large{\n  font-size:2.13rem;\n  font-weight:700;\n  margin-top:1rem;\n}\n.fba-modal-dialog .usa-link{\n  color:#005ea2;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-link:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-link:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-link:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-link:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-link--external{\n  display:inline;\n}\n.fba-modal-dialog .usa-link--external::before{\n  position:absolute;\n  left:-999em;\n  right:auto;\n  content:\"External.\";\n}\n.fba-modal-dialog .usa-link--external[target=_blank]::before{\n  position:absolute;\n  left:-999em;\n  right:auto;\n  content:\"External, opens in a new tab.\";\n}\n.fba-modal-dialog .usa-link--external::after{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/launch.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:1.75ex 1.75ex;\n  display:inline-block;\n  height:1.75ex;\n  width:1.75ex;\n  content:\"\";\n  display:inline;\n  margin-top:0.7ex;\n  margin-left:2px;\n  padding-left:1.75ex;\n  vertical-align:middle;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-link--external::after{\n    background:none;\n    background-color:currentColor;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/launch.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/launch.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:1.75ex 1.75ex;\n            mask-size:1.75ex 1.75ex;\n  }\n}\n.fba-modal-dialog .usa-link--external.usa-link--alt{\n  display:inline;\n}\n.fba-modal-dialog .usa-link--external.usa-link--alt::before{\n  position:absolute;\n  left:-999em;\n  right:auto;\n  content:\"External.\";\n}\n.fba-modal-dialog .usa-link--external.usa-link--alt[target=_blank]::before{\n  position:absolute;\n  left:-999em;\n  right:auto;\n  content:\"External, opens in a new tab.\";\n}\n.fba-modal-dialog .usa-link--external.usa-link--alt::after{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons-bg/launch--white.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:1.75ex 1.75ex;\n  display:inline-block;\n  height:1.75ex;\n  width:1.75ex;\n  content:\"\";\n  display:inline;\n  margin-top:0.7ex;\n  margin-left:2px;\n  padding-left:1.75ex;\n  vertical-align:middle;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-link--external.usa-link--alt::after{\n    background:none;\n    background-color:currentColor;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/launch.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/launch.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:1.75ex 1.75ex;\n            mask-size:1.75ex 1.75ex;\n  }\n}\n.fba-modal-dialog .usa-list{\n  margin-bottom:1em;\n  margin-top:1em;\n  line-height:1.5;\n  padding-left:3ch;\n}\n.fba-modal-dialog .usa-list:last-child{\n  margin-bottom:0;\n}\n.fba-modal-dialog .usa-list ul,\n.fba-modal-dialog .usa-list ol{\n  margin-top:0.25em;\n}\n.fba-modal-dialog .usa-list li{\n  margin-bottom:0.25em;\n  max-width:68ex;\n}\n.fba-modal-dialog .usa-list li:last-child{\n  margin-bottom:0;\n}\n.fba-modal-dialog .usa-list--unstyled{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n.fba-modal-dialog .usa-list--unstyled > li{\n  margin-bottom:0;\n  max-width:unset;\n}\n.fba-modal-dialog .usa-prose .usa-list--unstyled{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n.fba-modal-dialog .usa-prose .usa-list--unstyled > li{\n  margin-bottom:0;\n  max-width:unset;\n}\n@keyframes slidein-left{\n  from{\n    transform:translateX(15rem);\n  }\n  to{\n    transform:translateX(0);\n  }\n}\n.fba-modal-dialog .usa-nav{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:0.9;\n}\n@media all and (max-width: 63.99em){\n  .fba-modal-dialog .usa-nav{\n    position:absolute;\n    right:0;\n    position:absolute;\n    bottom:0;\n    top:0;\n    position:fixed;\n    background:white;\n    border-right:0;\n    display:none;\n    flex-direction:column;\n    overflow-y:auto;\n    padding:1rem;\n    width:15rem;\n    z-index:500;\n  }\n  .fba-modal-dialog .usa-nav.is-visible{\n    animation:slidein-left 0.3s ease-in-out;\n    display:flex;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav{\n    float:right;\n    position:relative;\n  }\n}\n.fba-modal-dialog .usa-nav .usa-search{\n  margin-top:1rem;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav .usa-search{\n    margin-left:1rem;\n    margin-top:0;\n  }\n}\n.fba-modal-dialog .usa-nav .usa-accordion{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:0.9;\n}\n@media all and (max-width: 63.99em){\n  .fba-modal-dialog .usa-nav__primary{\n    margin-bottom:0;\n    margin-top:0;\n    list-style-type:none;\n    padding-left:0;\n  }\n  .fba-modal-dialog .usa-nav__primary > li{\n    margin-bottom:0;\n    max-width:unset;\n  }\n  .fba-modal-dialog .usa-nav__primary-item{\n    border-top:1px solid #dfe1e2;\n  }\n  .fba-modal-dialog .usa-nav__primary a:not(.usa-button){\n    display:block;\n    padding:0.5rem 1rem;\n    text-decoration:none;\n  }\n  .fba-modal-dialog .usa-nav__primary a:not(.usa-button):hover{\n    background-color:#f0f0f0;\n    text-decoration:none;\n  }\n  .fba-modal-dialog .usa-nav__primary a:not(.usa-button):not(.usa-current){\n    color:#565c65;\n  }\n  .fba-modal-dialog .usa-nav__primary a:not(.usa-button):not(.usa-current):hover{\n    color:#005ea2;\n  }\n  .fba-modal-dialog .usa-nav__primary a:not(.usa-button):not(.usa-current):focus{\n    outline-offset:0;\n  }\n  .fba-modal-dialog .usa-nav__primary .usa-current{\n    position:relative;\n    color:#005ea2;\n    font-weight:700;\n  }\n  .fba-modal-dialog .usa-nav__primary .usa-current::after{\n    background-color:#005ea2;\n    border-radius:99rem;\n    content:\"\";\n    display:block;\n    position:absolute;\n    bottom:0.25rem;\n    top:0.25rem;\n    width:0.25rem;\n    left:0.25rem;\n  }\n}\n@media all and (max-width: 63.99em) and (min-width: 40em){\n  .fba-modal-dialog .usa-nav__primary .usa-current{\n    position:relative;\n  }\n  .fba-modal-dialog .usa-nav__primary .usa-current::after{\n    background-color:#005ea2;\n    border-radius:99rem;\n    content:\"\";\n    display:block;\n    position:absolute;\n    bottom:0.25rem;\n    top:0.25rem;\n    width:0.25rem;\n    left:0rem;\n  }\n}\n@media all and (max-width: 63.99em){\n  .fba-modal-dialog .usa-nav__primary a{\n    padding-bottom:0.75rem;\n    padding-top:0.75rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary{\n    display:flex;\n    align-items:stretch;\n  }\n}\n.fba-modal-dialog .usa-nav__primary .usa-nav__primary-item a{\n  text-decoration:none;\n}\n.fba-modal-dialog .usa-nav__primary > .usa-nav__primary-item{\n  line-height:1.1;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary > .usa-nav__primary-item{\n    font-size:0.93rem;\n    line-height:0.9;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary > .usa-nav__primary-item > a{\n    line-height:0.9;\n    padding:1rem;\n    align-items:center;\n    color:#565c65;\n    display:flex;\n    font-weight:700;\n  }\n  .fba-modal-dialog .usa-nav__primary > .usa-nav__primary-item > a:hover{\n    color:#005ea2;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary > .usa-nav__primary-item > button,\n  .fba-modal-dialog .usa-nav__primary > .usa-nav__primary-item > a{\n    height:100%;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary a{\n    padding-bottom:0.5rem;\n    padding-top:0.5rem;\n  }\n}\n.fba-modal-dialog .usa-nav__primary button{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n  position:relative;\n  color:#565c65;\n  font-weight:normal;\n  line-height:1.1;\n  padding:0.75rem 1rem;\n  text-decoration:none;\n  width:100%;\n}\n.fba-modal-dialog .usa-nav__primary button:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-nav__primary button:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-nav__primary button:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-nav__primary button:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-nav__primary button:hover, .fba-modal-dialog .usa-nav__primary button.usa-button--hover, .fba-modal-dialog .usa-nav__primary button:disabled:hover, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true]:hover, .fba-modal-dialog .usa-nav__primary button:disabled.usa-button--hover, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-nav__primary button:active, .fba-modal-dialog .usa-nav__primary button.usa-button--active, .fba-modal-dialog .usa-nav__primary button:disabled:active, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true]:active, .fba-modal-dialog .usa-nav__primary button:disabled.usa-button--active, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-nav__primary button:disabled:focus, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true]:focus, .fba-modal-dialog .usa-nav__primary button:disabled.usa-focus, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-nav__primary button:disabled, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true], .fba-modal-dialog .usa-nav__primary button.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-nav__primary button.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-nav__primary button.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-nav__primary button:disabled, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true], .fba-modal-dialog .usa-nav__primary button:disabled:hover, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true]:hover, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-nav__primary button:disabled, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true], .fba-modal-dialog .usa-nav__primary button:disabled:hover, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true]:hover, .fba-modal-dialog .usa-nav__primary button[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary button{\n    line-height:0.9;\n    padding:1rem;\n    font-size:0.93rem;\n    font-weight:700;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-nav__primary button{\n    forced-color-adjust:auto;\n  }\n}\n.fba-modal-dialog .usa-nav__primary button:hover{\n  color:#005ea2;\n  background-color:#f0f0f0;\n  text-decoration:none;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary button:hover{\n    background-color:transparent;\n  }\n}\n.fba-modal-dialog .usa-nav__primary button[aria-expanded], .fba-modal-dialog .usa-nav__primary button[aria-expanded]:hover{\n  background-image:none;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded]::before, .fba-modal-dialog .usa-nav__primary button[aria-expanded]:hover::before{\n    content:none;\n  }\n}\n.fba-modal-dialog .usa-nav__primary button[aria-expanded] span::after{\n  position:absolute;\n  top:50%;\n  right:0;\n  transform:translateY(-50%);\n}\n.fba-modal-dialog .usa-nav__primary button[aria-expanded=false] span::after{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/add.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:1.25rem 1.25rem;\n  display:inline-block;\n  height:1.25rem;\n  width:1.25rem;\n  content:\"\";\n  vertical-align:middle;\n  margin-left:auto;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=false] span::after{\n    background:none;\n    background-color:ButtonText;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/add.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/add.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:1.25rem 1.25rem;\n            mask-size:1.25rem 1.25rem;\n  }\n}\n.fba-modal-dialog .usa-nav__primary button[aria-expanded=false] span::after:hover{\n  background-color:buttonText;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=false] span::after{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1rem 1rem;\n    display:inline-block;\n    height:1rem;\n    width:1rem;\n    content:\"\";\n    vertical-align:middle;\n    margin-left:auto;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-nav__primary button[aria-expanded=false] span::after{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_more.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1rem 1rem;\n              mask-size:1rem 1rem;\n    }\n  }\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=false] span::after{\n    right:0.75rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=false]:hover span::after{\n    background-color:#1a4480;\n  }\n}\n@media (min-width: 64em) and (forced-colors: active){\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=false]:hover span::after{\n    background-color:ButtonText;\n  }\n}\n.fba-modal-dialog .usa-nav__primary button[aria-expanded=true] span::after{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/remove.svg\");\n  background-repeat:no-repeat;\n  background-position:center center;\n  background-size:1.25rem 1.25rem;\n  display:inline-block;\n  height:1.25rem;\n  width:1.25rem;\n  content:\"\";\n  vertical-align:middle;\n  margin-left:auto;\n}\n@supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=true] span::after{\n    background:none;\n    background-color:ButtonText;\n    -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/remove.svg\"), linear-gradient(transparent, transparent);\n            mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/remove.svg\"), linear-gradient(transparent, transparent);\n    -webkit-mask-position:center center;\n            mask-position:center center;\n    -webkit-mask-repeat:no-repeat;\n            mask-repeat:no-repeat;\n    -webkit-mask-size:1.25rem 1.25rem;\n            mask-size:1.25rem 1.25rem;\n  }\n}\n.fba-modal-dialog .usa-nav__primary button[aria-expanded=true] span::after{\n  position:absolute;\n  right:0;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=true] span::after{\n    background-color:ButtonText;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=true]{\n    background-image:none;\n    background-color:#162e51;\n    color:white;\n  }\n}\n@media all and (min-width: 64em) and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=true] span::after{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_less.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1rem 1rem;\n    display:inline-block;\n    height:1rem;\n    width:1rem;\n    content:\"\";\n    vertical-align:middle;\n    margin-left:auto;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-nav__primary button[aria-expanded=true] span::after{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_less.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/expand_less.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1rem 1rem;\n              mask-size:1rem 1rem;\n    }\n  }\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=true] span::after{\n    right:0.75rem;\n    background-color:white;\n  }\n}\n@media (min-width: 64em) and (min-width: 64em) and (forced-colors: active){\n  .fba-modal-dialog .usa-nav__primary button[aria-expanded=true] span::after{\n    background-color:ButtonText;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__primary .usa-accordion__button span{\n    display:inline-block;\n    margin-right:0;\n    padding-right:1rem;\n  }\n}\n.fba-modal-dialog .usa-nav__secondary{\n  margin-top:1rem;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__secondary{\n    flex-direction:column;\n    align-items:flex-end;\n    bottom:4rem;\n    display:flex;\n    font-size:0.93rem;\n    margin-top:0.5rem;\n    min-width:calc(27ch + 3rem);\n    position:absolute;\n    right:2rem;\n  }\n}\n.fba-modal-dialog .usa-nav__secondary .usa-search{\n  width:100%;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__secondary .usa-search{\n    margin-left:0;\n    margin-top:0.5rem;\n  }\n}\n.fba-modal-dialog .usa-nav__secondary-links{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n  line-height:1.3;\n  margin-top:1.5rem;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__secondary-links{\n    -moz-column-gap:0.5rem;\n         column-gap:0.5rem;\n    display:flex;\n    flex-flow:row nowrap;\n    line-height:0.9;\n    margin-bottom:0.25rem;\n    margin-top:0;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__secondary-links .usa-nav__secondary-item{\n    padding-left:0.25rem;\n  }\n  .fba-modal-dialog .usa-nav__secondary-links .usa-nav__secondary-item + .usa-nav__secondary-item{\n    border-left:1px solid #dfe1e2;\n    padding-left:0.5rem;\n  }\n}\n.fba-modal-dialog .usa-nav__secondary-links a{\n  color:#71767a;\n  display:inline-block;\n  font-size:0.93rem;\n  text-decoration:none;\n}\n.fba-modal-dialog .usa-nav__secondary-links a:hover{\n  color:#005ea2;\n  text-decoration:underline;\n}\n@media all and (max-width: 63.99em){\n  .fba-modal-dialog .usa-nav__submenu{\n    margin-bottom:0;\n    margin-top:0;\n    list-style-type:none;\n    padding-left:0;\n    margin:0;\n  }\n  .fba-modal-dialog .usa-nav__submenu > li{\n    margin-bottom:0;\n    max-width:unset;\n  }\n  .fba-modal-dialog .usa-nav__submenu-item{\n    border-top:1px solid #dfe1e2;\n    font-size:0.93rem;\n  }\n  .fba-modal-dialog .usa-nav__submenu .usa-current::after{\n    display:none;\n  }\n}\n@media all and (max-width: 63.99em) and (min-width: 40em){\n  .fba-modal-dialog .usa-nav__submenu .usa-current::after{\n    display:none;\n  }\n}\n@media all and (max-width: 63.99em){\n  .fba-modal-dialog .usa-nav__submenu a:not(.usa-button){\n    padding-left:2rem;\n  }\n  .fba-modal-dialog .usa-nav__submenu .usa-nav__submenu a:not(.usa-button){\n    padding-left:3rem;\n  }\n  .fba-modal-dialog .usa-nav__submenu .usa-nav__submenu .usa-nav__submenu a:not(.usa-button){\n    padding-left:4rem;\n  }\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__submenu{\n    margin-bottom:0;\n    margin-top:0;\n    list-style-type:none;\n    padding-left:0;\n    padding-bottom:0.5rem;\n    padding-top:0.5rem;\n    background-color:#162e51;\n    width:15rem;\n    position:absolute;\n    z-index:400;\n  }\n}\n.fba-modal-dialog .usa-nav__submenu[aria-hidden=true]{\n  display:none;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__submenu .usa-nav__submenu-item a{\n    padding-left:1rem;\n    padding-right:1rem;\n    color:white;\n    line-height:1.3;\n    display:block;\n  }\n  .fba-modal-dialog .usa-nav__submenu .usa-nav__submenu-item a:focus{\n    outline-offset:-0.25rem;\n  }\n  .fba-modal-dialog .usa-nav__submenu .usa-nav__submenu-item a:hover{\n    color:white;\n    text-decoration:underline;\n  }\n}\n.fba-modal-dialog .usa-nav__submenu-list{\n  margin-bottom:0;\n  margin-top:0;\n  list-style-type:none;\n  padding-left:0;\n}\n.fba-modal-dialog .usa-nav__submenu-list > li{\n  margin-bottom:0;\n  max-width:unset;\n}\n.fba-modal-dialog .usa-nav__submenu-list .usa-nav__submenu-list-item{\n  margin:0;\n  font-size:0.93rem;\n}\n.fba-modal-dialog .usa-nav__submenu-list .usa-nav__submenu-list-item a{\n  line-height:1.3;\n}\n.fba-modal-dialog .usa-nav__close{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n  height:3rem;\n  width:3rem;\n  background-image:none;\n  color:currentColor;\n  flex:none;\n  float:right;\n  margin:-0.75rem -1rem 1rem auto;\n  text-align:center;\n}\n.fba-modal-dialog .usa-nav__close:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-nav__close:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-nav__close:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-nav__close:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-nav__close:hover, .fba-modal-dialog .usa-nav__close.usa-button--hover, .fba-modal-dialog .usa-nav__close:disabled:hover, .fba-modal-dialog .usa-nav__close[aria-disabled=true]:hover, .fba-modal-dialog .usa-nav__close:disabled.usa-button--hover, .fba-modal-dialog .usa-nav__close[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-nav__close:active, .fba-modal-dialog .usa-nav__close.usa-button--active, .fba-modal-dialog .usa-nav__close:disabled:active, .fba-modal-dialog .usa-nav__close[aria-disabled=true]:active, .fba-modal-dialog .usa-nav__close:disabled.usa-button--active, .fba-modal-dialog .usa-nav__close[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-nav__close:disabled:focus, .fba-modal-dialog .usa-nav__close[aria-disabled=true]:focus, .fba-modal-dialog .usa-nav__close:disabled.usa-focus, .fba-modal-dialog .usa-nav__close[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-nav__close:disabled, .fba-modal-dialog .usa-nav__close[aria-disabled=true], .fba-modal-dialog .usa-nav__close.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-nav__close.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-nav__close.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-nav__close:disabled, .fba-modal-dialog .usa-nav__close[aria-disabled=true], .fba-modal-dialog .usa-nav__close:disabled:hover, .fba-modal-dialog .usa-nav__close[aria-disabled=true]:hover, .fba-modal-dialog .usa-nav__close[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-nav__close:disabled, .fba-modal-dialog .usa-nav__close[aria-disabled=true], .fba-modal-dialog .usa-nav__close:disabled:hover, .fba-modal-dialog .usa-nav__close[aria-disabled=true]:hover, .fba-modal-dialog .usa-nav__close[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-nav__close::before{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/close.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1.25rem 1.25rem;\n    display:inline-block;\n    height:1.25rem;\n    width:1.25rem;\n    content:\"\";\n    vertical-align:middle;\n    margin-right:auto;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-nav__close::before{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/close.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/close.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1.25rem 1.25rem;\n              mask-size:1.25rem 1.25rem;\n    }\n  }\n  .fba-modal-dialog .usa-nav__close::before{\n    background-color:buttonText;\n  }\n}\n.fba-modal-dialog .usa-nav__close:hover{\n  color:currentColor;\n  text-decoration:none;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-nav__close{\n    display:none;\n  }\n}\n.fba-modal-dialog .usa-nav__close img{\n  width:1.5rem;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-nav__close img{\n    display:none;\n  }\n}\n.fba-modal-dialog .usa-nav__close + *{\n  clear:both;\n}\n.fba-modal-dialog .usa-js-mobile-nav--active{\n  overflow:hidden;\n}\n@media (min-width: 63.06rem){\n  .fba-modal-dialog .usa-js-mobile-nav--active.is-safari{\n    overflow-y:scroll;\n    position:fixed;\n    top:var(--scrolltop, 0);\n  }\n}\n.fba-modal-dialog .usa-prose{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n}\n.fba-modal-dialog .usa-prose > ul,\n.fba-modal-dialog .usa-prose > ol{\n  margin-bottom:1em;\n  margin-top:1em;\n  line-height:1.5;\n  padding-left:3ch;\n}\n.fba-modal-dialog .usa-prose > ul:last-child,\n.fba-modal-dialog .usa-prose > ol:last-child{\n  margin-bottom:0;\n}\n.fba-modal-dialog .usa-prose > ul ul,\n.fba-modal-dialog .usa-prose > ul ol,\n.fba-modal-dialog .usa-prose > ol ul,\n.fba-modal-dialog .usa-prose > ol ol{\n  margin-top:0.25em;\n}\n.fba-modal-dialog .usa-prose > ul li,\n.fba-modal-dialog .usa-prose > ol li{\n  margin-bottom:0.25em;\n  max-width:68ex;\n}\n.fba-modal-dialog .usa-prose > ul li:last-child,\n.fba-modal-dialog .usa-prose > ol li:last-child{\n  margin-bottom:0;\n}\n.fba-modal-dialog .usa-prose > table{\n  box-sizing:border-box;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  border-collapse:collapse;\n  border-spacing:0;\n  color:#1b1b1b;\n  margin:1.25rem 0;\n  text-align:left;\n}\n.fba-modal-dialog .usa-prose > table::after, .fba-modal-dialog .usa-prose > table::before, .fba-modal-dialog .usa-prose > table *, .fba-modal-dialog .usa-prose > table *::after, .fba-modal-dialog .usa-prose > table *::before{\n  box-sizing:inherit;\n}\n.fba-modal-dialog .usa-prose > table thead th{\n  background-clip:padding-box;\n  color:#1b1b1b;\n  font-weight:700;\n  line-height:1.3;\n}\n.fba-modal-dialog .usa-prose > table thead th,\n.fba-modal-dialog .usa-prose > table thead td{\n  background-color:#dfe1e2;\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-prose > table tbody th{\n  text-align:left;\n}\n.fba-modal-dialog .usa-prose > table th,\n.fba-modal-dialog .usa-prose > table td{\n  background-color:white;\n  border:1px solid #1b1b1b;\n  font-weight:normal;\n  padding:0.5rem 1rem;\n}\n.fba-modal-dialog .usa-prose > table caption{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1rem;\n  font-weight:700;\n  margin-bottom:0.75rem;\n  text-align:left;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]{\n  padding-right:2.5rem;\n  position:relative;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]::after{\n  border-bottom-color:transparent;\n  border-bottom-style:solid;\n  border-bottom-width:1px;\n  bottom:0;\n  content:\"\";\n  height:0;\n  left:0;\n  position:absolute;\n  width:100%;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n  height:2rem;\n  width:2rem;\n  background-position:center center;\n  background-size:1.5rem;\n  color:#71767a;\n  cursor:pointer;\n  display:inline-block;\n  margin:0;\n  position:absolute;\n  right:0.25rem;\n  text-align:center;\n  text-decoration:none;\n  top:50%;\n  transform:translate(0, -50%);\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:visited, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:hover, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button.usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled.usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:active, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button.usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled:active, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true]:active, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled.usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled:focus, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true]:focus, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled.usa-focus, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button.usa-button--disabled, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button.usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled.usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button.usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled:active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true]:active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled.usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled:focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true]:focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled.usa-focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button.usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button.usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true]:focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button[aria-disabled=true]:focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button .usa-icon, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button .usa-icon{\n  height:1.5rem;\n  width:1.5rem;\n  vertical-align:middle;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button .usa-icon > g, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button .usa-icon > g{\n  fill:transparent;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button .usa-icon > g.unsorted, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button .usa-icon > g.unsorted{\n  fill:#1b1b1b;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable]:not([aria-sort]) .usa-table__header__button:hover .usa-icon > g.unsorted, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=none] .usa-table__header__button:hover .usa-icon > g.unsorted{\n  fill:black;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending], .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending]{\n  background-color:#97d4ea;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n  height:2rem;\n  width:2rem;\n  background-position:center center;\n  background-size:1.5rem;\n  color:#71767a;\n  cursor:pointer;\n  display:inline-block;\n  margin:0;\n  position:absolute;\n  right:0.25rem;\n  text-align:center;\n  text-decoration:none;\n  top:50%;\n  transform:translate(0, -50%);\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button.usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled.usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button.usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled:active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true]:active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled.usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled:focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true]:focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled.usa-focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button .usa-icon{\n  height:1.5rem;\n  width:1.5rem;\n  vertical-align:middle;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button .usa-icon > g{\n  fill:transparent;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=descending] .usa-table__header__button .usa-icon > g.descending{\n  fill:#1b1b1b;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button{\n  color:#005ea2;\n  text-decoration:underline;\n  background-color:transparent;\n  border:0;\n  border-radius:0;\n  box-shadow:none;\n  font-weight:normal;\n  justify-content:normal;\n  text-align:left;\n  margin:0;\n  padding:0;\n  width:auto;\n  height:2rem;\n  width:2rem;\n  background-position:center center;\n  background-size:1.5rem;\n  color:#71767a;\n  cursor:pointer;\n  display:inline-block;\n  margin:0;\n  position:absolute;\n  right:0.25rem;\n  text-align:center;\n  text-decoration:none;\n  top:50%;\n  transform:translate(0, -50%);\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:visited{\n  color:#54278f;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0rem;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button.usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled.usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true].usa-button--hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button.usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled:active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true]:active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled.usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true].usa-button--active, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled:focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true]:focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled.usa-focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true].usa-focus, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button.usa-button--disabled{\n  background-color:transparent;\n  box-shadow:none;\n  text-decoration:underline;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button.usa-button--hover{\n  color:#1a4480;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button.usa-button--active{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true]:focus{\n  color:#757575;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true], .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button:disabled:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true]:hover, .fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button[aria-disabled=true]:focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button .usa-icon{\n  height:1.5rem;\n  width:1.5rem;\n  vertical-align:middle;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button .usa-icon > g{\n  fill:transparent;\n}\n.fba-modal-dialog .usa-prose > table th[data-sortable][aria-sort=ascending] .usa-table__header__button .usa-icon > g.ascending{\n  fill:#1b1b1b;\n}\n.fba-modal-dialog .usa-prose > table thead th[aria-sort]{\n  background-color:#97d4ea;\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-prose > table td[data-sort-active],\n.fba-modal-dialog .usa-prose > table th[data-sort-active]{\n  background-color:#e1f3f8;\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-prose > .usa-table--borderless thead{\n}\n.fba-modal-dialog .usa-prose > .usa-table--borderless thead th{\n  background-color:white;\n  border-top:0;\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-prose > .usa-table--borderless thead th[aria-sort]{\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-prose > .usa-table--borderless thead th[data-sortable]:not([aria-sort]) .usa-table__header__button .usa-icon > g.unsorted{\n  fill:#1b1b1b;\n}\n.fba-modal-dialog .usa-prose > .usa-table--borderless thead th[data-sortable]:not([aria-sort]) .usa-table__header__button:hover .usa-icon > g.unsorted{\n  fill:black;\n}\n.fba-modal-dialog .usa-prose > .usa-table--borderless th,\n.fba-modal-dialog .usa-prose > .usa-table--borderless td{\n  border-left:0;\n  border-right:0;\n}\n.fba-modal-dialog .usa-prose > .usa-table--compact th,\n.fba-modal-dialog .usa-prose > .usa-table--compact td{\n  padding:0.25rem 0.75rem;\n}\n.fba-modal-dialog .usa-prose > .usa-table--striped tbody tr:nth-child(odd) td,\n.fba-modal-dialog .usa-prose > .usa-table--striped tbody tr:nth-child(odd) th{\n  background-color:#f0f0f0;\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-prose > .usa-table--striped tbody tr:nth-child(odd) td[data-sort-active],\n.fba-modal-dialog .usa-prose > .usa-table--striped tbody tr:nth-child(odd) th[data-sort-active]{\n  background-color:#c3ebfa;\n  color:#1b1b1b;\n}\n@media all and (max-width: 29.99em){\n  .fba-modal-dialog .usa-prose > .usa-table--stacked thead{\n    display:none;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked th,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked td{\n    border-bottom-width:0;\n    display:block;\n    width:100%;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked tr{\n    border-bottom:0.25rem solid #1b1b1b;\n    border-top-width:0;\n    width:100%;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked tr th:first-child,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked tr td:first-child{\n    border-top-width:0;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked tr:nth-child(odd) td,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked tr:nth-child(odd) th{\n    background-color:inherit;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked tr:first-child th:first-child,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked tr:first-child td:first-child{\n    border-top:0.25rem solid #1b1b1b;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked th[data-label],\n  .fba-modal-dialog .usa-prose > .usa-table--stacked td[data-label]{\n    padding-bottom:0.75rem;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked th[data-label]:before,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked td[data-label]:before{\n    content:attr(data-label);\n    display:block;\n    font-weight:700;\n    margin:-0.5rem -1rem 0rem;\n    padding:0.75rem 1rem 0.25rem;\n  }\n}\n@media all and (max-width: 29.99em){\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header thead{\n    display:none;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header th,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header td{\n    border-bottom-width:0;\n    display:block;\n    width:100%;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr{\n    border-bottom:0.25rem solid #1b1b1b;\n    border-top-width:0;\n    width:100%;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr th:first-child,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr td:first-child{\n    border-top-width:0;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr:nth-child(odd) td,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr:nth-child(odd) th{\n    background-color:inherit;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr:first-child th:first-child,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr:first-child td:first-child{\n    border-top:0.25rem solid #1b1b1b;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header th[data-label],\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header td[data-label]{\n    padding-bottom:0.75rem;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header th[data-label]:before,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header td[data-label]:before{\n    content:attr(data-label);\n    display:block;\n    font-weight:700;\n    margin:-0.5rem -1rem 0rem;\n    padding:0.75rem 1rem 0.25rem;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr td:first-child,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr th:first-child{\n    font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n    font-size:1.06rem;\n    line-height:1.1;\n    background-color:#dfe1e2;\n    color:#1b1b1b;\n    font-weight:700;\n    padding:0.75rem 1rem;\n  }\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr td:first-child:before,\n  .fba-modal-dialog .usa-prose > .usa-table--stacked-header tr th:first-child:before{\n    display:none;\n  }\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked thead{\n  display:none;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked th,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked td{\n  border-bottom-width:0;\n  display:block;\n  width:100%;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked tr{\n  border-bottom:0.25rem solid #1b1b1b;\n  border-top-width:0;\n  width:100%;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked tr th:first-child,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked tr td:first-child{\n  border-top-width:0;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked tr:nth-child(odd) td,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked tr:nth-child(odd) th{\n  background-color:inherit;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked tr:first-child th:first-child,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked tr:first-child td:first-child{\n  border-top:0.25rem solid #1b1b1b;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked th[data-label],\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked td[data-label]{\n  padding-bottom:0.75rem;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked th[data-label]:before,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked td[data-label]:before{\n  content:attr(data-label);\n  display:block;\n  font-weight:700;\n  margin:-0.5rem -1rem 0rem;\n  padding:0.75rem 1rem 0.25rem;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header thead{\n  display:none;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header th,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header td{\n  border-bottom-width:0;\n  display:block;\n  width:100%;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr{\n  border-bottom:0.25rem solid #1b1b1b;\n  border-top-width:0;\n  width:100%;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr th:first-child,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr td:first-child{\n  border-top-width:0;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr:nth-child(odd) td,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr:nth-child(odd) th{\n  background-color:inherit;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr:first-child th:first-child,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr:first-child td:first-child{\n  border-top:0.25rem solid #1b1b1b;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header th[data-label],\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header td[data-label]{\n  padding-bottom:0.75rem;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header th[data-label]:before,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header td[data-label]:before{\n  content:attr(data-label);\n  display:block;\n  font-weight:700;\n  margin:-0.5rem -1rem 0rem;\n  padding:0.75rem 1rem 0.25rem;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr td:first-child,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr th:first-child{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.1;\n  background-color:#dfe1e2;\n  color:#1b1b1b;\n  font-weight:700;\n  padding:0.75rem 1rem;\n}\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr td:first-child:before,\n.fba-modal-dialog .usa-prose > .width-mobile .usa-table--stacked-header tr th:first-child:before{\n  display:none;\n}\n.fba-modal-dialog .usa-prose > .usa-table-container--scrollable{\n  margin:1.25rem 0;\n  overflow-y:hidden;\n}\n.fba-modal-dialog .usa-prose > .usa-table-container--scrollable .usa-table{\n  margin:0;\n}\n.fba-modal-dialog .usa-prose > .usa-table-container--scrollable td{\n  white-space:nowrap;\n}\n.fba-modal-dialog .usa-prose > p{\n  line-height:1.5;\n  max-width:68ex;\n}\n.fba-modal-dialog .usa-prose > h1,\n.fba-modal-dialog .usa-prose > h2,\n.fba-modal-dialog .usa-prose > h3,\n.fba-modal-dialog .usa-prose > h4,\n.fba-modal-dialog .usa-prose > h5,\n.fba-modal-dialog .usa-prose > h6{\n  margin-bottom:0;\n  margin-top:0;\n  clear:both;\n}\n.fba-modal-dialog .usa-prose > * + *{\n  margin-top:1em;\n  margin-bottom:0;\n}\n.fba-modal-dialog .usa-prose > * + h1,\n.fba-modal-dialog .usa-prose > * + h2,\n.fba-modal-dialog .usa-prose > * + h3,\n.fba-modal-dialog .usa-prose > * + h4,\n.fba-modal-dialog .usa-prose > * + h5,\n.fba-modal-dialog .usa-prose > * + h6{\n  margin-top:1.5em;\n}\n.fba-modal-dialog .usa-prose > h1{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:2.44rem;\n  line-height:1.2;\n  font-weight:700;\n}\n.fba-modal-dialog .usa-prose > h2{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:1.95rem;\n  line-height:1.2;\n  font-weight:700;\n}\n.fba-modal-dialog .usa-prose > h3{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:1.34rem;\n  line-height:1.2;\n  font-weight:700;\n}\n.fba-modal-dialog .usa-prose > h4{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:0.98rem;\n  line-height:1.2;\n  font-weight:700;\n}\n.fba-modal-dialog .usa-prose > h5{\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:0.91rem;\n  line-height:1.2;\n  font-weight:700;\n}\n.fba-modal-dialog .usa-prose > h6{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:0.87rem;\n  line-height:1.1;\n  font-weight:normal;\n  letter-spacing:0.025em;\n  text-transform:uppercase;\n}\n.fba-modal-dialog .usa-radio{\n  background:white;\n}\n.fba-modal-dialog .usa-radio__label{\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-radio__label::before{\n  background:white;\n  box-shadow:0 0 0 2px #1b1b1b;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-radio__label::before{\n    outline:2px solid transparent;\n    outline-offset:2px;\n  }\n}\n.fba-modal-dialog .usa-radio__input:checked + [class*=__label]::before{\n  background-color:#005ea2;\n  box-shadow:0 0 0 2px #005ea2;\n}\n.fba-modal-dialog .usa-radio__input:disabled + [class*=__label], .fba-modal-dialog .usa-radio__input[aria-disabled=true] + [class*=__label]{\n  color:#757575;\n  cursor:not-allowed;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-radio__input:disabled + [class*=__label], .fba-modal-dialog .usa-radio__input[aria-disabled=true] + [class*=__label]{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-radio__input:disabled + [class*=__label]::before, .fba-modal-dialog .usa-radio__input[aria-disabled=true] + [class*=__label]::before{\n  background-color:white;\n  box-shadow:0 0 0 2px #757575;\n}\n.fba-modal-dialog .usa-radio__input--tile + [class*=__label]{\n  background-color:white;\n  border:2px solid #c9c9c9;\n  color:#1b1b1b;\n}\n.fba-modal-dialog .usa-radio__input--tile:checked + [class*=__label]{\n  background-color:rgba(0, 94, 162, 0.1);\n  border-color:#005ea2;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-radio__input--tile:checked + [class*=__label]{\n    border:ButtonText solid 0.25rem;\n  }\n}\n.fba-modal-dialog .usa-radio__input--tile:disabled + [class*=__label], .fba-modal-dialog .usa-radio__input--tile[aria-disabled=true] + [class*=__label]{\n  border-color:#e6e6e6;\n}\n.fba-modal-dialog .usa-radio__input--tile:disabled:checked + [class*=__label], .fba-modal-dialog .usa-radio__input--tile:disabled:indeterminate + [class*=__label], .fba-modal-dialog .usa-radio__input--tile:disabled[data-indeterminate] + [class*=__label], .fba-modal-dialog .usa-radio__input--tile[aria-disabled=true]:checked + [class*=__label], .fba-modal-dialog .usa-radio__input--tile[aria-disabled=true]:indeterminate + [class*=__label], .fba-modal-dialog .usa-radio__input--tile[aria-disabled=true][data-indeterminate] + [class*=__label]{\n  background-color:white;\n}\n.fba-modal-dialog .usa-radio__input:checked + [class*=__label]::before{\n  box-shadow:0 0 0 2px #005ea2, inset 0 0 0 2px white;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-radio__input:checked + [class*=__label]::before{\n    background-color:ButtonText;\n  }\n}\n.fba-modal-dialog .usa-radio__input:checked:disabled + [class*=__label]::before, .fba-modal-dialog .usa-radio__input:checked[aria-disabled=true] + [class*=__label]::before{\n  background-color:#757575;\n  box-shadow:0 0 0 2px #757575, inset 0 0 0 2px white;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-radio__input:checked:disabled + [class*=__label]::before, .fba-modal-dialog .usa-radio__input:checked[aria-disabled=true] + [class*=__label]::before{\n    background-color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-radio__input{\n  position:absolute;\n  left:-999em;\n  right:auto;\n}\n.fba-modal-dialog .usa-radio__input:focus + [class*=__label]::before{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0.25rem;\n}\n.fba-modal-dialog .usa-radio__input--tile + [class*=__label]{\n  border-radius:0.25rem;\n  margin-top:0.5rem;\n  padding:0.75rem 1rem 0.75rem 2.5rem;\n}\n.fba-modal-dialog .usa-radio__input--tile + [class*=__label]::before{\n  left:0.5rem;\n}\n@media print{\n  .fba-modal-dialog .usa-radio__input:checked + [class*=__label]::before{\n    box-shadow:inset 0 0 0 2px white, inset 0 0 0 1rem #005ea2, 0 0 0 2px #005ea2;\n  }\n}\n.fba-modal-dialog .usa-radio__label{\n  cursor:pointer;\n  display:inherit;\n  font-weight:normal;\n  margin-top:0.75rem;\n  padding-left:2rem;\n  position:relative;\n}\n.fba-modal-dialog .usa-radio__label::before{\n  content:\" \";\n  display:block;\n  left:0;\n  margin-left:2px;\n  margin-top:0.064rem;\n  position:absolute;\n}\n.fba-modal-dialog .usa-radio__label::before{\n  height:1.25rem;\n  border-radius:99rem;\n  width:1.25rem;\n}\n.fba-modal-dialog .usa-radio__label-description{\n  display:block;\n  font-size:0.93rem;\n  margin-top:0.5rem;\n}\n.fba-modal-dialog .usa-range{\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  border:none;\n  padding-left:1px;\n  width:100%;\n}\n.fba-modal-dialog .usa-range:focus{\n  outline:none;\n}\n.fba-modal-dialog .usa-range:focus::-webkit-slider-thumb{\n  background-color:white;\n  box-shadow:0 0 0 2px #2491ff;\n}\n.fba-modal-dialog .usa-range:focus::-moz-range-thumb{\n  background-color:white;\n  box-shadow:0 0 0 2px #2491ff;\n}\n.fba-modal-dialog .usa-range:focus::-ms-thumb{\n  background-color:white;\n  box-shadow:0 0 0 2px #2491ff;\n}\n.fba-modal-dialog .usa-range::-webkit-slider-runnable-track{\n  background-color:#f0f0f0;\n  border-radius:99rem;\n  border:1px solid #71767a;\n  cursor:pointer;\n  height:1rem;\n  width:100%;\n}\n.fba-modal-dialog .usa-range::-moz-range-track{\n  background-color:#f0f0f0;\n  border-radius:99rem;\n  border:1px solid #71767a;\n  cursor:pointer;\n  height:1rem;\n  width:100%;\n}\n.fba-modal-dialog .usa-range::-ms-track{\n  background-color:#f0f0f0;\n  border-radius:99rem;\n  border:1px solid #71767a;\n  cursor:pointer;\n  height:1rem;\n  width:100%;\n}\n.fba-modal-dialog .usa-range::-webkit-slider-thumb{\n  height:1.25rem;\n  border-radius:99rem;\n  width:1.25rem;\n  background:#f0f0f0;\n  border:none;\n  box-shadow:0 0 0 2px #71767a;\n  cursor:pointer;\n  -webkit-appearance:none;\n          appearance:none;\n  margin-top:-0.19rem;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range::-webkit-slider-thumb{\n    outline:2px solid transparent;\n  }\n}\n.fba-modal-dialog .usa-range::-moz-range-thumb{\n  height:1.25rem;\n  border-radius:99rem;\n  width:1.25rem;\n  background:#f0f0f0;\n  border:none;\n  box-shadow:0 0 0 2px #71767a;\n  cursor:pointer;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range::-moz-range-thumb{\n    outline:2px solid transparent;\n  }\n}\n.fba-modal-dialog .usa-range::-ms-thumb{\n  height:1.25rem;\n  border-radius:99rem;\n  width:1.25rem;\n  background:#f0f0f0;\n  border:none;\n  box-shadow:0 0 0 2px #71767a;\n  cursor:pointer;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range::-ms-thumb{\n    outline:2px solid transparent;\n  }\n}\n.fba-modal-dialog .usa-range::-ms-fill-lower{\n  background-color:#f0f0f0;\n  border-radius:99rem;\n  border:1px solid #71767a;\n}\n.fba-modal-dialog .usa-range::-ms-fill-upper{\n  background-color:#f0f0f0;\n  border-radius:99rem;\n  border:1px solid #71767a;\n}\n.fba-modal-dialog .usa-range:disabled, .fba-modal-dialog .usa-range[aria-disabled=true]{\n  opacity:1;\n}\n.fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track:hover, .fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track:active, .fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track:focus, .fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track.usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track:hover, .fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track:active, .fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track:focus, .fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track.usa-focus{\n    color:GrayText;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range:disabled::-webkit-slider-runnable-track, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-runnable-track{\n    border:2px solid GrayText;\n  }\n}\n.fba-modal-dialog .usa-range:disabled::-moz-range-track, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-range:disabled::-moz-range-track:hover, .fba-modal-dialog .usa-range:disabled::-moz-range-track:active, .fba-modal-dialog .usa-range:disabled::-moz-range-track:focus, .fba-modal-dialog .usa-range:disabled::-moz-range-track.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track.usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range:disabled::-moz-range-track, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-range:disabled::-moz-range-track:hover, .fba-modal-dialog .usa-range:disabled::-moz-range-track:active, .fba-modal-dialog .usa-range:disabled::-moz-range-track:focus, .fba-modal-dialog .usa-range:disabled::-moz-range-track.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track.usa-focus{\n    color:GrayText;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range:disabled::-moz-range-track, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-track{\n    border:2px solid GrayText;\n  }\n}\n.fba-modal-dialog .usa-range:disabled::-ms-track, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-track{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-range:disabled::-ms-track:hover, .fba-modal-dialog .usa-range:disabled::-ms-track:active, .fba-modal-dialog .usa-range:disabled::-ms-track:focus, .fba-modal-dialog .usa-range:disabled::-ms-track.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-track:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-track:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-track:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-track.usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range:disabled::-ms-track, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-track{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-range:disabled::-ms-track:hover, .fba-modal-dialog .usa-range:disabled::-ms-track:active, .fba-modal-dialog .usa-range:disabled::-ms-track:focus, .fba-modal-dialog .usa-range:disabled::-ms-track.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-track:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-track:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-track:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-track.usa-focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-range:disabled::-webkit-slider-thumb, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-thumb{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-range:disabled::-webkit-slider-thumb:hover, .fba-modal-dialog .usa-range:disabled::-webkit-slider-thumb:active, .fba-modal-dialog .usa-range:disabled::-webkit-slider-thumb:focus, .fba-modal-dialog .usa-range:disabled::-webkit-slider-thumb.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-thumb:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-thumb:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-thumb:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-thumb.usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range:disabled::-webkit-slider-thumb, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-thumb{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-range:disabled::-webkit-slider-thumb:hover, .fba-modal-dialog .usa-range:disabled::-webkit-slider-thumb:active, .fba-modal-dialog .usa-range:disabled::-webkit-slider-thumb:focus, .fba-modal-dialog .usa-range:disabled::-webkit-slider-thumb.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-thumb:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-thumb:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-thumb:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-webkit-slider-thumb.usa-focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-range:disabled::-moz-range-thumb, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-thumb{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-range:disabled::-moz-range-thumb:hover, .fba-modal-dialog .usa-range:disabled::-moz-range-thumb:active, .fba-modal-dialog .usa-range:disabled::-moz-range-thumb:focus, .fba-modal-dialog .usa-range:disabled::-moz-range-thumb.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-thumb:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-thumb:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-thumb:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-thumb.usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range:disabled::-moz-range-thumb, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-thumb{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-range:disabled::-moz-range-thumb:hover, .fba-modal-dialog .usa-range:disabled::-moz-range-thumb:active, .fba-modal-dialog .usa-range:disabled::-moz-range-thumb:focus, .fba-modal-dialog .usa-range:disabled::-moz-range-thumb.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-thumb:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-thumb:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-thumb:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-moz-range-thumb.usa-focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-range:disabled::-ms-thumb, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-thumb{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-range:disabled::-ms-thumb:hover, .fba-modal-dialog .usa-range:disabled::-ms-thumb:active, .fba-modal-dialog .usa-range:disabled::-ms-thumb:focus, .fba-modal-dialog .usa-range:disabled::-ms-thumb.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-thumb:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-thumb:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-thumb:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-thumb.usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range:disabled::-ms-thumb, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-thumb{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-range:disabled::-ms-thumb:hover, .fba-modal-dialog .usa-range:disabled::-ms-thumb:active, .fba-modal-dialog .usa-range:disabled::-ms-thumb:focus, .fba-modal-dialog .usa-range:disabled::-ms-thumb.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-thumb:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-thumb:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-thumb:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-thumb.usa-focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-range:disabled::-ms-fill-lower, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-lower{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-range:disabled::-ms-fill-lower:hover, .fba-modal-dialog .usa-range:disabled::-ms-fill-lower:active, .fba-modal-dialog .usa-range:disabled::-ms-fill-lower:focus, .fba-modal-dialog .usa-range:disabled::-ms-fill-lower.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-lower:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-lower:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-lower:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-lower.usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range:disabled::-ms-fill-lower, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-lower{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-range:disabled::-ms-fill-lower:hover, .fba-modal-dialog .usa-range:disabled::-ms-fill-lower:active, .fba-modal-dialog .usa-range:disabled::-ms-fill-lower:focus, .fba-modal-dialog .usa-range:disabled::-ms-fill-lower.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-lower:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-lower:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-lower:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-lower.usa-focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-range:disabled::-ms-fill-upper, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-upper{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-range:disabled::-ms-fill-upper:hover, .fba-modal-dialog .usa-range:disabled::-ms-fill-upper:active, .fba-modal-dialog .usa-range:disabled::-ms-fill-upper:focus, .fba-modal-dialog .usa-range:disabled::-ms-fill-upper.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-upper:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-upper:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-upper:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-upper.usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-range:disabled::-ms-fill-upper, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-upper{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-range:disabled::-ms-fill-upper:hover, .fba-modal-dialog .usa-range:disabled::-ms-fill-upper:active, .fba-modal-dialog .usa-range:disabled::-ms-fill-upper:focus, .fba-modal-dialog .usa-range:disabled::-ms-fill-upper.usa-focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-upper:hover, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-upper:active, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-upper:focus, .fba-modal-dialog .usa-range[aria-disabled=true]::-ms-fill-upper.usa-focus{\n    color:GrayText;\n  }\n}\n.fba-modal-dialog .usa-select{\n  background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/unfold_more.svg\"), linear-gradient(transparent, transparent);\n  background-repeat:no-repeat;\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  background-color:white;\n  background-position:right 0.5rem center;\n  background-size:1.25rem;\n  padding-right:2rem;\n}\n.fba-modal-dialog .usa-select::-ms-expand{\n  display:none;\n}\n.fba-modal-dialog .usa-select:-webkit-autofill{\n  -webkit-appearance:menulist;\n          appearance:menulist;\n}\n.fba-modal-dialog .usa-select:-moz-focusring{\n  color:transparent;\n  text-shadow:0 0 0 black;\n}\n.fba-modal-dialog .usa-select[multiple]{\n  height:auto;\n  background-image:none;\n  padding-right:0;\n}\n.fba-modal-dialog .usa-select option{\n  overflow:hidden;\n  text-overflow:ellipsis;\n}\n.fba-modal-dialog .usa-select:disabled, .fba-modal-dialog .usa-select[aria-disabled=true]{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-select:disabled:hover, .fba-modal-dialog .usa-select:disabled:active, .fba-modal-dialog .usa-select:disabled:focus, .fba-modal-dialog .usa-select:disabled.usa-focus, .fba-modal-dialog .usa-select[aria-disabled=true]:hover, .fba-modal-dialog .usa-select[aria-disabled=true]:active, .fba-modal-dialog .usa-select[aria-disabled=true]:focus, .fba-modal-dialog .usa-select[aria-disabled=true].usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-select:disabled, .fba-modal-dialog .usa-select[aria-disabled=true]{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-select:disabled:hover, .fba-modal-dialog .usa-select:disabled:active, .fba-modal-dialog .usa-select:disabled:focus, .fba-modal-dialog .usa-select:disabled.usa-focus, .fba-modal-dialog .usa-select[aria-disabled=true]:hover, .fba-modal-dialog .usa-select[aria-disabled=true]:active, .fba-modal-dialog .usa-select[aria-disabled=true]:focus, .fba-modal-dialog .usa-select[aria-disabled=true].usa-focus{\n    color:GrayText;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-select:disabled, .fba-modal-dialog .usa-select[aria-disabled=true]{\n    border:2px solid GrayText;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-select{\n    -webkit-appearance:listbox;\n       -moz-appearance:listbox;\n            appearance:listbox;\n    background-image:none;\n    padding-right:0;\n  }\n}\n.fba-modal-dialog .usa-search{\n  box-sizing:border-box;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  position:relative;\n}\n.fba-modal-dialog .usa-search::after, .fba-modal-dialog .usa-search::before, .fba-modal-dialog .usa-search *, .fba-modal-dialog .usa-search *::after, .fba-modal-dialog .usa-search *::before{\n  box-sizing:inherit;\n}\n.fba-modal-dialog .usa-search::after{\n  clear:both;\n  content:\"\";\n  display:block;\n}\n.fba-modal-dialog .usa-search[role=search], .fba-modal-dialog .usa-search[role=search] > div,\n.fba-modal-dialog .usa-search [role=search]{\n  display:flex;\n}\n.fba-modal-dialog .usa-search [type=submit]{\n  border-bottom-left-radius:0;\n  border-top-left-radius:0;\n  height:2rem;\n  margin:0;\n  padding:0;\n  width:3rem;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-search [type=submit]{\n    padding-left:1rem;\n    padding-right:1rem;\n    width:auto;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-search [type=submit]::before{\n    background-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/search.svg\");\n    background-repeat:no-repeat;\n    background-position:center center;\n    background-size:1.5rem 1.5rem;\n    display:inline-block;\n    height:1.5rem;\n    width:1.5rem;\n    content:\"\";\n    vertical-align:middle;\n    margin-right:auto;\n  }\n  @supports ((-webkit-mask: url(\"\")) or (mask: url(\"\"))){\n    .fba-modal-dialog .usa-search [type=submit]::before{\n      background:none;\n      background-color:ButtonText;\n      -webkit-mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/search.svg\"), linear-gradient(transparent, transparent);\n              mask-image:url(\"https://touchpoints.app.cloud.gov/img/usa-icons/search.svg\"), linear-gradient(transparent, transparent);\n      -webkit-mask-position:center center;\n              mask-position:center center;\n      -webkit-mask-repeat:no-repeat;\n              mask-repeat:no-repeat;\n      -webkit-mask-size:1.5rem 1.5rem;\n              mask-size:1.5rem 1.5rem;\n    }\n  }\n  .fba-modal-dialog .usa-search [type=submit]:focus{\n    outline-offset:0;\n  }\n}\n@media (forced-colors: active) and (min-width: 30em){\n  .fba-modal-dialog .usa-search [type=submit]::before{\n    content:none;\n  }\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-search__submit-icon{\n    display:none;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-search__submit-icon{\n    display:none;\n  }\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-search--big [type=search],\n  .fba-modal-dialog .usa-search--big .usa-search__input{\n    font-size:1.06rem;\n    height:3rem;\n  }\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-search--big [type=submit],\n  .fba-modal-dialog .usa-search--big .usa-search__submit{\n    padding-left:2rem;\n    padding-right:2rem;\n    font-size:1.46rem;\n    height:3rem;\n    width:auto;\n  }\n}\n.fba-modal-dialog .usa-search--small [type=submit],\n.fba-modal-dialog .usa-search--small .usa-search__submit{\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n  min-width:3rem;\n}\n@media (forced-colors: active) and (min-width: 30em){\n  .fba-modal-dialog .usa-search--small [type=submit]::before{\n    content:\"\";\n  }\n}\n.fba-modal-dialog .usa-search--small .usa-search__submit-icon{\n  height:1.5rem;\n  width:1.5rem;\n  display:block;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-search--small .usa-search__submit-icon{\n    display:none;\n  }\n}\n.fba-modal-dialog input[type=search]{\n  box-sizing:border-box;\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n}\n.fba-modal-dialog [type=search],\n.fba-modal-dialog .usa-search__input{\n  padding-bottom:0;\n  padding-top:0;\n  border-bottom-right-radius:0;\n  border-right:none;\n  border-top-right-radius:0;\n  box-sizing:border-box;\n  float:left;\n  font-size:1rem;\n  height:2rem;\n  margin:0;\n}\n.fba-modal-dialog .usa-search__submit-text{\n  display:none;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-search__submit-text{\n    display:block;\n  }\n}\n.fba-modal-dialog .usa-step-indicator{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.1;\n  background-color:white;\n  margin-bottom:2rem;\n  margin-left:-1px;\n  margin-right:-1px;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-step-indicator{\n    margin-left:0;\n    margin-right:0;\n  }\n}\n.fba-modal-dialog .usa-step-indicator__segments{\n  counter-reset:usa-step-indicator;\n  display:flex;\n  list-style:none;\n  margin:0;\n  padding:0;\n}\n.fba-modal-dialog .usa-step-indicator__segment{\n  flex:1 1 0%;\n  counter-increment:usa-step-indicator;\n  margin-left:1px;\n  margin-right:1px;\n  max-width:15rem;\n  min-height:0.5rem;\n  position:relative;\n}\n.fba-modal-dialog .usa-step-indicator__segment:after{\n  background-color:#919191;\n  content:\"\";\n  display:block;\n  height:0.5rem;\n  left:0;\n  position:absolute;\n  right:0;\n  top:0;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-step-indicator__segment:after{\n    height:0.5rem;\n  }\n}\n.fba-modal-dialog .usa-step-indicator__segment--complete::after{\n  background-color:#162e51;\n}\n.fba-modal-dialog .usa-step-indicator__segment--complete .usa-step-indicator__segment-label{\n  color:#162e51;\n}\n.fba-modal-dialog .usa-step-indicator__segment--current::after{\n  background-color:#005ea2;\n}\n.fba-modal-dialog .usa-step-indicator__segment--current .usa-step-indicator__segment-label{\n  color:#005ea2;\n  font-weight:700;\n}\n.fba-modal-dialog .usa-step-indicator__segment-label{\n  display:none;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-step-indicator__segment-label{\n    color:#565c65;\n    display:block;\n    font-size:1.06rem;\n    margin-top:calc(0.5rem + 0.5rem);\n    padding-right:2rem;\n    text-align:left;\n  }\n}\n.fba-modal-dialog .usa-step-indicator__header{\n  align-items:baseline;\n  display:flex;\n}\n.fba-modal-dialog .usa-step-indicator__heading{\n  color:#1b1b1b;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.13rem;\n  font-weight:700;\n  margin:1rem 0 0;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-step-indicator__heading{\n    font-size:1.46rem;\n    margin-top:2rem;\n  }\n}\n.fba-modal-dialog .usa-step-indicator__current-step{\n  height:2.5rem;\n  border-radius:99rem;\n  width:2.5rem;\n  font-weight:normal;\n  font-feature-settings:\"tnum\" 1, \"kern\" 1;\n  background-color:#005ea2;\n  color:white;\n  display:inline-block;\n  padding:calc((2.5rem - 2ex * 1.1) * 0.5);\n  text-align:center;\n}\n.fba-modal-dialog .usa-step-indicator__total-steps{\n  font-weight:normal;\n  font-feature-settings:\"tnum\" 1, \"kern\" 1;\n  color:#005ea2;\n  margin-right:0.5rem;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-step-indicator--counters .usa-step-indicator__segment,\n  .fba-modal-dialog .usa-step-indicator--counters-sm .usa-step-indicator__segment{\n    margin-left:0;\n    margin-right:0;\n    margin-top:calc((2.5rem - 0.5rem) / 2 + 0.25rem);\n  }\n  .fba-modal-dialog .usa-step-indicator--counters .usa-step-indicator__segment:before,\n  .fba-modal-dialog .usa-step-indicator--counters-sm .usa-step-indicator__segment:before{\n    height:2.5rem;\n    border-radius:99rem;\n    width:2.5rem;\n    font-feature-settings:\"tnum\" 1, \"kern\" 1;\n    background-color:white;\n    box-shadow:inset 0 0 0 0.25rem #919191, 0 0 0 0.25rem white;\n    color:#565c65;\n    content:counter(usa-step-indicator);\n    display:block;\n    font-weight:700;\n    left:0;\n    line-height:0.9;\n    padding:calc((2.5rem - 2ex * 0.9) * 0.5);\n    position:absolute;\n    text-align:center;\n    top:calc((2.5rem - 0.5rem) / -2);\n    z-index:100;\n  }\n  .fba-modal-dialog .usa-step-indicator--counters .usa-step-indicator__segment:last-child:after,\n  .fba-modal-dialog .usa-step-indicator--counters-sm .usa-step-indicator__segment:last-child:after{\n    display:none;\n  }\n}\n.fba-modal-dialog .usa-step-indicator--counters .usa-step-indicator__segment--complete::before,\n.fba-modal-dialog .usa-step-indicator--counters-sm .usa-step-indicator__segment--complete::before{\n  background-color:#162e51;\n  box-shadow:0 0 0 0.25rem white;\n  color:white;\n}\n.fba-modal-dialog .usa-step-indicator--counters .usa-step-indicator__segment--current::before,\n.fba-modal-dialog .usa-step-indicator--counters-sm .usa-step-indicator__segment--current::before{\n  background-color:#005ea2;\n  box-shadow:0 0 0 0.25rem white;\n  color:white;\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-step-indicator--counters .usa-step-indicator__segment-label,\n  .fba-modal-dialog .usa-step-indicator--counters-sm .usa-step-indicator__segment-label{\n    margin-top:calc((2.5rem + 0.5rem) / 2 + 0.5rem);\n  }\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-step-indicator--counters.usa-step-indicator--center .usa-step-indicator__segment:first-child:after,\n  .fba-modal-dialog .usa-step-indicator--counters-sm.usa-step-indicator--center .usa-step-indicator__segment:first-child:after{\n    left:50%;\n    right:0;\n    width:auto;\n  }\n  .fba-modal-dialog .usa-step-indicator--counters.usa-step-indicator--center .usa-step-indicator__segment:last-child:after,\n  .fba-modal-dialog .usa-step-indicator--counters-sm.usa-step-indicator--center .usa-step-indicator__segment:last-child:after{\n    display:block;\n    left:0;\n    right:50%;\n    width:auto;\n  }\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-step-indicator--counters-sm .usa-step-indicator__segment{\n    margin-top:calc((1.5rem - 0.5rem) / 2 + 0.25rem);\n  }\n  .fba-modal-dialog .usa-step-indicator--counters-sm .usa-step-indicator__segment:before{\n    height:1.5rem;\n    border-radius:99rem;\n    width:1.5rem;\n    font-size:0.93rem;\n    padding:calc(0.25rem + 1px);\n    top:calc((1.5rem - 0.5rem) / -2);\n  }\n  .fba-modal-dialog .usa-step-indicator--counters-sm .usa-step-indicator__segment:last-child:after{\n    display:none;\n  }\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-step-indicator--counters-sm .usa-step-indicator__segment-label{\n    margin-top:calc((1.5rem + 0.5rem) / 2 + 0.5rem);\n  }\n}\n.fba-modal-dialog .usa-step-indicator--no-labels{\n  margin-left:-1px;\n  margin-right:-1px;\n}\n.fba-modal-dialog .usa-step-indicator--no-labels .usa-step-indicator__segment{\n  margin-top:0;\n  margin-left:1px;\n  margin-right:1px;\n}\n.fba-modal-dialog .usa-step-indicator--no-labels .usa-step-indicator__segment:before{\n  display:none;\n}\n.fba-modal-dialog .usa-step-indicator--no-labels .usa-step-indicator__segment:last-child:after{\n  display:block;\n}\n.fba-modal-dialog .usa-step-indicator--no-labels .usa-step-indicator__heading{\n  margin-top:1rem;\n}\n.fba-modal-dialog .usa-step-indicator--no-labels .usa-step-indicator__segment-label{\n  display:none;\n}\n.fba-modal-dialog .usa-step-indicator--center{\n  margin-left:-1px;\n  margin-right:-1px;\n}\n.fba-modal-dialog .usa-step-indicator--center .usa-step-indicator__segment{\n  margin-left:1px;\n  margin-right:1px;\n}\n.fba-modal-dialog .usa-step-indicator--center .usa-step-indicator__segment:before{\n  left:calc(50% - (2.5rem + 0.25rem) / 2);\n}\n.fba-modal-dialog .usa-step-indicator--center .usa-step-indicator__segment-label{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n  text-align:center;\n}\n.fba-modal-dialog .usa-step-indicator--center.usa-step-indicator--no-labels .usa-step-indicator__segment:first-child:after{\n  left:0;\n}\n.fba-modal-dialog .usa-step-indicator--center.usa-step-indicator--no-labels .usa-step-indicator__segment:last-child:after{\n  right:0;\n}\n.fba-modal-dialog .usa-step-indicator--center.usa-step-indicator--counters-sm .usa-step-indicator__segment:before{\n  left:calc(50% - (1.5rem + 0.25rem) / 2);\n}\n.fba-modal-dialog .usa-tag{\n  box-sizing:border-box;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:0.93rem;\n  color:white;\n  text-transform:uppercase;\n  background-color:#565c65;\n  border-radius:2px;\n  margin-right:0.25rem;\n  padding:1px 0.5rem;\n}\n.fba-modal-dialog .usa-tag::after, .fba-modal-dialog .usa-tag::before, .fba-modal-dialog .usa-tag *, .fba-modal-dialog .usa-tag *::after, .fba-modal-dialog .usa-tag *::before{\n  box-sizing:inherit;\n}\n.fba-modal-dialog .usa-tag:only-of-type{\n  margin-right:0;\n}\n.fba-modal-dialog .usa-tag--big{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n}\n.fba-modal-dialog .usa-textarea:disabled, .fba-modal-dialog .usa-textarea[aria-disabled=true]{\n  color:#454545;\n  background-color:#c9c9c9;\n  cursor:not-allowed;\n  opacity:1;\n}\n.fba-modal-dialog .usa-textarea:disabled:hover, .fba-modal-dialog .usa-textarea:disabled:active, .fba-modal-dialog .usa-textarea:disabled:focus, .fba-modal-dialog .usa-textarea:disabled.usa-focus, .fba-modal-dialog .usa-textarea[aria-disabled=true]:hover, .fba-modal-dialog .usa-textarea[aria-disabled=true]:active, .fba-modal-dialog .usa-textarea[aria-disabled=true]:focus, .fba-modal-dialog .usa-textarea[aria-disabled=true].usa-focus{\n  color:#454545;\n  background-color:#c9c9c9;\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-textarea:disabled, .fba-modal-dialog .usa-textarea[aria-disabled=true]{\n    border:0;\n    color:GrayText;\n  }\n  .fba-modal-dialog .usa-textarea:disabled:hover, .fba-modal-dialog .usa-textarea:disabled:active, .fba-modal-dialog .usa-textarea:disabled:focus, .fba-modal-dialog .usa-textarea:disabled.usa-focus, .fba-modal-dialog .usa-textarea[aria-disabled=true]:hover, .fba-modal-dialog .usa-textarea[aria-disabled=true]:active, .fba-modal-dialog .usa-textarea[aria-disabled=true]:focus, .fba-modal-dialog .usa-textarea[aria-disabled=true].usa-focus{\n    color:GrayText;\n  }\n}\n@media (forced-colors: active){\n  .fba-modal-dialog .usa-textarea:disabled, .fba-modal-dialog .usa-textarea[aria-disabled=true]{\n    border:2px solid GrayText;\n  }\n}\n.fba-modal-dialog .usa-textarea{\n  height:10rem;\n}\n\n.fba-modal-dialog .usa-sr-only{\n  position:absolute;\n  left:-999em;\n}\n\n.fba-modal img{\n  max-width:100%;\n}\n\n.fba-modal-dialog .usa-media-link{\n  display:inline-block;\n  line-height:0;\n}\n\n.fba-modal-dialog .usa-memorable-date{\n  display:flex;\n}\n\n.fba-modal-dialog .usa-memorable-date [type=number]{\n  -moz-appearance:textfield;\n}\n\n.fba-modal-dialog .usa-memorable-date [type=number]::-webkit-inner-spin-button{\n  -webkit-appearance:none;\n          appearance:none;\n}\n\n.fba-modal-dialog .usa-memorable-date [type=number]::-webkit-contacts-auto-fill-button{\n  visibility:hidden;\n  display:none !important;\n  pointer-events:none;\n  height:0;\n  width:0;\n  margin:0;\n}\n\n.fba-modal-dialog .grid-container{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n.fba-modal-dialog .grid-container-card{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:10rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n.fba-modal-dialog .grid-container-card-lg{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:15rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n.fba-modal-dialog .grid-container-mobile{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:20rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n.fba-modal-dialog .grid-container-mobile-lg{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:30rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n.fba-modal-dialog .grid-container-tablet{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:40rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n.fba-modal-dialog .grid-container-tablet-lg{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:55rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n.fba-modal-dialog .grid-container-desktop{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:64rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n.fba-modal-dialog .grid-container-desktop-lg{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:75rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n.fba-modal-dialog .grid-container-widescreen{\n  margin-left:auto;\n  margin-right:auto;\n  max-width:87.5rem;\n  padding-left:1rem;\n  padding-right:1rem;\n}\n\n.fba-modal-dialog .grid-row{\n  display:flex;\n  flex-wrap:wrap;\n}\n\n.fba-modal-dialog .grid-row.grid-gap{\n  margin-left:-0.5rem;\n  margin-right:-0.5rem;\n}\n.fba-modal-dialog .grid-row.grid-gap > *{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n}\n\n.fba-modal-dialog .grid-row.grid-gap-0{\n  margin-left:0;\n  margin-right:0;\n}\n.fba-modal-dialog .grid-row.grid-gap-0 > *{\n  padding-left:0;\n  padding-right:0;\n}\n\n.fba-modal-dialog .grid-row.grid-gap-2px{\n  margin-left:-1px;\n  margin-right:-1px;\n}\n\n.fba-modal-dialog .grid-row.grid-gap-2px > *{\n  padding-left:1px;\n  padding-right:1px;\n}\n\n.fba-modal-dialog .grid-row.grid-gap-05{\n  margin-left:-2px;\n  margin-right:-2px;\n}\n.fba-modal-dialog .grid-row.grid-gap-05 > *{\n  padding-left:2px;\n  padding-right:2px;\n}\n.fba-modal-dialog .grid-row.grid-gap-1{\n  margin-left:-0.25rem;\n  margin-right:-0.25rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-1 > *{\n  padding-left:0.25rem;\n  padding-right:0.25rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-2{\n  margin-left:-0.5rem;\n  margin-right:-0.5rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-2 > *{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-3{\n  margin-left:-0.75rem;\n  margin-right:-0.75rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-3 > *{\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-4{\n  margin-left:-1rem;\n  margin-right:-1rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-4 > *{\n  padding-left:1rem;\n  padding-right:1rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-5{\n  margin-left:-1.25rem;\n  margin-right:-1.25rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-5 > *{\n  padding-left:1.25rem;\n  padding-right:1.25rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-6{\n  margin-left:-1.5rem;\n  margin-right:-1.5rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-6 > *{\n  padding-left:1.5rem;\n  padding-right:1.5rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-sm{\n  margin-left:-1px;\n  margin-right:-1px;\n}\n.fba-modal-dialog .grid-row.grid-gap-sm > *{\n  padding-left:1px;\n  padding-right:1px;\n}\n.fba-modal-dialog .grid-row.grid-gap-md{\n  margin-left:-0.5rem;\n  margin-right:-0.5rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-md > *{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-lg{\n  margin-left:-0.75rem;\n  margin-right:-0.75rem;\n}\n.fba-modal-dialog .grid-row.grid-gap-lg > *{\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n}\n\n.fba-modal-dialog [class*=grid-col]{\n  position:relative;\n  width:100%;\n  box-sizing:border-box;\n}\n\n.fba-modal-dialog .grid-col{\n  flex:1 1 0%;\n  width:auto;\n  max-width:100%;\n  min-width:1px;\n  max-width:100%;\n}\n\n.fba-modal-dialog .grid-col-auto{\n  flex:0 1 auto;\n  width:auto;\n  max-width:100%;\n}\n\n.fba-modal-dialog .grid-col-fill{\n  flex:1 1 0%;\n  width:auto;\n  max-width:100%;\n  min-width:1px;\n}\n\n.fba-modal-dialog .grid-col-1{\n  flex:0 1 auto;\n  width:8.3333333333%;\n}\n\n.fba-modal-dialog .grid-col-2{\n  flex:0 1 auto;\n  width:16.6666666667%;\n}\n\n.fba-modal-dialog .grid-col-3{\n  flex:0 1 auto;\n  width:25%;\n}\n\n.fba-modal-dialog .grid-col-4{\n  flex:0 1 auto;\n  width:33.3333333333%;\n}\n\n.fba-modal-dialog .grid-col-5{\n  flex:0 1 auto;\n  width:41.6666666667%;\n}\n\n.fba-modal-dialog .grid-col-6{\n  flex:0 1 auto;\n  width:50%;\n}\n\n.fba-modal-dialog .grid-col-7{\n  flex:0 1 auto;\n  width:58.3333333333%;\n}\n\n.fba-modal-dialog .grid-col-8{\n  flex:0 1 auto;\n  width:66.6666666667%;\n}\n\n.fba-modal-dialog .grid-col-9{\n  flex:0 1 auto;\n  width:75%;\n}\n\n.fba-modal-dialog .grid-col-10{\n  flex:0 1 auto;\n  width:83.3333333333%;\n}\n\n.fba-modal-dialog .grid-col-11{\n  flex:0 1 auto;\n  width:91.6666666667%;\n}\n\n.fba-modal-dialog .grid-col-12{\n  flex:0 1 auto;\n  width:100%;\n}\n\n.fba-modal-dialog .grid-offset-1{\n  margin-left:8.3333333333%;\n}\n\n.fba-modal-dialog .grid-offset-2{\n  margin-left:16.6666666667%;\n}\n\n.fba-modal-dialog .grid-offset-3{\n  margin-left:25%;\n}\n\n.fba-modal-dialog .grid-offset-4{\n  margin-left:33.33333%;\n}\n\n.fba-modal-dialog .grid-offset-5{\n  margin-left:41.6666666667%;\n}\n\n.fba-modal-dialog .grid-offset-6{\n  margin-left:50%;\n}\n\n.fba-modal-dialog .grid-offset-7{\n  margin-left:58.3333333333%;\n}\n\n.fba-modal-dialog .grid-offset-8{\n  margin-left:66.6666666667%;\n}\n\n.fba-modal-dialog .grid-offset-9{\n  margin-left:75%;\n}\n\n.fba-modal-dialog .grid-offset-10{\n  margin-left:83.3333333333%;\n}\n\n.fba-modal-dialog .grid-offset-11{\n  margin-left:91.6666666667%;\n}\n\n.fba-modal-dialog .grid-offset-12{\n  margin-left:100%;\n}\n\n.fba-modal-dialog .grid-offset-none{\n  margin-left:0;\n}\n\n.fba-modal-dialog .usa-paragraph{\n  line-height:1.5;\n  margin-bottom:0;\n  margin-top:0;\n  max-width:68ex;\n}\n\n* + .fba-modal-dialog .usa-paragraph{\n  margin-top:1em;\n}\n\n.fba-modal-dialog .usa-paragraph + *{\n  margin-top:1em;\n}\n\n.fba-modal-dialog .usa-content p{\n  max-width:68ex;\n}\n\n.fba-modal-dialog .usa-display{\n  margin-bottom:0;\n  margin-top:0;\n  clear:both;\n  font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n  font-size:2.44rem;\n  line-height:1.2;\n  font-weight:bold;\n}\n\n* + .fba-modal-dialog .usa-display{\n  margin-top:1.5em;\n}\n\n.fba-modal-dialog .usa-display + *{\n  margin-top:1em;\n}\n@media all and (min-width: 30em){\n  .fba-modal-dialog .usa-display{\n    margin-bottom:0;\n    margin-top:0;\n    clear:both;\n    font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n    font-size:2.44rem;\n    line-height:1.2;\n    font-weight:bold;\n  }\n  .fba-modal-dialog + .usa-display{\n    margin-top:1.5em;\n  }\n  .fba-modal-dialog .usa-display + *{\n    margin-top:1em;\n  }\n}\n@media all and (min-width: 40em){\n  .fba-modal-dialog .usa-display{\n    margin-bottom:0;\n    margin-top:0;\n    clear:both;\n    font-family:Merriweather Web, Georgia, Cambria, Times New Roman, Times, serif;\n    font-size:2.93rem;\n    line-height:1.2;\n    font-weight:bold;\n  }\n  .fba-modal-dialog + .usa-display{\n    margin-top:1.5em;\n  }\n  .fba-modal-dialog .usa-display + *{\n    margin-top:1em;\n  }\n}\n\n.fba-modal-dialog .usa-dark-background{\n  -moz-osx-font-smoothing:grayscale;\n  -webkit-font-smoothing:antialiased;\n  background-color:#3d4551;\n}\n\n.fba-modal-dialog .usa-dark-background p,\n.fba-modal-dialog .usa-dark-background span{\n  color:white;\n}\n\n.fba-modal-dialog .usa-dark-background a{\n  color:#dfe1e2;\n}\n\n.fba-modal-dialog .usa-dark-background a:hover{\n  color:white;\n}\n\n.fba-modal-dialog .usa-layout-docs__sidenav{\n  order:2;\n  padding-top:2rem;\n}\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-layout-docs__sidenav{\n    padding-top:0;\n  }\n}\n\n@media all and (min-width: 64em){\n  .fba-modal-dialog .usa-layout-docs__main{\n    order:2;\n  }\n}\n.fba-modal-dialog .usa-media-block{\n  align-items:flex-start;\n  display:flex;\n}\n.fba-modal-dialog .usa-media-block__img{\n  float:left;\n  margin-right:0.5rem;\n}\n\n.fba-modal-dialog .usa-media-block__body{\n  flex:1 1 0%;\n}\n\n.fba-modal-dialog .usa-js-mobile-nav--active{\n  overflow:hidden;\n}\n\n/* TODO Custom */\n@media all and (min-width: 40em){\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-0{\n    margin-left:0;\n    margin-right:0;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-0 > *{\n    padding-left:0;\n    padding-right:0;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-2px{\n    margin-left:-1px;\n    margin-right:-1px;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-2px > *{\n    padding-left:1px;\n    padding-right:1px;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-05{\n    margin-left:-2px;\n    margin-right:-2px;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-05 > *{\n    padding-left:2px;\n    padding-right:2px;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-1{\n    margin-left:-0.25rem;\n    margin-right:-0.25rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-1 > *{\n    padding-left:0.25rem;\n    padding-right:0.25rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-2{\n    margin-left:-0.5rem;\n    margin-right:-0.5rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-2 > *{\n    padding-left:0.5rem;\n    padding-right:0.5rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-3{\n    margin-left:-0.75rem;\n    margin-right:-0.75rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-3 > *{\n    padding-left:0.75rem;\n    padding-right:0.75rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-4{\n    margin-left:-1rem;\n    margin-right:-1rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-4 > *{\n    padding-left:1rem;\n    padding-right:1rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-5{\n    margin-left:-1.25rem;\n    margin-right:-1.25rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-5 > *{\n    padding-left:1.25rem;\n    padding-right:1.25rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-6{\n    margin-left:-1.5rem;\n    margin-right:-1.5rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-6 > *{\n    padding-left:1.5rem;\n    padding-right:1.5rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-sm{\n    margin-left:-1px;\n    margin-right:-1px;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-sm > *{\n    padding-left:1px;\n    padding-right:1px;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-md{\n    margin-left:-0.5rem;\n    margin-right:-0.5rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-md > *{\n    padding-left:0.5rem;\n    padding-right:0.5rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-lg{\n    margin-left:-0.75rem;\n    margin-right:-0.75rem;\n  }\n  .fba-modal-dialog .grid-row.tablet\\:grid-gap-lg > *{\n    padding-left:0.75rem;\n    padding-right:0.75rem;\n  }\n}\n\n\n\n.fba-modal-dialog .usa-graphic-list .fba-modal-dialog .usa-graphic-list__row .fba-modal-dialog .usa-media-block{\n  margin-bottom:4rem;\n}\n.fba-modal-dialog .usa-graphic-list .fba-modal-dialog .usa-graphic-list__row:last-child .fba-modal-dialog .usa-media-block{\n  margin-bottom:0;\n}\n.fba-modal-dialog .usa-section{\n  padding-bottom:4rem;\n  padding-top:4rem;\n}\n.fba-modal-dialog .usa-sidenav .fba-modal-dialog .usa-current{\n  position:relative;\n}\n.fba-modal-dialog .usa-sidenav .fba-modal-dialog .usa-current::after{\n  background-color:#005ea2;\n  border-radius:99rem;\n  content:\'\';\n  display:block;\n  position:absolute;\n  bottom:0.25rem;\n  top:0.25rem;\n  width:0.25rem;\n  left:0;\n}\n.fba-modal-dialog .grid-container .fba-modal-dialog .usa-sidenav{\n  margin-left:0;\n  margin-right:0;\n}\n.fba-modal-dialog .usa-sidenav__sublist .fba-modal-dialog .usa-current::after{\n  display:none;\n}\n.fba-modal-dialog .grid-row.fba-modal-dialog .grid-gap{\n  margin-left:-1rem;\n  margin-right:-1rem;\n}\n.fba-modal-dialog .grid-row.fba-modal-dialog .grid-gap > *{\n  padding-left:1rem;\n  padding-right:1rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-0{\n  margin-left:0;\n  margin-right:0;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-0 > *{\n  padding-left:0;\n  padding-right:0;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-2px{\n  margin-left:-1px;\n  margin-right:-1px;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-2px > *{\n  padding-left:1px;\n  padding-right:1px;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-05{\n  margin-left:-2px;\n  margin-right:-2px;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-05 > *{\n  padding-left:2px;\n  padding-right:2px;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-1{\n  margin-left:-0.25rem;\n  margin-right:-0.25rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-1 > *{\n  padding-left:0.25rem;\n  padding-right:0.25rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-2{\n  margin-left:-0.5rem;\n  margin-right:-0.5rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-2 > *{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-3{\n  margin-left:-0.75rem;\n  margin-right:-0.75rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-3 > *{\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-4{\n  margin-left:-1rem;\n  margin-right:-1rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-4 > *{\n  padding-left:1rem;\n  padding-right:1rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-5{\n  margin-left:-1.25rem;\n  margin-right:-1.25rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-5 > *{\n  padding-left:1.25rem;\n  padding-right:1.25rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-6{\n  margin-left:-1.5rem;\n  margin-right:-1.5rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-6 > *{\n  padding-left:1.5rem;\n  padding-right:1.5rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-sm{\n  margin-left:-1px;\n  margin-right:-1px;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-sm > *{\n  padding-left:1px;\n  padding-right:1px;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-md{\n  margin-left:-0.5rem;\n  margin-right:-0.5rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-md > *{\n  padding-left:0.5rem;\n  padding-right:0.5rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-lg{\n  margin-left:-0.75rem;\n  margin-right:-0.75rem;\n}\n.fba-modal-dialog .grid-row.desktop\\:grid-gap-lg > *{\n  padding-left:0.75rem;\n  padding-right:0.75rem;\n}\n.fba-modal-dialog .usa-layout-docs__sidenav{\n  padding-top:0;\n}\n.fba-modal-dialog .usa-layout-docs__main{\n  -webkit-box-ordinal-group:3;\n      -ms-flex-order:2;\n          order:2;\n}\n.fba-modal-dialog .usa-nav{\n  float:right;\n  position:relative;\n}\n.fba-modal-dialog .usa-nav .fba-modal-dialog .usa-search{\n  margin-left:1rem;\n}\n.fba-modal-dialog .usa-nav__secondary{\n  bottom:4rem;\n  font-size:0.93162rem;\n  margin-top:0.5rem;\n  min-width:calc(27ch + 3rem);\n  position:absolute;\n  right:2rem;\n}\n.fba-modal-dialog .usa-nav__secondary .fba-modal-dialog .usa-search{\n  margin-left:0;\n  margin-top:0.5rem;\n}\n.fba-modal-dialog .usa-nav__secondary-links{\n  float:right;\n  line-height:0.93923;\n  margin-bottom:0.25rem;\n  margin-top:0;\n}\n.fba-modal-dialog .usa-nav__secondary-links .fba-modal-dialog .usa-nav__secondary-item{\n  display:inline;\n  padding-left:0.25rem;\n}\n.fba-modal-dialog .usa-nav__secondary-links .fba-modal-dialog .usa-nav__secondary-item + .fba-modal-dialog .usa-nav__secondary-item::before{\n  color:#dcdee0;\n  content:\'|\';\n  padding-right:0.25rem;\n}\n.fba-modal-dialog .usa-nav__close{\n  display:none;\n}\n\n/* TP-795 disable uswds v1 overrides */\n.fba-modal-dialog .usa-label,\n.fba-modal-dialog .usa-label-big {\n  background-color: inherit;\n  border-radius: inherit;\n  color: inherit;\n  margin-right: inherit;\n  padding: inherit;\n  text-transform: inherit;\n}\n\n@media all and  (min-width: 30em) {\n  .fba-modal-dialog .usa-button {\n    width: auto;\n  }\n}\n\n.star_rating svg {\n	width: 1em;\n	height: 1em;\n	fill: currentColor;\n	stroke: currentColor;\n}\n.star_rating label, .star_rating output {\n	display: block;\n	float: left;\n	font-size: 2em;\n	height: 1.2em;\n	color: #036;\n	cursor: pointer;\n	/* Transparent border-bottom avoids jumping\n	   when a colored border is applied\n		 on :hover/:focus */\n	border-bottom: 2px solid transparent;\n}\n.star_rating output {\n	font-size: 1.5em;\n	padding: 0 1em;\n}\n.star_rating input:checked ~ label {\n	color: #999;\n}\n.star_rating input:checked + label {\n	color: #036;\n	border-bottom-color: #036;\n}\n.star_rating input:focus + label {\n	border-bottom-style: dotted;\n}\n.star_rating:hover input + label {\n	color: #036;\n}\n.star_rating input:hover ~ label,\n.star_rating input:focus ~ label,\n.star_rating input[id=\"star0\"] + label {\n	color: #999;\n}\n.star_rating input:hover + label,\n.star_rating input:focus + label {\n	color: #036;\n}\n.star_rating input[id=\"star0\"]:checked + label {\n	color: #ff2d21;\n}\n\n/*! from USWDS  uswds v2.9.0 */\n#fba-button.usa-button{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:0.9;\n  -moz-osx-font-smoothing:grayscale;\n  -webkit-font-smoothing:antialiased;\n  color:white;\n  background-color:#005ea2;\n  -webkit-appearance:none;\n     -moz-appearance:none;\n          appearance:none;\n  border:0;\n  border-radius:0.25rem;\n  cursor:pointer;\n  display:inline-block;\n  font-weight:bold;\n  margin-right:0.5rem;\n  padding:0.75rem 1.25rem;\n  text-align:center;\n  text-decoration:none;\n  border-bottom-left-radius: 0;\n  border-bottom-right-radius: 0\n}\n\n.usa-skipnav.touchpoints-skipnav{\n  font-family:Source Sans Pro Web, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;\n  font-size:1.06rem;\n  line-height:1.5;\n  color:#005ea2;\n  text-decoration:underline;\n  background:transparent;\n  left:0;\n  padding:0.5rem 1rem;\n  position:absolute;\n  top:-3.8rem;\n  transition:0.15s ease-in-out;\n  z-index:100;\n}\n.usa-skipnav.touchpoints-skipnav:visited{\n  color:#54278f;\n}\n.usa-skipnav.touchpoints-skipnav:hover{\n  color:#1a4480;\n}\n.usa-skipnav.touchpoints-skipnav:active{\n  color:#162e51;\n}\n.usa-skipnav.touchpoints-skipnav:focus{\n  outline:0.25rem solid #2491ff;\n  outline-offset:0;\n}\n.usa-skipnav.touchpoints-skipnav:focus{\n  background:white;\n  left:0;\n  position:absolute;\n  top:0;\n  transition:0.2s ease-in-out;\n}\n\n.fba-modal-dialog abbr[title=required]{\n  text-decoration:none;\n}\n\n/* Custom */\n.touchpoints-form-wrapper .usa-banner {\n  margin-top: 10px;\n}\n\n.usa-banner__header.touchpoints-footer-banner {\n  min-height: 0;\n}\n\n.fba-modal-dialog .question-options.big-thumbs .usa-radio__label::before {\n  display: none;\n}\n\n/* Same max-width as texarea */\n.touchpoints-form-body .big-thumbs {\n  max-width: 35rem;\n}\n\n.question-options.big-thumbs .usa-radio__input--tile+.usa-radio__label {\n  color: #005ea2;\n  padding-left: 1rem;\n}\n\n.touchpoint-form .question-options {\n  clear: both;\n}\n\n.touchpoint-form {\n  max-width: 35em;\n  margin-left: auto;\n  margin-right: auto;\n}\n\n.fba-modal-dialog .margin-top-3{\n  margin-top:1.5rem;\n}\n\n/* Override */\n.touchpoint-form .usa-form--large {\n  max-width: 35rem;\n}\n\n.fba-modal-dialog .usa-sr-only{\n  position:absolute;\n  left:-999em;\n  right:auto;\n}\n\n/* big thumbs up down buttons */\n.fba-modal-dialog .usa-icon{\n  display:inline-block;\n  fill:currentColor;\n  height:1em;\n  position:relative;\n  width:1em;\n}\n\n.fba-modal-dialog .margin-top-2 {\n  margin-top:1rem;\n}\n\n.fba-modal-dialog .text-center{\n  text-align:center;\n}\n\n.fba-modal-dialog .font-sans-3xl{\n  font-size:3.19rem;\n}\n\n.fba-modal-dialog .margin-bottom-2 {\n  margin-bottom:1rem;\n}\n\n.fba-modal-dialog .margin-bottom-3 {\n  margin-top:1.5rem;\n}\n\n.fba-modal-dialog .text-right{\n  text-align:right;\n}\n\n.fba-modal-dialog .text-bold{\n  font-weight:700;\n}\n\n.fba-modal-dialog .usa-button .margin-top-0{\n  margin-top:0;\n}\n\n.fba-modal-dialog .previous-section.usa-button{\n  margin-top:0;\n}\n\n.fba-modal-dialog .border-0{\n  border:0 solid;\n}\n\n.fba-modal-dialog .border-gray-10{\n  border-color:#e6e6e6;\n}\n\n.fba-modal-dialog .border-top{\n  border-top:1px solid;\n}\n\n.fba-modal-dialog .display-none{\n  display:none;\n}\n\n.fba-modal-dialog .padding-bottom-0 {\n  padding-bottom:0;\n}\n\n.fba-modal-dialog .padding-top-0 {\n  padding-top:0;\n}\n\n.fba-modal-dialog .touchpoints-form-wrapper .usa-form {\n  max-width: 100%;\n}\n",
	'loadCSS' : true,
	'formSpecificScript' : function() {
	},
	'deliveryMethod' : "inline",
	'successTextHeading' : "Success",
	'successText' : "Thank you. Your feedback has been received.",
	'questionParams' : function(form) {
		return {
			answer_01 : form.querySelector("input[name=question_51968_answer_01]:checked") && form.querySelector("input[name=question_51968_answer_01]:checked").value,
			answer_02 : form.querySelector("#question_51969_answer_02") && form.querySelector("#question_51969_answer_02").value,
		}
	},
	'suppressUI' : false,
	'suppressSubmitButton' : false,
	'htmlFormBody' : function() {
		return "  <div\n    class=\"fba-usa-modal__content fba-modal-dialog\">\n    <div>\n      <div class=\"fba-usa-modal__main padding-bottom-0 padding-top-0\">\n        <div\n  class=\"touchpoints-form-wrapper custom\"\n  id=\"touchpoints-form-2dcadeaf\"\n  data-touchpoints-form-id=\"2dcadeaf\"\n>\n  <div class=\"touchpoints-inner-form-wrapper\">\n    <header>\n  <h1\n    class=\"word-break fba-modal-title\"\n    id=\"fba-form-title-2dcadeaf\">\n    Is this page helpful?\n  <\/h1>\n<\/header>\n    <div class=\"fba-alert usa-alert usa-alert--success\" role=\"status\" hidden>\n  <div class=\"usa-alert__body\">\n    <h2 class=\"usa-alert__heading\">\n      Success\n    <\/h2>\n    <div class=\"usa-alert__text\">\n      Thank you. Your feedback has been received.\n    <\/div>\n  <\/div>\n<\/div>\n<div class=\"fba-alert-error usa-alert usa-alert--error\" role=\"alert\" hidden>\n  <div class=\"usa-alert__body\">\n    <h2 class=\"usa-alert__heading\">\n      Error\n    <\/h2>\n    <p class=\"usa-alert__text\">\n      alert message\n    <\/p>\n  <\/div>\n<\/div>\n\n    \n<form\n  action=\"https://touchpoints.app.cloud.gov/touchpoints/2dcadeaf/submissions.json\"\n  class=\"usa-form usa-form--large margin-bottom-2\"\n  method=\"POST\">\n  <div class=\"touchpoints-form-body\">\n      <div class=\"section fba-visible\">\n\n\n\n        <div class=\"questions\">\n\n          <div class=\"question white-bg\"\n            id=\"question_51968\">\n              <fieldset class=\"usa-fieldset radios margin-top-3\">\n  <legend class=\"usa-legend\" id=\"question-label-51968\">\n  \n<\/legend>\n\n  <div class=\"question-options\">\n    <div class=\"radio-button usa-radio question-option\"\n      data-id=\"71031\"\n    >\n      <input type=\"radio\" name=\"question_51968_answer_01\" id=\"question_option_71031\" value=\"Yes\" class=\"usa-radio__input usa-radio__input--tile\" />\n      <label class=\"usa-radio__label\" for=\"question_option_71031\">Yes<\/label>\n    <\/div>\n    <div class=\"radio-button usa-radio question-option\"\n      data-id=\"71032\"\n    >\n      <input type=\"radio\" name=\"question_51968_answer_01\" id=\"question_option_71032\" value=\"No\" class=\"usa-radio__input usa-radio__input--tile\" />\n      <label class=\"usa-radio__label\" for=\"question_option_71032\">No<\/label>\n    <\/div>\n  <\/div>\n<\/fieldset>\n\n          <\/div>\n\n          <div class=\"question white-bg\"\n            id=\"question_51969\">\n              <div role=\"group\">\n  <label class=\"usa-label\" for=\"question_51969_answer_02\">\n  What were you looking for? (Optional)\n<\/label>\n\n  <textarea name=\"question_51969_answer_02\" id=\"question_51969_answer_02\" class=\"usa-textarea\" maxlength=\"10000\">\n<\/textarea>\n<\/div>\n\n          <\/div>\n        <\/div>\n\n          <button type=\"submit\" class=\"usa-button submit_form_button\">Submit<\/button>\n      <\/div>\n        <input type=\"hidden\" name=\"fba_location_code\" id=\"fba_location_code\" tabindex=\"-1\" autocomplete=\"off\" />\n    <input\n      type=\"text\"\n      name=\"fba_directive\"\n      id=\"fba_directive\"\n      class=\"display-none\"\n      title=\"fba_directive\"\n      aria-hidden=\"true\"\n      tabindex=\"-1\"\n      autocomplete=\"off\">\n  <\/div>\n<\/form>\n\n  <\/div>\n  \n<\/div>\n\n      <\/div>\n      \n<section\n  class=\"usa-banner\"\n  aria-label=\"footer An official website of the United States government\">\n  <footer class=\"usa-banner__header touchpoints-footer-banner\">\n    <div class=\"usa-banner__inner\">\n      <div class=\"grid-col-auto\">\n        <img\n            aria-hidden=\"true\"\n            class=\"usa-banner__header-flag\"\n            src=\"https://touchpoints.app.cloud.gov/img/us_flag_small.png\"\n            alt=\"U.S. flag\"\n          />\n      <\/div>\n      <div class=\"grid-col-fill tablet:grid-col-auto\">\n        <p class=\"usa-banner__header-text\">\n          An official form of the United States government.\n          Provided by\n          <a href=\"https://touchpoints.digital.gov\" target=\"_blank\" rel=\"noopener\" class=\"usa-link--external\">Touchpoints<\/a>\n          <br>\n\n        <\/p>\n      <\/div>\n    <\/div>\n  <\/footer>\n<\/section>\n\n    <\/div>\n  <\/div>\n";
	},
	'htmlFormBodyNoModal' : function() {
		return null;
	}
}

// Create an instance of a Touchpoints form object
var touchpointForm2dcadeaf = new FBAform(document, window).init(touchpointFormOptions2dcadeaf);


// Load the USWDS JS, loads as module 'fbaUswds' in global scope
/* This file was generated by the gulp task 'bundleWidgetJS'. */

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

const keymap = require("receptor/keymap");
const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");
const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");
const {
  CLICK
} = require("../../uswds-core/src/js/events");
const COMBO_BOX_CLASS = `${PREFIX}-combo-box`;
const COMBO_BOX_PRISTINE_CLASS = `${COMBO_BOX_CLASS}--pristine`;
const SELECT_CLASS = `${COMBO_BOX_CLASS}__select`;
const INPUT_CLASS = `${COMBO_BOX_CLASS}__input`;
const CLEAR_INPUT_BUTTON_CLASS = `${COMBO_BOX_CLASS}__clear-input`;
const CLEAR_INPUT_BUTTON_WRAPPER_CLASS = `${CLEAR_INPUT_BUTTON_CLASS}__wrapper`;
const INPUT_BUTTON_SEPARATOR_CLASS = `${COMBO_BOX_CLASS}__input-button-separator`;
const TOGGLE_LIST_BUTTON_CLASS = `${COMBO_BOX_CLASS}__toggle-list`;
const TOGGLE_LIST_BUTTON_WRAPPER_CLASS = `${TOGGLE_LIST_BUTTON_CLASS}__wrapper`;
const LIST_CLASS = `${COMBO_BOX_CLASS}__list`;
const LIST_OPTION_CLASS = `${COMBO_BOX_CLASS}__list-option`;
const LIST_OPTION_FOCUSED_CLASS = `${LIST_OPTION_CLASS}--focused`;
const LIST_OPTION_SELECTED_CLASS = `${LIST_OPTION_CLASS}--selected`;
const STATUS_CLASS = `${COMBO_BOX_CLASS}__status`;
const COMBO_BOX = `.${COMBO_BOX_CLASS}`;
const SELECT = `.${SELECT_CLASS}`;
const INPUT = `.${INPUT_CLASS}`;
const CLEAR_INPUT_BUTTON = `.${CLEAR_INPUT_BUTTON_CLASS}`;
const TOGGLE_LIST_BUTTON = `.${TOGGLE_LIST_BUTTON_CLASS}`;
const LIST = `.${LIST_CLASS}`;
const LIST_OPTION = `.${LIST_OPTION_CLASS}`;
const LIST_OPTION_FOCUSED = `.${LIST_OPTION_FOCUSED_CLASS}`;
const LIST_OPTION_SELECTED = `.${LIST_OPTION_SELECTED_CLASS}`;
const STATUS = `.${STATUS_CLASS}`;
const DEFAULT_FILTER = ".*{{query}}.*";
const noop = () => {};

/**
 * set the value of the element and dispatch a change event
 *
 * @param {HTMLInputElement|HTMLSelectElement} el The element to update
 * @param {string} value The new value of the element
 */
const changeElementValue = (el, value = "") => {
  const elementToChange = el;
  elementToChange.value = value;
  const event = new CustomEvent("change", {
    bubbles: true,
    cancelable: true,
    detail: {
      value
    }
  });
  elementToChange.dispatchEvent(event);
};

/**
 * The elements within the combo box.
 * @typedef {Object} ComboBoxContext
 * @property {HTMLElement} comboBoxEl
 * @property {HTMLSelectElement} selectEl
 * @property {HTMLInputElement} inputEl
 * @property {HTMLUListElement} listEl
 * @property {HTMLDivElement} statusEl
 * @property {HTMLLIElement} focusedOptionEl
 * @property {HTMLLIElement} selectedOptionEl
 * @property {HTMLButtonElement} toggleListBtnEl
 * @property {HTMLButtonElement} clearInputBtnEl
 * @property {boolean} isPristine
 * @property {boolean} disableFiltering
 */

/**
 * Get an object of elements belonging directly to the given
 * combo box component.
 *
 * @param {HTMLElement} el the element within the combo box
 * @returns {ComboBoxContext} elements
 */
const getComboBoxContext = el => {
  const comboBoxEl = el.closest(COMBO_BOX);
  if (!comboBoxEl) {
    throw new Error(`Element is missing outer ${COMBO_BOX}`);
  }
  const selectEl = comboBoxEl.querySelector(SELECT);
  const inputEl = comboBoxEl.querySelector(INPUT);
  const listEl = comboBoxEl.querySelector(LIST);
  const statusEl = comboBoxEl.querySelector(STATUS);
  const focusedOptionEl = comboBoxEl.querySelector(LIST_OPTION_FOCUSED);
  const selectedOptionEl = comboBoxEl.querySelector(LIST_OPTION_SELECTED);
  const toggleListBtnEl = comboBoxEl.querySelector(TOGGLE_LIST_BUTTON);
  const clearInputBtnEl = comboBoxEl.querySelector(CLEAR_INPUT_BUTTON);
  const isPristine = comboBoxEl.classList.contains(COMBO_BOX_PRISTINE_CLASS);
  const disableFiltering = comboBoxEl.dataset.disableFiltering === "true";
  return {
    comboBoxEl,
    selectEl,
    inputEl,
    listEl,
    statusEl,
    focusedOptionEl,
    selectedOptionEl,
    toggleListBtnEl,
    clearInputBtnEl,
    isPristine,
    disableFiltering
  };
};

/**
 * Disable the combo-box component
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */
const disable = el => {
  const {
    inputEl,
    toggleListBtnEl,
    clearInputBtnEl
  } = getComboBoxContext(el);
  clearInputBtnEl.hidden = true;
  clearInputBtnEl.disabled = true;
  toggleListBtnEl.disabled = true;
  inputEl.disabled = true;
};

/**
 * Check for aria-disabled on initialization
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */
const ariaDisable = el => {
  const {
    inputEl,
    toggleListBtnEl,
    clearInputBtnEl
  } = getComboBoxContext(el);
  clearInputBtnEl.hidden = true;
  clearInputBtnEl.setAttribute("aria-disabled", true);
  toggleListBtnEl.setAttribute("aria-disabled", true);
  inputEl.setAttribute("aria-disabled", true);
};

/**
 * Enable the combo-box component
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */
const enable = el => {
  const {
    inputEl,
    toggleListBtnEl,
    clearInputBtnEl
  } = getComboBoxContext(el);
  clearInputBtnEl.hidden = false;
  clearInputBtnEl.disabled = false;
  toggleListBtnEl.disabled = false;
  inputEl.disabled = false;
};

/**
 * Enhance a select element into a combo box component.
 *
 * @param {HTMLElement} _comboBoxEl The initial element of the combo box component
 */
const enhanceComboBox = _comboBoxEl => {
  const comboBoxEl = _comboBoxEl.closest(COMBO_BOX);
  if (comboBoxEl.dataset.enhanced) return;
  const selectEl = comboBoxEl.querySelector("select");
  if (!selectEl) {
    throw new Error(`${COMBO_BOX} is missing inner select`);
  }
  const selectId = selectEl.id;
  const selectLabel = document.querySelector(`label[for="${selectId}"]`);
  const listId = `${selectId}--list`;
  const listIdLabel = `${selectId}-label`;
  const additionalAttributes = [];
  const {
    defaultValue
  } = comboBoxEl.dataset;
  const {
    placeholder
  } = comboBoxEl.dataset;
  let selectedOption;
  if (placeholder) {
    additionalAttributes.push({
      placeholder
    });
  }
  if (defaultValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];
      if (optionEl.value === defaultValue) {
        selectedOption = optionEl;
        break;
      }
    }
  }

  /**
   * Throw error if combobox is missing a label or label is missing
   * `for` attribute. Otherwise, set the ID to match the <ul> aria-labelledby
   */
  if (!selectLabel || !selectLabel.matches(`label[for="${selectId}"]`)) {
    throw new Error(`${COMBO_BOX} for ${selectId} is either missing a label or a "for" attribute`);
  } else {
    selectLabel.setAttribute("id", listIdLabel);
  }
  selectLabel.setAttribute("id", listIdLabel);
  selectEl.setAttribute("aria-hidden", "true");
  selectEl.setAttribute("tabindex", "-1");
  selectEl.classList.add("usa-sr-only", SELECT_CLASS);
  selectEl.id = "";
  selectEl.value = "";
  ["required", "aria-label", "aria-labelledby"].forEach(name => {
    if (selectEl.hasAttribute(name)) {
      const value = selectEl.getAttribute(name);
      additionalAttributes.push({
        [name]: value
      });
      selectEl.removeAttribute(name);
    }
  });

  // sanitize doesn't like functions in template literals
  const input = document.createElement("input");
  input.setAttribute("id", selectId);
  input.setAttribute("aria-owns", listId);
  input.setAttribute("aria-controls", listId);
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("autocomplete", "off");
  input.setAttribute("class", INPUT_CLASS);
  input.setAttribute("type", "text");
  input.setAttribute("role", "combobox");
  additionalAttributes.forEach(attr => Object.keys(attr).forEach(key => {
    const value = Sanitizer.escapeHTML`${attr[key]}`;
    input.setAttribute(key, value);
  }));
  comboBoxEl.insertAdjacentElement("beforeend", input);
  comboBoxEl.insertAdjacentHTML("beforeend", Sanitizer.escapeHTML`
    <span class="${CLEAR_INPUT_BUTTON_WRAPPER_CLASS}" tabindex="-1">
        <button type="button" class="${CLEAR_INPUT_BUTTON_CLASS}" aria-label="Clear the select contents">&nbsp;</button>
      </span>
      <span class="${INPUT_BUTTON_SEPARATOR_CLASS}">&nbsp;</span>
      <span class="${TOGGLE_LIST_BUTTON_WRAPPER_CLASS}" tabindex="-1">
        <button type="button" tabindex="-1" class="${TOGGLE_LIST_BUTTON_CLASS}" aria-label="Toggle the dropdown list">&nbsp;</button>
      </span>
      <ul
        tabindex="-1"
        id="${listId}"
        class="${LIST_CLASS}"
        role="listbox"
        aria-labelledby="${listIdLabel}"
        hidden>
      </ul>
      <div class="${STATUS_CLASS} usa-sr-only" role="status"></div>`);
  if (selectedOption) {
    const {
      inputEl
    } = getComboBoxContext(comboBoxEl);
    changeElementValue(selectEl, selectedOption.value);
    changeElementValue(inputEl, selectedOption.text);
    comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
  }
  if (selectEl.disabled) {
    disable(comboBoxEl);
    selectEl.disabled = false;
  }
  if (selectEl.hasAttribute("aria-disabled")) {
    ariaDisable(comboBoxEl);
    selectEl.removeAttribute("aria-disabled");
  }
  comboBoxEl.dataset.enhanced = "true";
};

/**
 * Manage the focused element within the list options when
 * navigating via keyboard.
 *
 * @param {HTMLElement} el An anchor element within the combo box component
 * @param {HTMLElement} nextEl An element within the combo box component
 * @param {Object} options options
 * @param {boolean} options.skipFocus skip focus of highlighted item
 * @param {boolean} options.preventScroll should skip procedure to scroll to element
 */
const highlightOption = (el, nextEl, {
  skipFocus,
  preventScroll
} = {}) => {
  const {
    inputEl,
    listEl,
    focusedOptionEl
  } = getComboBoxContext(el);
  if (focusedOptionEl) {
    focusedOptionEl.classList.remove(LIST_OPTION_FOCUSED_CLASS);
    focusedOptionEl.setAttribute("tabIndex", "-1");
  }
  if (nextEl) {
    inputEl.setAttribute("aria-activedescendant", nextEl.id);
    nextEl.setAttribute("tabIndex", "0");
    nextEl.classList.add(LIST_OPTION_FOCUSED_CLASS);
    if (!preventScroll) {
      const optionBottom = nextEl.offsetTop + nextEl.offsetHeight;
      const currentBottom = listEl.scrollTop + listEl.offsetHeight;
      if (optionBottom > currentBottom) {
        listEl.scrollTop = optionBottom - listEl.offsetHeight;
      }
      if (nextEl.offsetTop < listEl.scrollTop) {
        listEl.scrollTop = nextEl.offsetTop;
      }
    }
    if (!skipFocus) {
      nextEl.focus({
        preventScroll
      });
    }
  } else {
    inputEl.setAttribute("aria-activedescendant", "");
    inputEl.focus();
  }
};

/**
 * Generate a dynamic regular expression based off of a replaceable and possibly filtered value.
 *
 * @param {string} el An element within the combo box component
 * @param {string} query The value to use in the regular expression
 * @param {object} extras An object of regular expressions to replace and filter the query
 */
const generateDynamicRegExp = (filter, query = "", extras = {}) => {
  const escapeRegExp = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  let find = filter.replace(/{{(.*?)}}/g, (m, $1) => {
    const key = $1.trim();
    const queryFilter = extras[key];
    if (key !== "query" && queryFilter) {
      const matcher = new RegExp(queryFilter, "i");
      const matches = query.match(matcher);
      if (matches) {
        return escapeRegExp(matches[1]);
      }
      return "";
    }
    return escapeRegExp(query);
  });
  find = `^(?:${find})$`;
  return new RegExp(find, "i");
};

/**
 * Display the option list of a combo box component.
 *
 * @param {HTMLElement} el An element within the combo box component
 */
const displayList = el => {
  const {
    comboBoxEl,
    selectEl,
    inputEl,
    listEl,
    statusEl,
    isPristine,
    disableFiltering
  } = getComboBoxContext(el);
  let selectedItemId;
  let firstFoundId;
  const listOptionBaseId = `${listEl.id}--option-`;
  const inputValue = (inputEl.value || "").toLowerCase();
  const filter = comboBoxEl.dataset.filter || DEFAULT_FILTER;
  const regex = generateDynamicRegExp(filter, inputValue, comboBoxEl.dataset);
  const options = [];
  for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
    const optionEl = selectEl.options[i];
    const optionId = `${listOptionBaseId}${options.length}`;
    if (optionEl.value && (disableFiltering || isPristine || !inputValue || regex.test(optionEl.text))) {
      if (selectEl.value && optionEl.value === selectEl.value) {
        selectedItemId = optionId;
      }
      if (disableFiltering && !firstFoundId && regex.test(optionEl.text)) {
        firstFoundId = optionId;
      }
      options.push(optionEl);
    }
  }
  const numOptions = options.length;
  const optionHtml = options.map((option, index) => {
    const optionId = `${listOptionBaseId}${index}`;
    const classes = [LIST_OPTION_CLASS];
    let tabindex = "-1";
    let ariaSelected = "false";
    if (optionId === selectedItemId) {
      classes.push(LIST_OPTION_SELECTED_CLASS, LIST_OPTION_FOCUSED_CLASS);
      tabindex = "0";
      ariaSelected = "true";
    }
    if (!selectedItemId && index === 0) {
      classes.push(LIST_OPTION_FOCUSED_CLASS);
      tabindex = "0";
    }
    const li = document.createElement("li");
    li.setAttribute("aria-setsize", options.length);
    li.setAttribute("aria-posinset", index + 1);
    li.setAttribute("aria-selected", ariaSelected);
    li.setAttribute("id", optionId);
    li.setAttribute("class", classes.join(" "));
    li.setAttribute("tabindex", tabindex);
    li.setAttribute("role", "option");
    li.setAttribute("data-value", option.value);
    li.textContent = option.text;
    return li;
  });
  const noResults = document.createElement("li");
  noResults.setAttribute("class", `${LIST_OPTION_CLASS}--no-results`);
  noResults.textContent = "No results found";
  listEl.hidden = false;
  if (numOptions) {
    listEl.innerHTML = "";
    optionHtml.forEach(item => listEl.insertAdjacentElement("beforeend", item));
  } else {
    listEl.innerHTML = "";
    listEl.insertAdjacentElement("beforeend", noResults);
  }
  inputEl.setAttribute("aria-expanded", "true");
  statusEl.textContent = numOptions ? `${numOptions} result${numOptions > 1 ? "s" : ""} available.` : "No results.";
  let itemToFocus;
  if (isPristine && selectedItemId) {
    itemToFocus = listEl.querySelector(`#${selectedItemId}`);
  } else if (disableFiltering && firstFoundId) {
    itemToFocus = listEl.querySelector(`#${firstFoundId}`);
  }
  if (itemToFocus) {
    highlightOption(listEl, itemToFocus, {
      skipFocus: true
    });
  }
};

/**
 * Hide the option list of a combo box component.
 *
 * @param {HTMLElement} el An element within the combo box component
 */
const hideList = el => {
  const {
    inputEl,
    listEl,
    statusEl,
    focusedOptionEl
  } = getComboBoxContext(el);
  statusEl.innerHTML = "";
  inputEl.setAttribute("aria-expanded", "false");
  inputEl.setAttribute("aria-activedescendant", "");
  if (focusedOptionEl) {
    focusedOptionEl.classList.remove(LIST_OPTION_FOCUSED_CLASS);
  }
  listEl.scrollTop = 0;
  listEl.hidden = true;
};

/**
 * Select an option list of the combo box component.
 *
 * @param {HTMLElement} listOptionEl The list option being selected
 */
const selectItem = listOptionEl => {
  const {
    comboBoxEl,
    selectEl,
    inputEl
  } = getComboBoxContext(listOptionEl);
  changeElementValue(selectEl, listOptionEl.dataset.value);
  changeElementValue(inputEl, listOptionEl.textContent);
  comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
  hideList(comboBoxEl);
  inputEl.focus();
};

/**
 * Clear the input of the combo box
 *
 * @param {HTMLButtonElement} clearButtonEl The clear input button
 */
const clearInput = clearButtonEl => {
  const {
    comboBoxEl,
    listEl,
    selectEl,
    inputEl
  } = getComboBoxContext(clearButtonEl);
  const listShown = !listEl.hidden;
  if (selectEl.value) changeElementValue(selectEl);
  if (inputEl.value) changeElementValue(inputEl);
  comboBoxEl.classList.remove(COMBO_BOX_PRISTINE_CLASS);
  if (listShown) displayList(comboBoxEl);
  inputEl.focus();
};

/**
 * Reset the select based off of currently set select value
 *
 * @param {HTMLElement} el An element within the combo box component
 */
const resetSelection = el => {
  const {
    comboBoxEl,
    selectEl,
    inputEl
  } = getComboBoxContext(el);
  const selectValue = selectEl.value;
  const inputValue = (inputEl.value || "").toLowerCase();
  if (selectValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];
      if (optionEl.value === selectValue) {
        if (inputValue !== optionEl.text) {
          changeElementValue(inputEl, optionEl.text);
        }
        comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
        return;
      }
    }
  }
  if (inputValue) {
    changeElementValue(inputEl);
  }
};

/**
 * Select an option list of the combo box component based off of
 * having a current focused list option or
 * having test that completely matches a list option.
 * Otherwise it clears the input and select.
 *
 * @param {HTMLElement} el An element within the combo box component
 */
const completeSelection = el => {
  const {
    comboBoxEl,
    selectEl,
    inputEl,
    statusEl
  } = getComboBoxContext(el);
  statusEl.textContent = "";
  const inputValue = (inputEl.value || "").toLowerCase();
  if (inputValue) {
    for (let i = 0, len = selectEl.options.length; i < len; i += 1) {
      const optionEl = selectEl.options[i];
      if (optionEl.text.toLowerCase() === inputValue) {
        changeElementValue(selectEl, optionEl.value);
        changeElementValue(inputEl, optionEl.text);
        comboBoxEl.classList.add(COMBO_BOX_PRISTINE_CLASS);
        return;
      }
    }
  }
  resetSelection(comboBoxEl);
};

/**
 * Handle the escape event within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleEscape = event => {
  const {
    comboBoxEl,
    inputEl
  } = getComboBoxContext(event.target);
  hideList(comboBoxEl);
  resetSelection(comboBoxEl);
  inputEl.focus();
};

/**
 * Handle the down event within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleDownFromInput = event => {
  const {
    comboBoxEl,
    listEl
  } = getComboBoxContext(event.target);
  if (listEl.hidden) {
    displayList(comboBoxEl);
  }
  const nextOptionEl = listEl.querySelector(LIST_OPTION_FOCUSED) || listEl.querySelector(LIST_OPTION);
  if (nextOptionEl) {
    highlightOption(comboBoxEl, nextOptionEl);
  }
  event.preventDefault();
};

/**
 * Handle the enter event from an input element within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleEnterFromInput = event => {
  const {
    comboBoxEl,
    listEl
  } = getComboBoxContext(event.target);
  const listShown = !listEl.hidden;
  completeSelection(comboBoxEl);
  if (listShown) {
    hideList(comboBoxEl);
  }
  event.preventDefault();
};

/**
 * Handle the down event within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleDownFromListOption = event => {
  const focusedOptionEl = event.target;
  const nextOptionEl = focusedOptionEl.nextSibling;
  if (nextOptionEl) {
    highlightOption(focusedOptionEl, nextOptionEl);
  }
  event.preventDefault();
};

/**
 * Handle the space event from an list option element within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleSpaceFromListOption = event => {
  selectItem(event.target);
  event.preventDefault();
};

/**
 * Handle the enter event from list option within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleEnterFromListOption = event => {
  selectItem(event.target);
  event.preventDefault();
};

/**
 * Handle the up event from list option within the combo box component.
 *
 * @param {KeyboardEvent} event An event within the combo box component
 */
const handleUpFromListOption = event => {
  const {
    comboBoxEl,
    listEl,
    focusedOptionEl
  } = getComboBoxContext(event.target);
  const nextOptionEl = focusedOptionEl && focusedOptionEl.previousSibling;
  const listShown = !listEl.hidden;
  highlightOption(comboBoxEl, nextOptionEl);
  if (listShown) {
    event.preventDefault();
  }
  if (!nextOptionEl) {
    hideList(comboBoxEl);
  }
};

/**
 * Select list option on the mouseover event.
 *
 * @param {MouseEvent} event The mouseover event
 * @param {HTMLLIElement} listOptionEl An element within the combo box component
 */
const handleMouseover = listOptionEl => {
  const isCurrentlyFocused = listOptionEl.classList.contains(LIST_OPTION_FOCUSED_CLASS);
  if (isCurrentlyFocused) return;
  highlightOption(listOptionEl, listOptionEl, {
    preventScroll: true
  });
};

/**
 * Toggle the list when the button is clicked
 *
 * @param {HTMLElement} el An element within the combo box component
 */
const toggleList = el => {
  const {
    comboBoxEl,
    listEl,
    inputEl
  } = getComboBoxContext(el);
  if (listEl.hidden) {
    displayList(comboBoxEl);
  } else {
    hideList(comboBoxEl);
  }
  inputEl.focus();
};

/**
 * Handle click from input
 *
 * @param {HTMLInputElement} el An element within the combo box component
 */
const handleClickFromInput = el => {
  const {
    comboBoxEl,
    listEl
  } = getComboBoxContext(el);
  if (listEl.hidden) {
    displayList(comboBoxEl);
  }
};
const comboBox = behavior({
  [CLICK]: {
    [INPUT]() {
      if (this.disabled) return;
      handleClickFromInput(this);
    },
    [TOGGLE_LIST_BUTTON]() {
      if (this.disabled) return;
      toggleList(this);
    },
    [LIST_OPTION]() {
      if (this.disabled) return;
      selectItem(this);
    },
    [CLEAR_INPUT_BUTTON]() {
      if (this.disabled) return;
      clearInput(this);
    }
  },
  focusout: {
    [COMBO_BOX](event) {
      if (!this.contains(event.relatedTarget)) {
        resetSelection(this);
        hideList(this);
      }
    }
  },
  keydown: {
    [COMBO_BOX]: keymap({
      Escape: handleEscape
    }),
    [INPUT]: keymap({
      Enter: handleEnterFromInput,
      ArrowDown: handleDownFromInput,
      Down: handleDownFromInput
    }),
    [LIST_OPTION]: keymap({
      ArrowUp: handleUpFromListOption,
      Up: handleUpFromListOption,
      ArrowDown: handleDownFromListOption,
      Down: handleDownFromListOption,
      Enter: handleEnterFromListOption,
      " ": handleSpaceFromListOption,
      "Shift+Tab": noop
    })
  },
  input: {
    [INPUT]() {
      const comboBoxEl = this.closest(COMBO_BOX);
      comboBoxEl.classList.remove(COMBO_BOX_PRISTINE_CLASS);
      displayList(this);
    }
  },
  mouseover: {
    [LIST_OPTION]() {
      handleMouseover(this);
    }
  }
}, {
  init(root) {
    selectOrMatches(COMBO_BOX, root).forEach(comboBoxEl => {
      enhanceComboBox(comboBoxEl);
    });
  },
  getComboBoxContext,
  enhanceComboBox,
  generateDynamicRegExp,
  disable,
  enable,
  displayList,
  hideList,
  COMBO_BOX_CLASS
});
module.exports = comboBox;

},{"../../uswds-core/src/js/config":4,"../../uswds-core/src/js/events":5,"../../uswds-core/src/js/utils/behavior":7,"../../uswds-core/src/js/utils/sanitizer":10,"../../uswds-core/src/js/utils/select-or-matches":12,"receptor/keymap":23}],2:[function(require,module,exports){
"use strict";

const keymap = require("receptor/keymap");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const select = require("../../uswds-core/src/js/utils/select");
const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
const {
  prefix: PREFIX
} = require("../../uswds-core/src/js/config");
const {
  CLICK
} = require("../../uswds-core/src/js/events");
const activeElement = require("../../uswds-core/src/js/utils/active-element");
const isIosDevice = require("../../uswds-core/src/js/utils/is-ios-device");
const Sanitizer = require("../../uswds-core/src/js/utils/sanitizer");
const DATE_PICKER_CLASS = `${PREFIX}-date-picker`;
const DATE_PICKER_WRAPPER_CLASS = `${DATE_PICKER_CLASS}__wrapper`;
const DATE_PICKER_INITIALIZED_CLASS = `${DATE_PICKER_CLASS}--initialized`;
const DATE_PICKER_ACTIVE_CLASS = `${DATE_PICKER_CLASS}--active`;
const DATE_PICKER_INTERNAL_INPUT_CLASS = `${DATE_PICKER_CLASS}__internal-input`;
const DATE_PICKER_EXTERNAL_INPUT_CLASS = `${DATE_PICKER_CLASS}__external-input`;
const DATE_PICKER_BUTTON_CLASS = `${DATE_PICKER_CLASS}__button`;
const DATE_PICKER_CALENDAR_CLASS = `${DATE_PICKER_CLASS}__calendar`;
const DATE_PICKER_STATUS_CLASS = `${DATE_PICKER_CLASS}__status`;
const CALENDAR_DATE_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__date`;
const CALENDAR_DATE_FOCUSED_CLASS = `${CALENDAR_DATE_CLASS}--focused`;
const CALENDAR_DATE_SELECTED_CLASS = `${CALENDAR_DATE_CLASS}--selected`;
const CALENDAR_DATE_PREVIOUS_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--previous-month`;
const CALENDAR_DATE_CURRENT_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--current-month`;
const CALENDAR_DATE_NEXT_MONTH_CLASS = `${CALENDAR_DATE_CLASS}--next-month`;
const CALENDAR_DATE_RANGE_DATE_CLASS = `${CALENDAR_DATE_CLASS}--range-date`;
const CALENDAR_DATE_TODAY_CLASS = `${CALENDAR_DATE_CLASS}--today`;
const CALENDAR_DATE_RANGE_DATE_START_CLASS = `${CALENDAR_DATE_CLASS}--range-date-start`;
const CALENDAR_DATE_RANGE_DATE_END_CLASS = `${CALENDAR_DATE_CLASS}--range-date-end`;
const CALENDAR_DATE_WITHIN_RANGE_CLASS = `${CALENDAR_DATE_CLASS}--within-range`;
const CALENDAR_PREVIOUS_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-year`;
const CALENDAR_PREVIOUS_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-month`;
const CALENDAR_NEXT_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-year`;
const CALENDAR_NEXT_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-month`;
const CALENDAR_MONTH_SELECTION_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-selection`;
const CALENDAR_YEAR_SELECTION_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year-selection`;
const CALENDAR_MONTH_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month`;
const CALENDAR_MONTH_FOCUSED_CLASS = `${CALENDAR_MONTH_CLASS}--focused`;
const CALENDAR_MONTH_SELECTED_CLASS = `${CALENDAR_MONTH_CLASS}--selected`;
const CALENDAR_YEAR_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year`;
const CALENDAR_YEAR_FOCUSED_CLASS = `${CALENDAR_YEAR_CLASS}--focused`;
const CALENDAR_YEAR_SELECTED_CLASS = `${CALENDAR_YEAR_CLASS}--selected`;
const CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__previous-year-chunk`;
const CALENDAR_NEXT_YEAR_CHUNK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__next-year-chunk`;
const CALENDAR_DATE_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__date-picker`;
const CALENDAR_MONTH_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-picker`;
const CALENDAR_YEAR_PICKER_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__year-picker`;
const CALENDAR_TABLE_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__table`;
const CALENDAR_ROW_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__row`;
const CALENDAR_CELL_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__cell`;
const CALENDAR_CELL_CENTER_ITEMS_CLASS = `${CALENDAR_CELL_CLASS}--center-items`;
const CALENDAR_MONTH_LABEL_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__month-label`;
const CALENDAR_DAY_OF_WEEK_CLASS = `${DATE_PICKER_CALENDAR_CLASS}__day-of-week`;
const DATE_PICKER = `.${DATE_PICKER_CLASS}`;
const DATE_PICKER_BUTTON = `.${DATE_PICKER_BUTTON_CLASS}`;
const DATE_PICKER_INTERNAL_INPUT = `.${DATE_PICKER_INTERNAL_INPUT_CLASS}`;
const DATE_PICKER_EXTERNAL_INPUT = `.${DATE_PICKER_EXTERNAL_INPUT_CLASS}`;
const DATE_PICKER_CALENDAR = `.${DATE_PICKER_CALENDAR_CLASS}`;
const DATE_PICKER_STATUS = `.${DATE_PICKER_STATUS_CLASS}`;
const CALENDAR_DATE = `.${CALENDAR_DATE_CLASS}`;
const CALENDAR_DATE_FOCUSED = `.${CALENDAR_DATE_FOCUSED_CLASS}`;
const CALENDAR_DATE_CURRENT_MONTH = `.${CALENDAR_DATE_CURRENT_MONTH_CLASS}`;
const CALENDAR_PREVIOUS_YEAR = `.${CALENDAR_PREVIOUS_YEAR_CLASS}`;
const CALENDAR_PREVIOUS_MONTH = `.${CALENDAR_PREVIOUS_MONTH_CLASS}`;
const CALENDAR_NEXT_YEAR = `.${CALENDAR_NEXT_YEAR_CLASS}`;
const CALENDAR_NEXT_MONTH = `.${CALENDAR_NEXT_MONTH_CLASS}`;
const CALENDAR_YEAR_SELECTION = `.${CALENDAR_YEAR_SELECTION_CLASS}`;
const CALENDAR_MONTH_SELECTION = `.${CALENDAR_MONTH_SELECTION_CLASS}`;
const CALENDAR_MONTH = `.${CALENDAR_MONTH_CLASS}`;
const CALENDAR_YEAR = `.${CALENDAR_YEAR_CLASS}`;
const CALENDAR_PREVIOUS_YEAR_CHUNK = `.${CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS}`;
const CALENDAR_NEXT_YEAR_CHUNK = `.${CALENDAR_NEXT_YEAR_CHUNK_CLASS}`;
const CALENDAR_DATE_PICKER = `.${CALENDAR_DATE_PICKER_CLASS}`;
const CALENDAR_MONTH_PICKER = `.${CALENDAR_MONTH_PICKER_CLASS}`;
const CALENDAR_YEAR_PICKER = `.${CALENDAR_YEAR_PICKER_CLASS}`;
const CALENDAR_MONTH_FOCUSED = `.${CALENDAR_MONTH_FOCUSED_CLASS}`;
const CALENDAR_YEAR_FOCUSED = `.${CALENDAR_YEAR_FOCUSED_CLASS}`;
const VALIDATION_MESSAGE = "Please enter a valid date";
const MONTH_LABELS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_OF_WEEK_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ENTER_KEYCODE = 13;
const YEAR_CHUNK = 12;
const DEFAULT_MIN_DATE = "0000-01-01";
const DEFAULT_EXTERNAL_DATE_FORMAT = "MM/DD/YYYY";
const INTERNAL_DATE_FORMAT = "YYYY-MM-DD";
const NOT_DISABLED_SELECTOR = ":not([disabled])";
const processFocusableSelectors = (...selectors) => selectors.map(query => query + NOT_DISABLED_SELECTOR).join(", ");
const DATE_PICKER_FOCUSABLE = processFocusableSelectors(CALENDAR_PREVIOUS_YEAR, CALENDAR_PREVIOUS_MONTH, CALENDAR_YEAR_SELECTION, CALENDAR_MONTH_SELECTION, CALENDAR_NEXT_YEAR, CALENDAR_NEXT_MONTH, CALENDAR_DATE_FOCUSED);
const MONTH_PICKER_FOCUSABLE = processFocusableSelectors(CALENDAR_MONTH_FOCUSED);
const YEAR_PICKER_FOCUSABLE = processFocusableSelectors(CALENDAR_PREVIOUS_YEAR_CHUNK, CALENDAR_NEXT_YEAR_CHUNK, CALENDAR_YEAR_FOCUSED);

// #region Date Manipulation Functions

/**
 * Keep date within month. Month would only be over by 1 to 3 days
 *
 * @param {Date} dateToCheck the date object to check
 * @param {number} month the correct month
 * @returns {Date} the date, corrected if needed
 */
const keepDateWithinMonth = (dateToCheck, month) => {
  if (month !== dateToCheck.getMonth()) {
    dateToCheck.setDate(0);
  }
  return dateToCheck;
};

/**
 * Set date from month day year
 *
 * @param {number} year the year to set
 * @param {number} month the month to set (zero-indexed)
 * @param {number} date the date to set
 * @returns {Date} the set date
 */
const setDate = (year, month, date) => {
  const newDate = new Date(0);
  newDate.setFullYear(year, month, date);
  return newDate;
};

/**
 * todays date
 *
 * @returns {Date} todays date
 */
const today = () => {
  const newDate = new Date();
  const day = newDate.getDate();
  const month = newDate.getMonth();
  const year = newDate.getFullYear();
  return setDate(year, month, day);
};

/**
 * Set date to first day of the month
 *
 * @param {number} date the date to adjust
 * @returns {Date} the adjusted date
 */
const startOfMonth = date => {
  const newDate = new Date(0);
  newDate.setFullYear(date.getFullYear(), date.getMonth(), 1);
  return newDate;
};

/**
 * Set date to last day of the month
 *
 * @param {number} date the date to adjust
 * @returns {Date} the adjusted date
 */
const lastDayOfMonth = date => {
  const newDate = new Date(0);
  newDate.setFullYear(date.getFullYear(), date.getMonth() + 1, 0);
  return newDate;
};

/**
 * Add days to date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numDays the difference in days
 * @returns {Date} the adjusted date
 */
const addDays = (_date, numDays) => {
  const newDate = new Date(_date.getTime());
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
};

/**
 * Subtract days from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numDays the difference in days
 * @returns {Date} the adjusted date
 */
const subDays = (_date, numDays) => addDays(_date, -numDays);

/**
 * Add weeks to date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numWeeks the difference in weeks
 * @returns {Date} the adjusted date
 */
const addWeeks = (_date, numWeeks) => addDays(_date, numWeeks * 7);

/**
 * Subtract weeks from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numWeeks the difference in weeks
 * @returns {Date} the adjusted date
 */
const subWeeks = (_date, numWeeks) => addWeeks(_date, -numWeeks);

/**
 * Set date to the start of the week (Sunday)
 *
 * @param {Date} _date the date to adjust
 * @returns {Date} the adjusted date
 */
const startOfWeek = _date => {
  const dayOfWeek = _date.getDay();
  return subDays(_date, dayOfWeek);
};

/**
 * Set date to the end of the week (Saturday)
 *
 * @param {Date} _date the date to adjust
 * @param {number} numWeeks the difference in weeks
 * @returns {Date} the adjusted date
 */
const endOfWeek = _date => {
  const dayOfWeek = _date.getDay();
  return addDays(_date, 6 - dayOfWeek);
};

/**
 * Add months to date and keep date within month
 *
 * @param {Date} _date the date to adjust
 * @param {number} numMonths the difference in months
 * @returns {Date} the adjusted date
 */
const addMonths = (_date, numMonths) => {
  const newDate = new Date(_date.getTime());
  const dateMonth = (newDate.getMonth() + 12 + numMonths) % 12;
  newDate.setMonth(newDate.getMonth() + numMonths);
  keepDateWithinMonth(newDate, dateMonth);
  return newDate;
};

/**
 * Subtract months from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numMonths the difference in months
 * @returns {Date} the adjusted date
 */
const subMonths = (_date, numMonths) => addMonths(_date, -numMonths);

/**
 * Add years to date and keep date within month
 *
 * @param {Date} _date the date to adjust
 * @param {number} numYears the difference in years
 * @returns {Date} the adjusted date
 */
const addYears = (_date, numYears) => addMonths(_date, numYears * 12);

/**
 * Subtract years from date
 *
 * @param {Date} _date the date to adjust
 * @param {number} numYears the difference in years
 * @returns {Date} the adjusted date
 */
const subYears = (_date, numYears) => addYears(_date, -numYears);

/**
 * Set months of date
 *
 * @param {Date} _date the date to adjust
 * @param {number} month zero-indexed month to set
 * @returns {Date} the adjusted date
 */
const setMonth = (_date, month) => {
  const newDate = new Date(_date.getTime());
  newDate.setMonth(month);
  keepDateWithinMonth(newDate, month);
  return newDate;
};

/**
 * Set year of date
 *
 * @param {Date} _date the date to adjust
 * @param {number} year the year to set
 * @returns {Date} the adjusted date
 */
const setYear = (_date, year) => {
  const newDate = new Date(_date.getTime());
  const month = newDate.getMonth();
  newDate.setFullYear(year);
  keepDateWithinMonth(newDate, month);
  return newDate;
};

/**
 * Return the earliest date
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {Date} the earliest date
 */
const min = (dateA, dateB) => {
  let newDate = dateA;
  if (dateB < dateA) {
    newDate = dateB;
  }
  return new Date(newDate.getTime());
};

/**
 * Return the latest date
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {Date} the latest date
 */
const max = (dateA, dateB) => {
  let newDate = dateA;
  if (dateB > dateA) {
    newDate = dateB;
  }
  return new Date(newDate.getTime());
};

/**
 * Check if dates are the in the same year
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {boolean} are dates in the same year
 */
const isSameYear = (dateA, dateB) => dateA && dateB && dateA.getFullYear() === dateB.getFullYear();

/**
 * Check if dates are the in the same month
 *
 * @param {Date} dateA date to compare
 * @param {Date} dateB date to compare
 * @returns {boolean} are dates in the same month
 */
const isSameMonth = (dateA, dateB) => isSameYear(dateA, dateB) && dateA.getMonth() === dateB.getMonth();

/**
 * Check if dates are the same date
 *
 * @param {Date} dateA the date to compare
 * @param {Date} dateA the date to compare
 * @returns {boolean} are dates the same date
 */
const isSameDay = (dateA, dateB) => isSameMonth(dateA, dateB) && dateA.getDate() === dateB.getDate();

/**
 * return a new date within minimum and maximum date
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @returns {Date} the date between min and max
 */
const keepDateBetweenMinAndMax = (date, minDate, maxDate) => {
  let newDate = date;
  if (date < minDate) {
    newDate = minDate;
  } else if (maxDate && date > maxDate) {
    newDate = maxDate;
  }
  return new Date(newDate.getTime());
};

/**
 * Check if dates is valid.
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @return {boolean} is there a day within the month within min and max dates
 */
const isDateWithinMinAndMax = (date, minDate, maxDate) => date >= minDate && (!maxDate || date <= maxDate);

/**
 * Check if dates month is invalid.
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @return {boolean} is the month outside min or max dates
 */
const isDatesMonthOutsideMinOrMax = (date, minDate, maxDate) => lastDayOfMonth(date) < minDate || maxDate && startOfMonth(date) > maxDate;

/**
 * Check if dates year is invalid.
 *
 * @param {Date} date date to check
 * @param {Date} minDate minimum date to allow
 * @param {Date} maxDate maximum date to allow
 * @return {boolean} is the month outside min or max dates
 */
const isDatesYearOutsideMinOrMax = (date, minDate, maxDate) => lastDayOfMonth(setMonth(date, 11)) < minDate || maxDate && startOfMonth(setMonth(date, 0)) > maxDate;

/**
 * @typedef {Object} DateRangeContext
 * @property {Date} rangeStartDate
 * @property {Date} rangeEndDate
 * @property {Date} withinRangeStartDate
 * @property {Date} withinRangeEndDate
 */

/**
 * Set the start, end, and within range values for date range variants.

 * @param {Date} date - Date that concludes the date range.
 * @param {Date} rangeDate - Range date data attribute value of the date picker component.
 * @returns {DateRangeContext} - Dates for range selection.
 */
const setRangeDates = (date, rangeDate) => {
  const rangeConclusionDate = date;
  const rangeStartDate = rangeDate && min(rangeConclusionDate, rangeDate);
  const rangeEndDate = rangeDate && max(rangeConclusionDate, rangeDate);
  const withinRangeStartDate = rangeDate && addDays(rangeStartDate, 1);
  const withinRangeEndDate = rangeDate && subDays(rangeEndDate, 1);
  return {
    rangeStartDate,
    rangeEndDate,
    withinRangeStartDate,
    withinRangeEndDate
  };
};

/**
 * Parse a date with format M-D-YY
 *
 * @param {string} dateString the date string to parse
 * @param {string} dateFormat the format of the date string
 * @param {boolean} adjustDate should the date be adjusted
 * @returns {Date} the parsed date
 */
const parseDateString = (dateString, dateFormat = INTERNAL_DATE_FORMAT, adjustDate = false) => {
  let date;
  let month;
  let day;
  let year;
  let parsed;
  if (dateString) {
    let monthStr;
    let dayStr;
    let yearStr;
    if (dateFormat === DEFAULT_EXTERNAL_DATE_FORMAT) {
      [monthStr, dayStr, yearStr] = dateString.split("/");
    } else {
      [yearStr, monthStr, dayStr] = dateString.split("-");
    }
    if (yearStr) {
      parsed = parseInt(yearStr, 10);
      if (!Number.isNaN(parsed)) {
        year = parsed;
        if (adjustDate) {
          year = Math.max(0, year);
          if (yearStr.length < 3) {
            const currentYear = today().getFullYear();
            const currentYearStub = currentYear - currentYear % 10 ** yearStr.length;
            year = currentYearStub + parsed;
          }
        }
      }
    }
    if (monthStr) {
      parsed = parseInt(monthStr, 10);
      if (!Number.isNaN(parsed)) {
        month = parsed;
        if (adjustDate) {
          month = Math.max(1, month);
          month = Math.min(12, month);
        }
      }
    }
    if (month && dayStr && year != null) {
      parsed = parseInt(dayStr, 10);
      if (!Number.isNaN(parsed)) {
        day = parsed;
        if (adjustDate) {
          const lastDayOfTheMonth = setDate(year, month, 0).getDate();
          day = Math.max(1, day);
          day = Math.min(lastDayOfTheMonth, day);
        }
      }
    }
    if (month && day && year != null) {
      date = setDate(year, month - 1, day);
    }
  }
  return date;
};

/**
 * Format a date to format MM-DD-YYYY
 *
 * @param {Date} date the date to format
 * @param {string} dateFormat the format of the date string
 * @returns {string} the formatted date string
 */
const formatDate = (date, dateFormat = INTERNAL_DATE_FORMAT) => {
  const padZeros = (value, length) => `0000${value}`.slice(-length);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  if (dateFormat === DEFAULT_EXTERNAL_DATE_FORMAT) {
    return [padZeros(month, 2), padZeros(day, 2), padZeros(year, 4)].join("/");
  }
  return [padZeros(year, 4), padZeros(month, 2), padZeros(day, 2)].join("-");
};

// #endregion Date Manipulation Functions

/**
 * Create a grid string from an array of html strings
 *
 * @param {string[]} htmlArray the array of html items
 * @param {number} rowSize the length of a row
 * @returns {string} the grid string
 */
const listToGridHtml = (htmlArray, rowSize) => {
  const grid = [];
  let row = [];
  let i = 0;
  while (i < htmlArray.length) {
    row = [];
    const tr = document.createElement("tr");
    while (i < htmlArray.length && row.length < rowSize) {
      const td = document.createElement("td");
      td.insertAdjacentElement("beforeend", htmlArray[i]);
      row.push(td);
      i += 1;
    }
    row.forEach(element => {
      tr.insertAdjacentElement("beforeend", element);
    });
    grid.push(tr);
  }
  return grid;
};
const createTableBody = grid => {
  const tableBody = document.createElement("tbody");
  grid.forEach(element => {
    tableBody.insertAdjacentElement("beforeend", element);
  });
  return tableBody;
};

/**
 * set the value of the element and dispatch a change event
 *
 * @param {HTMLInputElement} el The element to update
 * @param {string} value The new value of the element
 */
const changeElementValue = (el, value = "") => {
  const elementToChange = el;
  elementToChange.value = value;
  const event = new CustomEvent("change", {
    bubbles: true,
    cancelable: true,
    detail: {
      value
    }
  });
  elementToChange.dispatchEvent(event);
};

/**
 * The properties and elements within the date picker.
 * @typedef {Object} DatePickerContext
 * @property {HTMLDivElement} calendarEl
 * @property {HTMLElement} datePickerEl
 * @property {HTMLInputElement} internalInputEl
 * @property {HTMLInputElement} externalInputEl
 * @property {HTMLDivElement} statusEl
 * @property {HTMLDivElement} firstYearChunkEl
 * @property {Date} calendarDate
 * @property {Date} minDate
 * @property {Date} maxDate
 * @property {Date} selectedDate
 * @property {Date} rangeDate
 * @property {Date} defaultDate
 */

/**
 * Get an object of the properties and elements belonging directly to the given
 * date picker component.
 *
 * @param {HTMLElement} el the element within the date picker
 * @returns {DatePickerContext} elements
 */
const getDatePickerContext = el => {
  const datePickerEl = el.closest(DATE_PICKER);
  if (!datePickerEl) {
    throw new Error(`Element is missing outer ${DATE_PICKER}`);
  }
  const internalInputEl = datePickerEl.querySelector(DATE_PICKER_INTERNAL_INPUT);
  const externalInputEl = datePickerEl.querySelector(DATE_PICKER_EXTERNAL_INPUT);
  const calendarEl = datePickerEl.querySelector(DATE_PICKER_CALENDAR);
  const toggleBtnEl = datePickerEl.querySelector(DATE_PICKER_BUTTON);
  const statusEl = datePickerEl.querySelector(DATE_PICKER_STATUS);
  const firstYearChunkEl = datePickerEl.querySelector(CALENDAR_YEAR);
  const inputDate = parseDateString(externalInputEl.value, DEFAULT_EXTERNAL_DATE_FORMAT, true);
  const selectedDate = parseDateString(internalInputEl.value);
  const calendarDate = parseDateString(calendarEl.dataset.value);
  const minDate = parseDateString(datePickerEl.dataset.minDate);
  const maxDate = parseDateString(datePickerEl.dataset.maxDate);
  const rangeDate = parseDateString(datePickerEl.dataset.rangeDate);
  const defaultDate = parseDateString(datePickerEl.dataset.defaultDate);
  if (minDate && maxDate && minDate > maxDate) {
    throw new Error("Minimum date cannot be after maximum date");
  }
  return {
    calendarDate,
    minDate,
    toggleBtnEl,
    selectedDate,
    maxDate,
    firstYearChunkEl,
    datePickerEl,
    inputDate,
    internalInputEl,
    externalInputEl,
    calendarEl,
    rangeDate,
    defaultDate,
    statusEl
  };
};

/**
 * Disable the date picker component
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const disable = el => {
  const {
    externalInputEl,
    toggleBtnEl
  } = getDatePickerContext(el);
  toggleBtnEl.disabled = true;
  externalInputEl.disabled = true;
};

/**
 * Add the readonly attribute to input element and the aria-disabled attribute to the toggle calendar button and external input elements.
 *
 * @param {HTMLElement} el - The date picker element
 */
const ariaDisable = el => {
  const {
    externalInputEl,
    toggleBtnEl
  } = getDatePickerContext(el);
  toggleBtnEl.setAttribute("aria-disabled", true);
  externalInputEl.setAttribute("aria-disabled", true);
  externalInputEl.setAttribute("readonly", "");
};

/**
 * Enable the date picker component
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const enable = el => {
  const {
    externalInputEl,
    toggleBtnEl
  } = getDatePickerContext(el);
  toggleBtnEl.disabled = false;
  toggleBtnEl.removeAttribute("aria-disabled");
  externalInputEl.disabled = false;
  externalInputEl.removeAttribute("aria-disabled");
  externalInputEl.removeAttribute("readonly");
};

// #region Validation

/**
 * Validate the value in the input as a valid date of format M/D/YYYY
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const isDateInputInvalid = el => {
  const {
    externalInputEl,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const dateString = externalInputEl.value;
  let isInvalid = false;
  if (dateString) {
    isInvalid = true;
    const dateStringParts = dateString.split("/");
    const [month, day, year] = dateStringParts.map(str => {
      let value;
      const parsed = parseInt(str, 10);
      if (!Number.isNaN(parsed)) value = parsed;
      return value;
    });
    if (month && day && year != null) {
      const checkDate = setDate(year, month - 1, day);
      if (checkDate.getMonth() === month - 1 && checkDate.getDate() === day && checkDate.getFullYear() === year && dateStringParts[2].length === 4 && isDateWithinMinAndMax(checkDate, minDate, maxDate)) {
        isInvalid = false;
      }
    }
  }
  return isInvalid;
};

/**
 * Validate the value in the input as a valid date of format M/D/YYYY
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const validateDateInput = el => {
  const {
    externalInputEl
  } = getDatePickerContext(el);
  const isInvalid = isDateInputInvalid(externalInputEl);
  if (isInvalid && !externalInputEl.validationMessage) {
    externalInputEl.setCustomValidity(VALIDATION_MESSAGE);
  }
  if (!isInvalid && externalInputEl.validationMessage === VALIDATION_MESSAGE) {
    externalInputEl.setCustomValidity("");
  }
};

// #endregion Validation

/**
 * Enable the date picker component
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const reconcileInputValues = el => {
  const {
    internalInputEl,
    inputDate
  } = getDatePickerContext(el);
  let newValue = "";
  if (inputDate && !isDateInputInvalid(el)) {
    newValue = formatDate(inputDate);
  }
  if (internalInputEl.value !== newValue) {
    changeElementValue(internalInputEl, newValue);
  }
};

/**
 * Select the value of the date picker inputs.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 * @param {string} dateString The date string to update in YYYY-MM-DD format
 */
const setCalendarValue = (el, dateString) => {
  const parsedDate = parseDateString(dateString);
  if (parsedDate) {
    const formattedDate = formatDate(parsedDate, DEFAULT_EXTERNAL_DATE_FORMAT);
    const {
      datePickerEl,
      internalInputEl,
      externalInputEl
    } = getDatePickerContext(el);
    changeElementValue(internalInputEl, dateString);
    changeElementValue(externalInputEl, formattedDate);
    validateDateInput(datePickerEl);
  }
};

/**
 * Enhance an input with the date picker elements
 *
 * @param {HTMLElement} el The initial wrapping element of the date picker component
 */
const enhanceDatePicker = el => {
  const datePickerEl = el.closest(DATE_PICKER);
  const {
    defaultValue
  } = datePickerEl.dataset;
  const internalInputEl = datePickerEl.querySelector(`input`);
  if (!internalInputEl) {
    throw new Error(`${DATE_PICKER} is missing inner input`);
  }
  if (internalInputEl.value) {
    internalInputEl.value = "";
  }
  const minDate = parseDateString(datePickerEl.dataset.minDate || internalInputEl.getAttribute("min"));
  datePickerEl.dataset.minDate = minDate ? formatDate(minDate) : DEFAULT_MIN_DATE;
  const maxDate = parseDateString(datePickerEl.dataset.maxDate || internalInputEl.getAttribute("max"));
  if (maxDate) {
    datePickerEl.dataset.maxDate = formatDate(maxDate);
  }
  const calendarWrapper = document.createElement("div");
  calendarWrapper.classList.add(DATE_PICKER_WRAPPER_CLASS);
  const externalInputEl = internalInputEl.cloneNode();
  externalInputEl.classList.add(DATE_PICKER_EXTERNAL_INPUT_CLASS);
  externalInputEl.type = "text";
  calendarWrapper.appendChild(externalInputEl);
  calendarWrapper.insertAdjacentHTML("beforeend", Sanitizer.escapeHTML`
    <button type="button" class="${DATE_PICKER_BUTTON_CLASS}" aria-haspopup="true" aria-label="Toggle calendar"></button>
    <div class="${DATE_PICKER_CALENDAR_CLASS}" role="application" hidden></div>
    <div class="usa-sr-only ${DATE_PICKER_STATUS_CLASS}" role="status" aria-live="polite"></div>`);
  internalInputEl.setAttribute("aria-hidden", "true");
  internalInputEl.setAttribute("tabindex", "-1");
  internalInputEl.style.display = "none";
  internalInputEl.classList.add(DATE_PICKER_INTERNAL_INPUT_CLASS);
  internalInputEl.removeAttribute("id");
  internalInputEl.removeAttribute("name");
  internalInputEl.required = false;
  datePickerEl.appendChild(calendarWrapper);
  datePickerEl.classList.add(DATE_PICKER_INITIALIZED_CLASS);
  if (defaultValue) {
    setCalendarValue(datePickerEl, defaultValue);
  }
  if (internalInputEl.disabled) {
    disable(datePickerEl);
    internalInputEl.disabled = false;
  }
  if (internalInputEl.hasAttribute("aria-disabled")) {
    ariaDisable(datePickerEl);
    internalInputEl.removeAttribute("aria-disabled");
  }
};

// #region Calendar - Date Selection View

/**
 * render the calendar.
 *
 * @param {HTMLElement} el An element within the date picker component
 * @param {Date} _dateToDisplay a date to render on the calendar
 * @returns {HTMLElement} a reference to the new calendar element
 */
const renderCalendar = (el, _dateToDisplay) => {
  const {
    datePickerEl,
    calendarEl,
    statusEl,
    selectedDate,
    maxDate,
    minDate,
    rangeDate
  } = getDatePickerContext(el);
  const todaysDate = today();
  let dateToDisplay = _dateToDisplay || todaysDate;
  const calendarWasHidden = calendarEl.hidden;
  const focusedDate = addDays(dateToDisplay, 0);
  const focusedMonth = dateToDisplay.getMonth();
  const focusedYear = dateToDisplay.getFullYear();
  const prevMonth = subMonths(dateToDisplay, 1);
  const nextMonth = addMonths(dateToDisplay, 1);
  const currentFormattedDate = formatDate(dateToDisplay);
  const firstOfMonth = startOfMonth(dateToDisplay);
  const prevButtonsDisabled = isSameMonth(dateToDisplay, minDate);
  const nextButtonsDisabled = isSameMonth(dateToDisplay, maxDate);
  const {
    rangeStartDate,
    rangeEndDate,
    withinRangeStartDate,
    withinRangeEndDate
  } = setRangeDates(selectedDate || dateToDisplay, rangeDate);
  const monthLabel = MONTH_LABELS[focusedMonth];
  const generateDateHtml = dateToRender => {
    const classes = [CALENDAR_DATE_CLASS];
    const day = dateToRender.getDate();
    const month = dateToRender.getMonth();
    const year = dateToRender.getFullYear();
    const dayOfWeek = dateToRender.getDay();
    const formattedDate = formatDate(dateToRender);
    let tabindex = "-1";
    const isDisabled = !isDateWithinMinAndMax(dateToRender, minDate, maxDate);
    const isSelected = isSameDay(dateToRender, selectedDate);
    if (isSameMonth(dateToRender, prevMonth)) {
      classes.push(CALENDAR_DATE_PREVIOUS_MONTH_CLASS);
    }
    if (isSameMonth(dateToRender, focusedDate)) {
      classes.push(CALENDAR_DATE_CURRENT_MONTH_CLASS);
    }
    if (isSameMonth(dateToRender, nextMonth)) {
      classes.push(CALENDAR_DATE_NEXT_MONTH_CLASS);
    }
    if (isSelected) {
      classes.push(CALENDAR_DATE_SELECTED_CLASS);
    }
    if (isSameDay(dateToRender, todaysDate)) {
      classes.push(CALENDAR_DATE_TODAY_CLASS);
    }
    if (rangeDate) {
      if (isSameDay(dateToRender, rangeDate)) {
        classes.push(CALENDAR_DATE_RANGE_DATE_CLASS);
      }
      if (isSameDay(dateToRender, rangeStartDate)) {
        classes.push(CALENDAR_DATE_RANGE_DATE_START_CLASS);
      }
      if (isSameDay(dateToRender, rangeEndDate)) {
        classes.push(CALENDAR_DATE_RANGE_DATE_END_CLASS);
      }
      if (isDateWithinMinAndMax(dateToRender, withinRangeStartDate, withinRangeEndDate)) {
        classes.push(CALENDAR_DATE_WITHIN_RANGE_CLASS);
      }
    }
    if (isSameDay(dateToRender, focusedDate)) {
      tabindex = "0";
      classes.push(CALENDAR_DATE_FOCUSED_CLASS);
    }
    const monthStr = MONTH_LABELS[month];
    const dayStr = DAY_OF_WEEK_LABELS[dayOfWeek];
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("tabindex", tabindex);
    btn.setAttribute("class", classes.join(" "));
    btn.setAttribute("data-day", day);
    btn.setAttribute("data-month", month + 1);
    btn.setAttribute("data-year", year);
    btn.setAttribute("data-value", formattedDate);
    btn.setAttribute("aria-label", Sanitizer.escapeHTML`${day} ${monthStr} ${year} ${dayStr}`);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");
    if (isDisabled === true) {
      btn.disabled = true;
    }
    btn.textContent = day;
    return btn;
  };

  // set date to first rendered day
  dateToDisplay = startOfWeek(firstOfMonth);
  const days = [];
  while (days.length < 28 || dateToDisplay.getMonth() === focusedMonth || days.length % 7 !== 0) {
    days.push(generateDateHtml(dateToDisplay));
    dateToDisplay = addDays(dateToDisplay, 1);
  }
  const datesGrid = listToGridHtml(days, 7);
  const newCalendar = calendarEl.cloneNode();
  newCalendar.dataset.value = currentFormattedDate;
  newCalendar.style.top = `${datePickerEl.offsetHeight}px`;
  newCalendar.hidden = false;
  newCalendar.innerHTML = Sanitizer.escapeHTML`
    <div tabindex="-1" class="${CALENDAR_DATE_PICKER_CLASS}">
      <div class="${CALENDAR_ROW_CLASS}">
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_PREVIOUS_YEAR_CLASS}"
            aria-label="Navigate back one year"
            ${prevButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_PREVIOUS_MONTH_CLASS}"
            aria-label="Navigate back one month"
            ${prevButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_MONTH_LABEL_CLASS}">
          <button
            type="button"
            class="${CALENDAR_MONTH_SELECTION_CLASS}" aria-label="${monthLabel}. Select month"
          >${monthLabel}</button>
          <button
            type="button"
            class="${CALENDAR_YEAR_SELECTION_CLASS}" aria-label="${focusedYear}. Select year"
          >${focusedYear}</button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_NEXT_MONTH_CLASS}"
            aria-label="Navigate forward one month"
            ${nextButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
        <div class="${CALENDAR_CELL_CLASS} ${CALENDAR_CELL_CENTER_ITEMS_CLASS}">
          <button
            type="button"
            class="${CALENDAR_NEXT_YEAR_CLASS}"
            aria-label="Navigate forward one year"
            ${nextButtonsDisabled ? `disabled="disabled"` : ""}
          ></button>
        </div>
      </div>
    </div>
    `;
  const table = document.createElement("table");
  table.setAttribute("class", CALENDAR_TABLE_CLASS);
  const tableHead = document.createElement("thead");
  table.insertAdjacentElement("beforeend", tableHead);
  const tableHeadRow = document.createElement("tr");
  tableHead.insertAdjacentElement("beforeend", tableHeadRow);
  const daysOfWeek = {
    Sunday: "S",
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "Th",
    Friday: "Fr",
    Saturday: "S"
  };
  Object.keys(daysOfWeek).forEach(key => {
    const th = document.createElement("th");
    th.setAttribute("class", CALENDAR_DAY_OF_WEEK_CLASS);
    th.setAttribute("scope", "col");
    th.setAttribute("aria-label", key);
    th.textContent = daysOfWeek[key];
    tableHeadRow.insertAdjacentElement("beforeend", th);
  });
  const tableBody = createTableBody(datesGrid);
  table.insertAdjacentElement("beforeend", tableBody);

  // Container for Years, Months, and Days
  const datePickerCalendarContainer = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  datePickerCalendarContainer.insertAdjacentElement("beforeend", table);
  calendarEl.parentNode.replaceChild(newCalendar, calendarEl);
  datePickerEl.classList.add(DATE_PICKER_ACTIVE_CLASS);
  const statuses = [];
  if (isSameDay(selectedDate, focusedDate)) {
    statuses.push("Selected date");
  }
  if (calendarWasHidden) {
    statuses.push("You can navigate by day using left and right arrows", "Weeks by using up and down arrows", "Months by using page up and page down keys", "Years by using shift plus page up and shift plus page down", "Home and end keys navigate to the beginning and end of a week");
    statusEl.textContent = "";
  } else {
    statuses.push(`${monthLabel} ${focusedYear}`);
  }
  statusEl.textContent = statuses.join(". ");
  return newCalendar;
};

/**
 * Navigate back one year and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */
const displayPreviousYear = _buttonEl => {
  if (_buttonEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(_buttonEl);
  let date = subYears(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_YEAR);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Navigate back one month and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */
const displayPreviousMonth = _buttonEl => {
  if (_buttonEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(_buttonEl);
  let date = subMonths(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_MONTH);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Navigate forward one month and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */
const displayNextMonth = _buttonEl => {
  if (_buttonEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(_buttonEl);
  let date = addMonths(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_MONTH);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Navigate forward one year and display the calendar.
 *
 * @param {HTMLButtonElement} _buttonEl An element within the date picker component
 */
const displayNextYear = _buttonEl => {
  if (_buttonEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(_buttonEl);
  let date = addYears(calendarDate, 1);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_YEAR);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_DATE_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Hide the calendar of a date picker component.
 *
 * @param {HTMLElement} el An element within the date picker component
 */
const hideCalendar = el => {
  const {
    datePickerEl,
    calendarEl,
    statusEl
  } = getDatePickerContext(el);
  datePickerEl.classList.remove(DATE_PICKER_ACTIVE_CLASS);
  calendarEl.hidden = true;
  statusEl.textContent = "";
};

/**
 * Select a date within the date picker component.
 *
 * @param {HTMLButtonElement} calendarDateEl A date element within the date picker component
 */
const selectDate = calendarDateEl => {
  if (calendarDateEl.disabled) return;
  const {
    datePickerEl,
    externalInputEl
  } = getDatePickerContext(calendarDateEl);
  setCalendarValue(calendarDateEl, calendarDateEl.dataset.value);
  hideCalendar(datePickerEl);
  externalInputEl.focus();
};

/**
 * Toggle the calendar.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 */
const toggleCalendar = el => {
  if (el.disabled || el.hasAttribute("aria-disabled")) return;
  const {
    calendarEl,
    inputDate,
    minDate,
    maxDate,
    defaultDate
  } = getDatePickerContext(el);
  if (calendarEl.hidden) {
    const dateToDisplay = keepDateBetweenMinAndMax(inputDate || defaultDate || today(), minDate, maxDate);
    const newCalendar = renderCalendar(calendarEl, dateToDisplay);
    newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
  } else {
    hideCalendar(el);
  }
};

/**
 * Update the calendar when visible.
 *
 * @param {HTMLElement} el an element within the date picker
 */
const updateCalendarIfVisible = el => {
  const {
    calendarEl,
    inputDate,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const calendarShown = !calendarEl.hidden;
  if (calendarShown && inputDate) {
    const dateToDisplay = keepDateBetweenMinAndMax(inputDate, minDate, maxDate);
    renderCalendar(calendarEl, dateToDisplay);
  }
};

// #endregion Calendar - Date Selection View

// #region Calendar - Month Selection View
/**
 * Display the month selection screen in the date picker.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 * @returns {HTMLElement} a reference to the new calendar element
 */
const displayMonthSelection = (el, monthToDisplay) => {
  const {
    calendarEl,
    statusEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const selectedMonth = calendarDate.getMonth();
  const focusedMonth = monthToDisplay == null ? selectedMonth : monthToDisplay;
  const months = MONTH_LABELS.map((month, index) => {
    const monthToCheck = setMonth(calendarDate, index);
    const isDisabled = isDatesMonthOutsideMinOrMax(monthToCheck, minDate, maxDate);
    let tabindex = "-1";
    const classes = [CALENDAR_MONTH_CLASS];
    const isSelected = index === selectedMonth;
    if (index === focusedMonth) {
      tabindex = "0";
      classes.push(CALENDAR_MONTH_FOCUSED_CLASS);
    }
    if (isSelected) {
      classes.push(CALENDAR_MONTH_SELECTED_CLASS);
    }
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("tabindex", tabindex);
    btn.setAttribute("class", classes.join(" "));
    btn.setAttribute("data-value", index);
    btn.setAttribute("data-label", month);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");
    if (isDisabled === true) {
      btn.disabled = true;
    }
    btn.textContent = month;
    return btn;
  });
  const monthsHtml = document.createElement("div");
  monthsHtml.setAttribute("tabindex", "-1");
  monthsHtml.setAttribute("class", CALENDAR_MONTH_PICKER_CLASS);
  const table = document.createElement("table");
  table.setAttribute("class", CALENDAR_TABLE_CLASS);
  table.setAttribute("role", "presentation");
  const monthsGrid = listToGridHtml(months, 3);
  const tableBody = createTableBody(monthsGrid);
  table.insertAdjacentElement("beforeend", tableBody);
  monthsHtml.insertAdjacentElement("beforeend", table);
  const newCalendar = calendarEl.cloneNode();
  newCalendar.insertAdjacentElement("beforeend", monthsHtml);
  calendarEl.parentNode.replaceChild(newCalendar, calendarEl);
  statusEl.textContent = "Select a month.";
  return newCalendar;
};

/**
 * Select a month in the date picker component.
 *
 * @param {HTMLButtonElement} monthEl An month element within the date picker component
 */
const selectMonth = monthEl => {
  if (monthEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(monthEl);
  const selectedMonth = parseInt(monthEl.dataset.value, 10);
  let date = setMonth(calendarDate, selectedMonth);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
};

// #endregion Calendar - Month Selection View

// #region Calendar - Year Selection View

/**
 * Display the year selection screen in the date picker.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 * @param {number} yearToDisplay year to display in year selection
 * @returns {HTMLElement} a reference to the new calendar element
 */
const displayYearSelection = (el, yearToDisplay) => {
  const {
    calendarEl,
    statusEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const selectedYear = calendarDate.getFullYear();
  const focusedYear = yearToDisplay == null ? selectedYear : yearToDisplay;
  let yearToChunk = focusedYear;
  yearToChunk -= yearToChunk % YEAR_CHUNK;
  yearToChunk = Math.max(0, yearToChunk);
  const prevYearChunkDisabled = isDatesYearOutsideMinOrMax(setYear(calendarDate, yearToChunk - 1), minDate, maxDate);
  const nextYearChunkDisabled = isDatesYearOutsideMinOrMax(setYear(calendarDate, yearToChunk + YEAR_CHUNK), minDate, maxDate);
  const years = [];
  let yearIndex = yearToChunk;
  while (years.length < YEAR_CHUNK) {
    const isDisabled = isDatesYearOutsideMinOrMax(setYear(calendarDate, yearIndex), minDate, maxDate);
    let tabindex = "-1";
    const classes = [CALENDAR_YEAR_CLASS];
    const isSelected = yearIndex === selectedYear;
    if (yearIndex === focusedYear) {
      tabindex = "0";
      classes.push(CALENDAR_YEAR_FOCUSED_CLASS);
    }
    if (isSelected) {
      classes.push(CALENDAR_YEAR_SELECTED_CLASS);
    }
    const btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.setAttribute("tabindex", tabindex);
    btn.setAttribute("class", classes.join(" "));
    btn.setAttribute("data-value", yearIndex);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");
    if (isDisabled === true) {
      btn.disabled = true;
    }
    btn.textContent = yearIndex;
    years.push(btn);
    yearIndex += 1;
  }
  const newCalendar = calendarEl.cloneNode();

  // create the years calendar wrapper
  const yearsCalendarWrapper = document.createElement("div");
  yearsCalendarWrapper.setAttribute("tabindex", "-1");
  yearsCalendarWrapper.setAttribute("class", CALENDAR_YEAR_PICKER_CLASS);

  // create table parent
  const yearsTableParent = document.createElement("table");
  yearsTableParent.setAttribute("class", CALENDAR_TABLE_CLASS);

  // create table body and table row
  const yearsHTMLTableBody = document.createElement("tbody");
  const yearsHTMLTableBodyRow = document.createElement("tr");

  // create previous button
  const previousYearsBtn = document.createElement("button");
  previousYearsBtn.setAttribute("type", "button");
  previousYearsBtn.setAttribute("class", CALENDAR_PREVIOUS_YEAR_CHUNK_CLASS);
  previousYearsBtn.setAttribute("aria-label", `Navigate back ${YEAR_CHUNK} years`);
  if (prevYearChunkDisabled === true) {
    previousYearsBtn.disabled = true;
  }
  previousYearsBtn.innerHTML = Sanitizer.escapeHTML`&nbsp`;

  // create next button
  const nextYearsBtn = document.createElement("button");
  nextYearsBtn.setAttribute("type", "button");
  nextYearsBtn.setAttribute("class", CALENDAR_NEXT_YEAR_CHUNK_CLASS);
  nextYearsBtn.setAttribute("aria-label", `Navigate forward ${YEAR_CHUNK} years`);
  if (nextYearChunkDisabled === true) {
    nextYearsBtn.disabled = true;
  }
  nextYearsBtn.innerHTML = Sanitizer.escapeHTML`&nbsp`;

  // create the actual years table
  const yearsTable = document.createElement("table");
  yearsTable.setAttribute("class", CALENDAR_TABLE_CLASS);
  yearsTable.setAttribute("role", "presentation");

  // create the years child table
  const yearsGrid = listToGridHtml(years, 3);
  const yearsTableBody = createTableBody(yearsGrid);

  // append the grid to the years child table
  yearsTable.insertAdjacentElement("beforeend", yearsTableBody);

  // create the prev button td and append the prev button
  const yearsHTMLTableBodyDetailPrev = document.createElement("td");
  yearsHTMLTableBodyDetailPrev.insertAdjacentElement("beforeend", previousYearsBtn);

  // create the years td and append the years child table
  const yearsHTMLTableBodyYearsDetail = document.createElement("td");
  yearsHTMLTableBodyYearsDetail.setAttribute("colspan", "3");
  yearsHTMLTableBodyYearsDetail.insertAdjacentElement("beforeend", yearsTable);

  // create the next button td and append the next button
  const yearsHTMLTableBodyDetailNext = document.createElement("td");
  yearsHTMLTableBodyDetailNext.insertAdjacentElement("beforeend", nextYearsBtn);

  // append the three td to the years child table row
  yearsHTMLTableBodyRow.insertAdjacentElement("beforeend", yearsHTMLTableBodyDetailPrev);
  yearsHTMLTableBodyRow.insertAdjacentElement("beforeend", yearsHTMLTableBodyYearsDetail);
  yearsHTMLTableBodyRow.insertAdjacentElement("beforeend", yearsHTMLTableBodyDetailNext);

  // append the table row to the years child table body
  yearsHTMLTableBody.insertAdjacentElement("beforeend", yearsHTMLTableBodyRow);

  // append the years table body to the years parent table
  yearsTableParent.insertAdjacentElement("beforeend", yearsHTMLTableBody);

  // append the parent table to the calendar wrapper
  yearsCalendarWrapper.insertAdjacentElement("beforeend", yearsTableParent);

  // append the years calender to the new calendar
  newCalendar.insertAdjacentElement("beforeend", yearsCalendarWrapper);

  // replace calendar
  calendarEl.parentNode.replaceChild(newCalendar, calendarEl);
  statusEl.textContent = Sanitizer.escapeHTML`Showing years ${yearToChunk} to ${yearToChunk + YEAR_CHUNK - 1}. Select a year.`;
  return newCalendar;
};

/**
 * Navigate back by years and display the year selection screen.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 */
const displayPreviousYearChunk = el => {
  if (el.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const yearEl = calendarEl.querySelector(CALENDAR_YEAR_FOCUSED);
  const selectedYear = parseInt(yearEl.textContent, 10);
  let adjustedYear = selectedYear - YEAR_CHUNK;
  adjustedYear = Math.max(0, adjustedYear);
  const date = setYear(calendarDate, adjustedYear);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = displayYearSelection(calendarEl, cappedDate.getFullYear());
  let nextToFocus = newCalendar.querySelector(CALENDAR_PREVIOUS_YEAR_CHUNK);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_YEAR_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Navigate forward by years and display the year selection screen.
 *
 * @param {HTMLButtonElement} el An element within the date picker component
 */
const displayNextYearChunk = el => {
  if (el.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(el);
  const yearEl = calendarEl.querySelector(CALENDAR_YEAR_FOCUSED);
  const selectedYear = parseInt(yearEl.textContent, 10);
  let adjustedYear = selectedYear + YEAR_CHUNK;
  adjustedYear = Math.max(0, adjustedYear);
  const date = setYear(calendarDate, adjustedYear);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = displayYearSelection(calendarEl, cappedDate.getFullYear());
  let nextToFocus = newCalendar.querySelector(CALENDAR_NEXT_YEAR_CHUNK);
  if (nextToFocus.disabled) {
    nextToFocus = newCalendar.querySelector(CALENDAR_YEAR_PICKER);
  }
  nextToFocus.focus();
};

/**
 * Select a year in the date picker component.
 *
 * @param {HTMLButtonElement} yearEl A year element within the date picker component
 */
const selectYear = yearEl => {
  if (yearEl.disabled) return;
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(yearEl);
  const selectedYear = parseInt(yearEl.innerHTML, 10);
  let date = setYear(calendarDate, selectedYear);
  date = keepDateBetweenMinAndMax(date, minDate, maxDate);
  const newCalendar = renderCalendar(calendarEl, date);
  newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
};

// #endregion Calendar - Year Selection View

// #region Calendar Event Handling

/**
 * Hide the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleEscapeFromCalendar = event => {
  const {
    datePickerEl,
    externalInputEl
  } = getDatePickerContext(event.target);
  hideCalendar(datePickerEl);
  externalInputEl.focus();
  event.preventDefault();
};

// #endregion Calendar Event Handling

// #region Calendar Date Event Handling

/**
 * Adjust the date and display the calendar if needed.
 *
 * @param {function} adjustDateFn function that returns the adjusted date
 */
const adjustCalendar = adjustDateFn => event => {
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(event.target);
  const date = adjustDateFn(calendarDate);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  if (!isSameDay(calendarDate, cappedDate)) {
    const newCalendar = renderCalendar(calendarEl, cappedDate);
    newCalendar.querySelector(CALENDAR_DATE_FOCUSED).focus();
  }
  event.preventDefault();
};

/**
 * Navigate back one week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleUpFromDate = adjustCalendar(date => subWeeks(date, 1));

/**
 * Navigate forward one week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleDownFromDate = adjustCalendar(date => addWeeks(date, 1));

/**
 * Navigate back one day and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleLeftFromDate = adjustCalendar(date => subDays(date, 1));

/**
 * Navigate forward one day and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleRightFromDate = adjustCalendar(date => addDays(date, 1));

/**
 * Navigate to the start of the week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleHomeFromDate = adjustCalendar(date => startOfWeek(date));

/**
 * Navigate to the end of the week and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleEndFromDate = adjustCalendar(date => endOfWeek(date));

/**
 * Navigate forward one month and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageDownFromDate = adjustCalendar(date => addMonths(date, 1));

/**
 * Navigate back one month and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageUpFromDate = adjustCalendar(date => subMonths(date, 1));

/**
 * Navigate forward one year and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleShiftPageDownFromDate = adjustCalendar(date => addYears(date, 1));

/**
 * Navigate back one year and display the calendar.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleShiftPageUpFromDate = adjustCalendar(date => subYears(date, 1));

/**
 * Set range date classes without re-rendering the calendar. Called when date button is hovered.
 * Returns early if the date hovered is disabled or if there is already a selected date.
 *
 * @param {HTMLElement} dateEl - Calendar date button within the date picker component.
 */

const handleMouseoverFromDate = dateEl => {
  if (dateEl.disabled) return;
  const hoverDate = parseDateString(dateEl.dataset.value);
  const {
    calendarEl,
    selectedDate,
    rangeDate
  } = getDatePickerContext(dateEl);
  if (selectedDate) return;
  const {
    withinRangeStartDate,
    withinRangeEndDate
  } = setRangeDates(hoverDate, rangeDate);
  const dateButtons = calendarEl.querySelectorAll(`.${CALENDAR_DATE_CURRENT_MONTH_CLASS}`);
  dateButtons.forEach(button => {
    const buttonDate = parseDateString(button.dataset.value);
    if (isDateWithinMinAndMax(buttonDate, withinRangeStartDate, withinRangeEndDate)) {
      button.classList.add(CALENDAR_DATE_WITHIN_RANGE_CLASS);
    } else {
      button.classList.remove(CALENDAR_DATE_WITHIN_RANGE_CLASS);
    }
  });
};

// #endregion Calendar Date Event Handling

// #region Calendar Month Event Handling

/**
 * Adjust the month and display the month selection screen if needed.
 *
 * @param {function} adjustMonthFn function that returns the adjusted month
 */
const adjustMonthSelectionScreen = adjustMonthFn => event => {
  const monthEl = event.target;
  const selectedMonth = parseInt(monthEl.dataset.value, 10);
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(monthEl);
  const currentDate = setMonth(calendarDate, selectedMonth);
  let adjustedMonth = adjustMonthFn(selectedMonth);
  adjustedMonth = Math.max(0, Math.min(11, adjustedMonth));
  const date = setMonth(calendarDate, adjustedMonth);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  if (!isSameMonth(currentDate, cappedDate)) {
    const newCalendar = displayMonthSelection(calendarEl, cappedDate.getMonth());
    newCalendar.querySelector(CALENDAR_MONTH_FOCUSED).focus();
  }
  event.preventDefault();
};

/**
 * Navigate back three months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleUpFromMonth = adjustMonthSelectionScreen(month => month - 3);

/**
 * Navigate forward three months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleDownFromMonth = adjustMonthSelectionScreen(month => month + 3);

/**
 * Navigate back one month and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleLeftFromMonth = adjustMonthSelectionScreen(month => month - 1);

/**
 * Navigate forward one month and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleRightFromMonth = adjustMonthSelectionScreen(month => month + 1);

/**
 * Navigate to the start of the row of months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleHomeFromMonth = adjustMonthSelectionScreen(month => month - month % 3);

/**
 * Navigate to the end of the row of months and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleEndFromMonth = adjustMonthSelectionScreen(month => month + 2 - month % 3);

/**
 * Navigate to the last month (December) and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageDownFromMonth = adjustMonthSelectionScreen(() => 11);

/**
 * Navigate to the first month (January) and display the month selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageUpFromMonth = adjustMonthSelectionScreen(() => 0);

// #endregion Calendar Month Event Handling

// #region Calendar Year Event Handling

/**
 * Adjust the year and display the year selection screen if needed.
 *
 * @param {function} adjustYearFn function that returns the adjusted year
 */
const adjustYearSelectionScreen = adjustYearFn => event => {
  const yearEl = event.target;
  const selectedYear = parseInt(yearEl.dataset.value, 10);
  const {
    calendarEl,
    calendarDate,
    minDate,
    maxDate
  } = getDatePickerContext(yearEl);
  const currentDate = setYear(calendarDate, selectedYear);
  let adjustedYear = adjustYearFn(selectedYear);
  adjustedYear = Math.max(0, adjustedYear);
  const date = setYear(calendarDate, adjustedYear);
  const cappedDate = keepDateBetweenMinAndMax(date, minDate, maxDate);
  if (!isSameYear(currentDate, cappedDate)) {
    const newCalendar = displayYearSelection(calendarEl, cappedDate.getFullYear());
    newCalendar.querySelector(CALENDAR_YEAR_FOCUSED).focus();
  }
  event.preventDefault();
};

/**
 * Navigate back three years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleUpFromYear = adjustYearSelectionScreen(year => year - 3);

/**
 * Navigate forward three years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleDownFromYear = adjustYearSelectionScreen(year => year + 3);

/**
 * Navigate back one year and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleLeftFromYear = adjustYearSelectionScreen(year => year - 1);

/**
 * Navigate forward one year and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleRightFromYear = adjustYearSelectionScreen(year => year + 1);

/**
 * Navigate to the start of the row of years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleHomeFromYear = adjustYearSelectionScreen(year => year - year % 3);

/**
 * Navigate to the end of the row of years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handleEndFromYear = adjustYearSelectionScreen(year => year + 2 - year % 3);

/**
 * Navigate to back 12 years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageUpFromYear = adjustYearSelectionScreen(year => year - YEAR_CHUNK);

/**
 * Navigate forward 12 years and display the year selection screen.
 *
 * @param {KeyboardEvent} event the keydown event
 */
const handlePageDownFromYear = adjustYearSelectionScreen(year => year + YEAR_CHUNK);

// #endregion Calendar Year Event Handling

// #region Focus Handling Event Handling

const tabHandler = focusable => {
  const getFocusableContext = el => {
    const {
      calendarEl
    } = getDatePickerContext(el);
    const focusableElements = select(focusable, calendarEl);
    const firstTabIndex = 0;
    const lastTabIndex = focusableElements.length - 1;
    const firstTabStop = focusableElements[firstTabIndex];
    const lastTabStop = focusableElements[lastTabIndex];
    const focusIndex = focusableElements.indexOf(activeElement());
    const isLastTab = focusIndex === lastTabIndex;
    const isFirstTab = focusIndex === firstTabIndex;
    const isNotFound = focusIndex === -1;
    return {
      focusableElements,
      isNotFound,
      firstTabStop,
      isFirstTab,
      lastTabStop,
      isLastTab
    };
  };
  return {
    tabAhead(event) {
      const {
        firstTabStop,
        isLastTab,
        isNotFound
      } = getFocusableContext(event.target);
      if (isLastTab || isNotFound) {
        event.preventDefault();
        firstTabStop.focus();
      }
    },
    tabBack(event) {
      const {
        lastTabStop,
        isFirstTab,
        isNotFound
      } = getFocusableContext(event.target);
      if (isFirstTab || isNotFound) {
        event.preventDefault();
        lastTabStop.focus();
      }
    }
  };
};
const datePickerTabEventHandler = tabHandler(DATE_PICKER_FOCUSABLE);
const monthPickerTabEventHandler = tabHandler(MONTH_PICKER_FOCUSABLE);
const yearPickerTabEventHandler = tabHandler(YEAR_PICKER_FOCUSABLE);

// #endregion Focus Handling Event Handling

// #region Date Picker Event Delegation Registration / Component

const datePickerEvents = {
  [CLICK]: {
    [DATE_PICKER_BUTTON]() {
      toggleCalendar(this);
    },
    [CALENDAR_DATE]() {
      selectDate(this);
    },
    [CALENDAR_MONTH]() {
      selectMonth(this);
    },
    [CALENDAR_YEAR]() {
      selectYear(this);
    },
    [CALENDAR_PREVIOUS_MONTH]() {
      displayPreviousMonth(this);
    },
    [CALENDAR_NEXT_MONTH]() {
      displayNextMonth(this);
    },
    [CALENDAR_PREVIOUS_YEAR]() {
      displayPreviousYear(this);
    },
    [CALENDAR_NEXT_YEAR]() {
      displayNextYear(this);
    },
    [CALENDAR_PREVIOUS_YEAR_CHUNK]() {
      displayPreviousYearChunk(this);
    },
    [CALENDAR_NEXT_YEAR_CHUNK]() {
      displayNextYearChunk(this);
    },
    [CALENDAR_MONTH_SELECTION]() {
      const newCalendar = displayMonthSelection(this);
      newCalendar.querySelector(CALENDAR_MONTH_FOCUSED).focus();
    },
    [CALENDAR_YEAR_SELECTION]() {
      const newCalendar = displayYearSelection(this);
      newCalendar.querySelector(CALENDAR_YEAR_FOCUSED).focus();
    }
  },
  keyup: {
    [DATE_PICKER_CALENDAR](event) {
      const keydown = this.dataset.keydownKeyCode;
      if (`${event.keyCode}` !== keydown) {
        event.preventDefault();
      }
    }
  },
  keydown: {
    [DATE_PICKER_EXTERNAL_INPUT](event) {
      if (event.keyCode === ENTER_KEYCODE) {
        validateDateInput(this);
      }
    },
    [CALENDAR_DATE]: keymap({
      Up: handleUpFromDate,
      ArrowUp: handleUpFromDate,
      Down: handleDownFromDate,
      ArrowDown: handleDownFromDate,
      Left: handleLeftFromDate,
      ArrowLeft: handleLeftFromDate,
      Right: handleRightFromDate,
      ArrowRight: handleRightFromDate,
      Home: handleHomeFromDate,
      End: handleEndFromDate,
      PageDown: handlePageDownFromDate,
      PageUp: handlePageUpFromDate,
      "Shift+PageDown": handleShiftPageDownFromDate,
      "Shift+PageUp": handleShiftPageUpFromDate,
      Tab: datePickerTabEventHandler.tabAhead
    }),
    [CALENDAR_DATE_PICKER]: keymap({
      Tab: datePickerTabEventHandler.tabAhead,
      "Shift+Tab": datePickerTabEventHandler.tabBack
    }),
    [CALENDAR_MONTH]: keymap({
      Up: handleUpFromMonth,
      ArrowUp: handleUpFromMonth,
      Down: handleDownFromMonth,
      ArrowDown: handleDownFromMonth,
      Left: handleLeftFromMonth,
      ArrowLeft: handleLeftFromMonth,
      Right: handleRightFromMonth,
      ArrowRight: handleRightFromMonth,
      Home: handleHomeFromMonth,
      End: handleEndFromMonth,
      PageDown: handlePageDownFromMonth,
      PageUp: handlePageUpFromMonth
    }),
    [CALENDAR_MONTH_PICKER]: keymap({
      Tab: monthPickerTabEventHandler.tabAhead,
      "Shift+Tab": monthPickerTabEventHandler.tabBack
    }),
    [CALENDAR_YEAR]: keymap({
      Up: handleUpFromYear,
      ArrowUp: handleUpFromYear,
      Down: handleDownFromYear,
      ArrowDown: handleDownFromYear,
      Left: handleLeftFromYear,
      ArrowLeft: handleLeftFromYear,
      Right: handleRightFromYear,
      ArrowRight: handleRightFromYear,
      Home: handleHomeFromYear,
      End: handleEndFromYear,
      PageDown: handlePageDownFromYear,
      PageUp: handlePageUpFromYear
    }),
    [CALENDAR_YEAR_PICKER]: keymap({
      Tab: yearPickerTabEventHandler.tabAhead,
      "Shift+Tab": yearPickerTabEventHandler.tabBack
    }),
    [DATE_PICKER_CALENDAR](event) {
      this.dataset.keydownKeyCode = event.keyCode;
    },
    [DATE_PICKER](event) {
      const keyMap = keymap({
        Escape: handleEscapeFromCalendar
      });
      keyMap(event);
    }
  },
  focusout: {
    [DATE_PICKER_EXTERNAL_INPUT]() {
      validateDateInput(this);
    },
    [DATE_PICKER](event) {
      if (!this.contains(event.relatedTarget)) {
        hideCalendar(this);
      }
    }
  },
  input: {
    [DATE_PICKER_EXTERNAL_INPUT]() {
      reconcileInputValues(this);
      updateCalendarIfVisible(this);
    }
  }
};
if (!isIosDevice()) {
  datePickerEvents.mouseover = {
    [CALENDAR_DATE_CURRENT_MONTH]() {
      handleMouseoverFromDate(this);
    }
  };
}
const datePicker = behavior(datePickerEvents, {
  init(root) {
    selectOrMatches(DATE_PICKER, root).forEach(datePickerEl => {
      enhanceDatePicker(datePickerEl);
    });
  },
  getDatePickerContext,
  disable,
  ariaDisable,
  enable,
  isDateInputInvalid,
  setCalendarValue,
  validateDateInput,
  renderCalendar,
  updateCalendarIfVisible
});

// #endregion Date Picker Event Delegation Registration / Component

module.exports = datePicker;

},{"../../uswds-core/src/js/config":4,"../../uswds-core/src/js/events":5,"../../uswds-core/src/js/utils/active-element":6,"../../uswds-core/src/js/utils/behavior":7,"../../uswds-core/src/js/utils/is-ios-device":9,"../../uswds-core/src/js/utils/sanitizer":10,"../../uswds-core/src/js/utils/select":13,"../../uswds-core/src/js/utils/select-or-matches":12,"receptor/keymap":23}],3:[function(require,module,exports){
"use strict";

const selectOrMatches = require("../../uswds-core/src/js/utils/select-or-matches");
const FocusTrap = require("../../uswds-core/src/js/utils/focus-trap");
const ScrollBarWidth = require("../../uswds-core/src/js/utils/scrollbar-width");
const behavior = require("../../uswds-core/src/js/utils/behavior");
const {
  prefix: PREFIX
} = require('./../../../../../../uswds/uswds-config.js');
const MODAL_CLASSNAME = `${PREFIX}-modal`;
const OVERLAY_CLASSNAME = `${MODAL_CLASSNAME}-overlay`;
const WRAPPER_CLASSNAME = `${MODAL_CLASSNAME}-wrapper`;
const OPENER_ATTRIBUTE = "data-open-modal";
const CLOSER_ATTRIBUTE = "data-close-modal";
const FORCE_ACTION_ATTRIBUTE = "data-force-action";
const NON_MODAL_HIDDEN_ATTRIBUTE = `data-modal-hidden`;
const MODAL = `.${MODAL_CLASSNAME}`;
const INITIAL_FOCUS = `.${WRAPPER_CLASSNAME} *[data-focus]`;
const CLOSE_BUTTON = `${WRAPPER_CLASSNAME} *[${CLOSER_ATTRIBUTE}]`;
const OPENERS = `*[${OPENER_ATTRIBUTE}][aria-controls]`;
const CLOSERS = `${CLOSE_BUTTON}, .${OVERLAY_CLASSNAME}:not([${FORCE_ACTION_ATTRIBUTE}])`;
const NON_MODALS = `body > *:not(.${WRAPPER_CLASSNAME}):not([aria-hidden])`;
const NON_MODALS_HIDDEN = `[${NON_MODAL_HIDDEN_ATTRIBUTE}]`;
const ACTIVE_CLASS = "usa-js-modal--active";
const PREVENT_CLICK_CLASS = "usa-js-no-click";
const VISIBLE_CLASS = "is-visible";
const HIDDEN_CLASS = "is-hidden";
let modal;
let INITIAL_BODY_PADDING;
let TEMPORARY_BODY_PADDING;
const isActive = () => document.body.classList.contains(ACTIVE_CLASS);
const SCROLLBAR_WIDTH = ScrollBarWidth();

/**
 *  Closes modal when bound to a button and pressed.
 */
const onMenuClose = () => {
  modal.toggleModal.call(modal, false);
};

/**
 * Set the value for temporary body padding that will be applied when the modal is open.
 * Value is created by checking for initial body padding and adding the width of the scrollbar.
 */
const setTemporaryBodyPadding = () => {
  INITIAL_BODY_PADDING = window.getComputedStyle(document.body).getPropertyValue("padding-right");
  TEMPORARY_BODY_PADDING = `${parseInt(INITIAL_BODY_PADDING.replace(/px/, ""), 10) + parseInt(SCROLLBAR_WIDTH.replace(/px/, ""), 10)}px`;
};

/**
 *  Toggle the visibility of a modal window
 *
 * @param {KeyboardEvent} event the keydown event.
 * @returns {boolean} safeActive if mobile is open.
 */
function toggleModal(event) {
  let originalOpener;
  let clickedElement = event.target;
  const {
    body
  } = document;
  const safeActive = !isActive();
  const modalId = clickedElement ? clickedElement.getAttribute("aria-controls") : document.querySelector(`.${WRAPPER_CLASSNAME}.is-visible`);
  const targetModal = safeActive ? document.getElementById(modalId) : document.querySelector(`.${WRAPPER_CLASSNAME}.is-visible`);

  // if there is no modal we return early
  if (!targetModal) {
    return false;
  }
  const openFocusEl = targetModal.querySelector(INITIAL_FOCUS) ? targetModal.querySelector(INITIAL_FOCUS) : targetModal.querySelector(MODAL);
  const returnFocus = document.getElementById(targetModal.getAttribute("data-opener"));
  const menuButton = body.querySelector(OPENERS);
  const forceUserAction = targetModal.getAttribute(FORCE_ACTION_ATTRIBUTE);

  // Sets the clicked element to the close button
  // so esc key always closes modal
  if (event.type === "keydown" && targetModal !== null) {
    clickedElement = targetModal.querySelector(CLOSE_BUTTON);
  }

  // When we're not hitting the escape key…
  if (clickedElement) {
    // Make sure we click the opener
    // If it doesn't have an ID, make one
    // Store id as data attribute on modal
    if (clickedElement.hasAttribute(OPENER_ATTRIBUTE)) {
      if (this.getAttribute("id") === null) {
        originalOpener = `modal-${Math.floor(Math.random() * 900000) + 100000}`;
        this.setAttribute("id", originalOpener);
      } else {
        originalOpener = this.getAttribute("id");
      }
      targetModal.setAttribute("data-opener", originalOpener);
    }

    // This basically stops the propagation if the element
    // is inside the modal and not a close button or
    // element inside a close button
    if (clickedElement.closest(`.${MODAL_CLASSNAME}`)) {
      if (clickedElement.hasAttribute(CLOSER_ATTRIBUTE) || clickedElement.closest(`[${CLOSER_ATTRIBUTE}]`)) {
        // do nothing. move on.
      } else {
        return false;
      }
    }
  }
  body.classList.toggle(ACTIVE_CLASS, safeActive);
  targetModal.classList.toggle(VISIBLE_CLASS, safeActive);
  targetModal.classList.toggle(HIDDEN_CLASS, !safeActive);

  // If user is forced to take an action, adding
  // a class to the body that prevents clicking underneath
  // overlay
  if (forceUserAction) {
    body.classList.toggle(PREVENT_CLICK_CLASS, safeActive);
  }

  // Temporarily increase body padding to include the width of the scrollbar.
  // This accounts for the content shift when the scrollbar is removed on modal open.
  if (body.style.paddingRight === TEMPORARY_BODY_PADDING) {
    body.style.removeProperty("padding-right");
  } else {
    body.style.paddingRight = TEMPORARY_BODY_PADDING;
  }

  // Handle the focus actions
  if (safeActive && openFocusEl) {
    // The modal window is opened. Focus is set to close button.

    // Binds escape key if we're not forcing
    // the user to take an action
    if (forceUserAction) {
      modal.focusTrap = FocusTrap(targetModal);
    } else {
      modal.focusTrap = FocusTrap(targetModal, {
        Escape: onMenuClose
      });
    }

    // Handles focus setting and interactions
    modal.focusTrap.update(safeActive);
    openFocusEl.focus();

    // Hides everything that is not the modal from screen readers
    document.querySelectorAll(NON_MODALS).forEach(nonModal => {
      nonModal.setAttribute("aria-hidden", "true");
      nonModal.setAttribute(NON_MODAL_HIDDEN_ATTRIBUTE, "");
    });
  } else if (!safeActive && menuButton && returnFocus) {
    // The modal window is closed.
    // Non-modals now accesible to screen reader
    document.querySelectorAll(NON_MODALS_HIDDEN).forEach(nonModal => {
      nonModal.removeAttribute("aria-hidden");
      nonModal.removeAttribute(NON_MODAL_HIDDEN_ATTRIBUTE);
    });

    // Focus is returned to the opener
    returnFocus.focus();
    modal.focusTrap.update(safeActive);
  }
  return safeActive;
}

/**
 * Creates a placeholder with data attributes for cleanup function.
 * The cleanup function uses this placeholder to easily restore the original Modal HTML on teardown.
 *
 * @param {HTMLDivElement} baseComponent - Modal HTML from the DOM.
 * @returns {HTMLDivElement} Placeholder used for cleanup function.
 */
const createPlaceHolder = baseComponent => {
  const modalID = baseComponent.getAttribute("id");
  const originalLocationPlaceHolder = document.createElement("div");
  const modalAttributes = Array.from(baseComponent.attributes);
  setTemporaryBodyPadding();
  originalLocationPlaceHolder.setAttribute(`data-placeholder-for`, modalID);
  originalLocationPlaceHolder.style.display = "none";
  originalLocationPlaceHolder.setAttribute("aria-hidden", "true");
  modalAttributes.forEach(attribute => {
    originalLocationPlaceHolder.setAttribute(`data-original-${attribute.name}`, attribute.value);
  });
  return originalLocationPlaceHolder;
};

/**
 * Moves necessary attributes from Modal HTML to wrapper element.
 *
 * @param {HTMLDivElement} baseComponent - Modal HTML in the DOM.
 * @param {HTMLDivElement} modalContentWrapper - Modal component wrapper element.
 * @returns Modal wrapper with correct attributes.
 */
const setModalAttributes = (baseComponent, modalContentWrapper) => {
  const modalID = baseComponent.getAttribute("id");
  const ariaLabelledBy = baseComponent.getAttribute("aria-labelledby");
  const ariaDescribedBy = baseComponent.getAttribute("aria-describedby");
  const forceUserAction = baseComponent.hasAttribute(FORCE_ACTION_ATTRIBUTE);
  if (!ariaLabelledBy) throw new Error(`${modalID} is missing aria-labelledby attribute`);
  if (!ariaDescribedBy) throw new Error(`${modalID} is missing aria-desribedby attribute`);

  // Set attributes
  modalContentWrapper.setAttribute("role", "dialog");
  modalContentWrapper.setAttribute("id", modalID);
  modalContentWrapper.setAttribute("aria-labelledby", ariaLabelledBy);
  modalContentWrapper.setAttribute("aria-describedby", ariaDescribedBy);
  if (forceUserAction) {
    modalContentWrapper.setAttribute(FORCE_ACTION_ATTRIBUTE, forceUserAction);
  }

  // Add aria-controls
  const modalClosers = modalContentWrapper.querySelectorAll(CLOSERS);
  modalClosers.forEach(el => {
    el.setAttribute("aria-controls", modalID);
  });

  // Update the base element HTML
  baseComponent.removeAttribute("id");
  baseComponent.removeAttribute("aria-labelledby");
  baseComponent.removeAttribute("aria-describedby");
  baseComponent.setAttribute("tabindex", "-1");
  return modalContentWrapper;
};

/**
 * Creates a hidden modal content wrapper.
 * Rebuilds the original Modal HTML in the new wrapper and adds a page overlay.
 * Then moves original Modal HTML attributes to the new wrapper.
 *
 * @param {HTMLDivElement} baseComponent - Original Modal HTML in the DOM.
 * @returns Modal component - Modal wrapper w/ nested Overlay and Modal Content.
 */
const rebuildModal = baseComponent => {
  const modalContent = baseComponent;
  const modalContentWrapper = document.createElement("div");
  const overlayDiv = document.createElement("div");

  // Add classes
  modalContentWrapper.classList.add(HIDDEN_CLASS, WRAPPER_CLASSNAME);
  overlayDiv.classList.add(OVERLAY_CLASSNAME);

  // Rebuild the modal element
  modalContentWrapper.append(overlayDiv);
  overlayDiv.append(modalContent);

  // Add attributes
  setModalAttributes(modalContent, modalContentWrapper);
  return modalContentWrapper;
};

/**
 *  Builds modal window from base HTML and appends to the end of the DOM.
 *
 * @param {HTMLDivElement} baseComponent - The modal div element in the DOM.
 */
const setUpModal = baseComponent => {
  const modalID = baseComponent.getAttribute("id");
  if (!modalID) {
    throw new Error(`Modal markup is missing ID`);
  }

  // Create placeholder where modal is for cleanup
  const originalLocationPlaceHolder = createPlaceHolder(baseComponent);
  baseComponent.after(originalLocationPlaceHolder);

  // Build modal component
  const modalComponent = rebuildModal(baseComponent);

  // Move all modals to the end of the DOM. Doing this allows us to
  // more easily find the elements to hide from screen readers
  // when the modal is open.
  document.body.appendChild(modalComponent);
};

/**
 * Removes dynamically created Modal and Wrapper elements and restores original Modal HTML.
 *
 * @param {HTMLDivElement} baseComponent - The modal div element in the DOM.
 */
const cleanUpModal = baseComponent => {
  const modalContent = baseComponent;
  const modalContentWrapper = modalContent.parentElement.parentElement;
  const modalID = modalContentWrapper.getAttribute("id");

  // if there is no modalID, return early
  if (!modalID) {
    return;
  }
  const originalLocationPlaceHolder = document.querySelector(`[data-placeholder-for="${modalID}"]`);
  if (originalLocationPlaceHolder) {
    const modalAttributes = Array.from(originalLocationPlaceHolder.attributes);
    modalAttributes.forEach(attribute => {
      if (attribute.name.startsWith("data-original-")) {
        // data-original- is 14 long
        modalContent.setAttribute(attribute.name.substr(14), attribute.value);
      }
    });
    originalLocationPlaceHolder.after(modalContent);
    originalLocationPlaceHolder.parentElement.removeChild(originalLocationPlaceHolder);
  }
  modalContentWrapper.parentElement.removeChild(modalContentWrapper);
};
modal = behavior({}, {
  init(root) {
    selectOrMatches(MODAL, root).forEach(modalWindow => {
      const modalId = modalWindow.id;
      setUpModal(modalWindow);

      // Query all openers and closers including the overlay
      selectOrMatches(`[aria-controls="${modalId}"]`, document).forEach(modalTrigger => {
        // If modalTrigger is an anchor...
        if (modalTrigger.nodeName === "A") {
          // Turn anchor links into buttons for screen readers
          modalTrigger.setAttribute("role", "button");

          // Prevent modal triggers from acting like links
          modalTrigger.addEventListener("click", e => e.preventDefault());
        }

        // Can uncomment when aria-haspopup="dialog" is supported
        // https://a11ysupport.io/tech/aria/aria-haspopup_attribute
        // Most screen readers support aria-haspopup, but might announce
        // as opening a menu if "dialog" is not supported.
        // modalTrigger.setAttribute("aria-haspopup", "dialog");

        modalTrigger.addEventListener("click", toggleModal);
      });
    });
  },
  teardown(root) {
    selectOrMatches(MODAL, root).forEach(modalWindow => {
      const modalId = modalWindow.id;
      cleanUpModal(modalWindow);
      selectOrMatches(`[aria-controls="${modalId}"]`, document).forEach(modalTrigger => modalTrigger.removeEventListener("click", toggleModal));
    });
  },
  focusTrap: null,
  toggleModal
});
module.exports = modal;

},{"../../uswds-core/src/js/utils/behavior":7,"../../uswds-core/src/js/utils/focus-trap":8,"../../uswds-core/src/js/utils/scrollbar-width":11,"../../uswds-core/src/js/utils/select-or-matches":12,"./../../../../../../uswds/uswds-config.js":24}],4:[function(require,module,exports){
"use strict";

module.exports = {
  prefix: "usa"
};

},{}],5:[function(require,module,exports){
"use strict";

module.exports = {
  // This used to be conditionally dependent on whether the
  // browser supported touch events; if it did, `CLICK` was set to
  // `touchstart`.  However, this had downsides:
  //
  // * It pre-empted mobile browsers' default behavior of detecting
  //   whether a touch turned into a scroll, thereby preventing
  //   users from using some of our components as scroll surfaces.
  //
  // * Some devices, such as the Microsoft Surface Pro, support *both*
  //   touch and clicks. This meant the conditional effectively dropped
  //   support for the user's mouse, frustrating users who preferred
  //   it on those systems.
  CLICK: "click"
};

},{}],6:[function(require,module,exports){
"use strict";

module.exports = (htmlDocument = document) => htmlDocument.activeElement;

},{}],7:[function(require,module,exports){
"use strict";

const assign = require("object-assign");
const Behavior = require("receptor/behavior");

/**
 * @name sequence
 * @param {...Function} seq an array of functions
 * @return { closure } callHooks
 */
// We use a named function here because we want it to inherit its lexical scope
// from the behavior props object, not from the module
const sequence = (...seq) => function callHooks(target = document.body) {
  seq.forEach(method => {
    if (typeof this[method] === "function") {
      this[method].call(this, target);
    }
  });
};

/**
 * @name behavior
 * @param {object} events
 * @param {object?} props
 * @return {receptor.behavior}
 */
module.exports = (events, props) => Behavior(events, assign({
  on: sequence("init", "add"),
  off: sequence("teardown", "remove")
}, props));

},{"object-assign":16,"receptor/behavior":17}],8:[function(require,module,exports){
"use strict";

const assign = require("object-assign");
const {
  keymap
} = require("receptor");
const behavior = require("./behavior");
const select = require("./select");
const activeElement = require("./active-element");
const FOCUSABLE = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
const tabHandler = context => {
  const focusableElements = select(FOCUSABLE, context);
  const firstTabStop = focusableElements[0];
  const lastTabStop = focusableElements[focusableElements.length - 1];

  // Special rules for when the user is tabbing forward from the last focusable element,
  // or when tabbing backwards from the first focusable element
  function tabAhead(event) {
    if (activeElement() === lastTabStop) {
      event.preventDefault();
      firstTabStop.focus();
    }
  }
  function tabBack(event) {
    if (activeElement() === firstTabStop) {
      event.preventDefault();
      lastTabStop.focus();
    }
    // This checks if you want to set the initial focus to a container
    // instead of an element within, and the user tabs back.
    // Then we set the focus to the first
    else if (!focusableElements.includes(activeElement())) {
      event.preventDefault();
      firstTabStop.focus();
    }
  }
  return {
    firstTabStop,
    lastTabStop,
    tabAhead,
    tabBack
  };
};
module.exports = (context, additionalKeyBindings = {}) => {
  const tabEventHandler = tabHandler(context);
  const bindings = additionalKeyBindings;
  const {
    Esc,
    Escape
  } = bindings;
  if (Escape && !Esc) bindings.Esc = Escape;

  //  TODO: In the future, loop over additional keybindings and pass an array
  // of functions, if necessary, to the map keys. Then people implementing
  // the focus trap could pass callbacks to fire when tabbing
  const keyMappings = keymap(assign({
    Tab: tabEventHandler.tabAhead,
    "Shift+Tab": tabEventHandler.tabBack
  }, additionalKeyBindings));
  const focusTrap = behavior({
    keydown: keyMappings
  }, {
    init() {
      // TODO: is this desireable behavior? Should the trap always do this by default or should
      // the component getting decorated handle this?
      if (tabEventHandler.firstTabStop) {
        tabEventHandler.firstTabStop.focus();
      }
    },
    update(isActive) {
      if (isActive) {
        this.on();
      } else {
        this.off();
      }
    }
  });
  return focusTrap;
};

},{"./active-element":6,"./behavior":7,"./select":13,"object-assign":16,"receptor":22}],9:[function(require,module,exports){
"use strict";

// iOS detection from: http://stackoverflow.com/a/9039885/177710
function isIosDevice() {
  return typeof navigator !== "undefined" && (navigator.userAgent.match(/(iPod|iPhone|iPad)/g) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) && !window.MSStream;
}
module.exports = isIosDevice;

},{}],10:[function(require,module,exports){
"use strict";

/* eslint-disable */
/* globals define, module */

/**
 * A simple library to help you escape HTML using template strings.
 *
 * It's the counterpart to our eslint "no-unsafe-innerhtml" plugin that helps us
 * avoid unsafe coding practices.
 * A full write-up of the Hows and Whys are documented
 * for developers at
 *  https://developer.mozilla.org/en-US/Firefox_OS/Security/Security_Automation
 * with additional background information and design docs at
 *  https://wiki.mozilla.org/User:Fbraun/Gaia/SafeinnerHTMLRoadmap
 *
 */

!function (factory) {
  module.exports = factory();
}(function () {
  "use strict";

  var Sanitizer = {
    _entity: /[&<>"'/]/g,
    _entities: {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
      "/": "&#x2F;"
    },
    getEntity: function (s) {
      return Sanitizer._entities[s];
    },
    /**
     * Escapes HTML for all values in a tagged template string.
     */
    escapeHTML: function (strings) {
      var result = "";
      for (var i = 0; i < strings.length; i++) {
        result += strings[i];
        if (i + 1 < arguments.length) {
          var value = arguments[i + 1] || "";
          result += String(value).replace(Sanitizer._entity, Sanitizer.getEntity);
        }
      }
      return result;
    },
    /**
     * Escapes HTML and returns a wrapped object to be used during DOM insertion
     */
    createSafeHTML: function (strings) {
      var _len = arguments.length;
      var values = new Array(_len > 1 ? _len - 1 : 0);
      for (var _key = 1; _key < _len; _key++) {
        values[_key - 1] = arguments[_key];
      }
      var escaped = Sanitizer.escapeHTML.apply(Sanitizer, [strings].concat(values));
      return {
        __html: escaped,
        toString: function () {
          return "[object WrappedHTMLObject]";
        },
        info: "This is a wrapped HTML object. See https://developer.mozilla.or" + "g/en-US/Firefox_OS/Security/Security_Automation for more."
      };
    },
    /**
     * Unwrap safe HTML created by createSafeHTML or a custom replacement that
     * underwent security review.
     */
    unwrapSafeHTML: function () {
      var _len = arguments.length;
      var htmlObjects = new Array(_len);
      for (var _key = 0; _key < _len; _key++) {
        htmlObjects[_key] = arguments[_key];
      }
      var markupList = htmlObjects.map(function (obj) {
        return obj.__html;
      });
      return markupList.join("");
    }
  };
  return Sanitizer;
});

},{}],11:[function(require,module,exports){
"use strict";

module.exports = function getScrollbarWidth() {
  // Creating invisible container
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll"; // forcing scrollbar to appear
  outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
  document.body.appendChild(outer);

  // Creating inner element and placing it in the container
  const inner = document.createElement("div");
  outer.appendChild(inner);

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = `${outer.offsetWidth - inner.offsetWidth}px`;

  // Removing temporary elements from the DOM
  outer.parentNode.removeChild(outer);
  return scrollbarWidth;
};

},{}],12:[function(require,module,exports){
"use strict";

const select = require("./select");
/**
 * @name isElement
 * @desc returns whether or not the given argument is a DOM element.
 * @param {any} value
 * @return {boolean}
 */
const isElement = value => value && typeof value === "object" && value.nodeType === 1;

/**
 * @name selectOrMatches
 * @desc selects elements from the DOM by class selector or ID selector.
 * @param {string} selector - The selector to traverse the DOM with.
 * @param {Document|HTMLElement?} context - The context to traverse the DOM
 *   in. If not provided, it defaults to the document.
 * @return {HTMLElement[]} - An array of DOM nodes or an empty array.
 */
module.exports = (selector, context) => {
  const selection = select(selector, context);
  if (typeof selector !== "string") {
    return selection;
  }
  if (isElement(context) && context.matches(selector)) {
    selection.push(context);
  }
  return selection;
};

},{"./select":13}],13:[function(require,module,exports){
"use strict";

/**
 * @name isElement
 * @desc returns whether or not the given argument is a DOM element.
 * @param {any} value
 * @return {boolean}
 */
const isElement = value => value && typeof value === "object" && value.nodeType === 1;

/**
 * @name select
 * @desc selects elements from the DOM by class selector or ID selector.
 * @param {string} selector - The selector to traverse the DOM with.
 * @param {Document|HTMLElement?} context - The context to traverse the DOM
 *   in. If not provided, it defaults to the document.
 * @return {HTMLElement[]} - An array of DOM nodes or an empty array.
 */
module.exports = (selector, context) => {
  if (typeof selector !== "string") {
    return [];
  }
  if (!context || !isElement(context)) {
    context = window.document; // eslint-disable-line no-param-reassign
  }
  const selection = context.querySelectorAll(selector);
  return Array.prototype.slice.call(selection);
};

},{}],14:[function(require,module,exports){
"use strict";

// element-closest | CC0-1.0 | github.com/jonathantneal/closest

(function (ElementProto) {
  if (typeof ElementProto.matches !== 'function') {
    ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.mozMatchesSelector || ElementProto.webkitMatchesSelector || function matches(selector) {
      var element = this;
      var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
      var index = 0;
      while (elements[index] && elements[index] !== element) {
        ++index;
      }
      return Boolean(elements[index]);
    };
  }
  if (typeof ElementProto.closest !== 'function') {
    ElementProto.closest = function closest(selector) {
      var element = this;
      while (element && element.nodeType === 1) {
        if (element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
      }
      return null;
    };
  }
})(window.Element.prototype);

},{}],15:[function(require,module,exports){
"use strict";

/* global define, KeyboardEvent, module */

(function () {
  var keyboardeventKeyPolyfill = {
    polyfill: polyfill,
    keys: {
      3: 'Cancel',
      6: 'Help',
      8: 'Backspace',
      9: 'Tab',
      12: 'Clear',
      13: 'Enter',
      16: 'Shift',
      17: 'Control',
      18: 'Alt',
      19: 'Pause',
      20: 'CapsLock',
      27: 'Escape',
      28: 'Convert',
      29: 'NonConvert',
      30: 'Accept',
      31: 'ModeChange',
      32: ' ',
      33: 'PageUp',
      34: 'PageDown',
      35: 'End',
      36: 'Home',
      37: 'ArrowLeft',
      38: 'ArrowUp',
      39: 'ArrowRight',
      40: 'ArrowDown',
      41: 'Select',
      42: 'Print',
      43: 'Execute',
      44: 'PrintScreen',
      45: 'Insert',
      46: 'Delete',
      48: ['0', ')'],
      49: ['1', '!'],
      50: ['2', '@'],
      51: ['3', '#'],
      52: ['4', '$'],
      53: ['5', '%'],
      54: ['6', '^'],
      55: ['7', '&'],
      56: ['8', '*'],
      57: ['9', '('],
      91: 'OS',
      93: 'ContextMenu',
      144: 'NumLock',
      145: 'ScrollLock',
      181: 'VolumeMute',
      182: 'VolumeDown',
      183: 'VolumeUp',
      186: [';', ':'],
      187: ['=', '+'],
      188: [',', '<'],
      189: ['-', '_'],
      190: ['.', '>'],
      191: ['/', '?'],
      192: ['`', '~'],
      219: ['[', '{'],
      220: ['\\', '|'],
      221: [']', '}'],
      222: ["'", '"'],
      224: 'Meta',
      225: 'AltGraph',
      246: 'Attn',
      247: 'CrSel',
      248: 'ExSel',
      249: 'EraseEof',
      250: 'Play',
      251: 'ZoomOut'
    }
  };

  // Function keys (F1-24).
  var i;
  for (i = 1; i < 25; i++) {
    keyboardeventKeyPolyfill.keys[111 + i] = 'F' + i;
  }

  // Printable ASCII characters.
  var letter = '';
  for (i = 65; i < 91; i++) {
    letter = String.fromCharCode(i);
    keyboardeventKeyPolyfill.keys[i] = [letter.toLowerCase(), letter.toUpperCase()];
  }
  function polyfill() {
    if (!('KeyboardEvent' in window) || 'key' in KeyboardEvent.prototype) {
      return false;
    }

    // Polyfill `key` on `KeyboardEvent`.
    var proto = {
      get: function (x) {
        var key = keyboardeventKeyPolyfill.keys[this.which || this.keyCode];
        if (Array.isArray(key)) {
          key = key[+this.shiftKey];
        }
        return key;
      }
    };
    Object.defineProperty(KeyboardEvent.prototype, 'key', proto);
    return proto;
  }
  if (typeof define === 'function' && define.amd) {
    define('keyboardevent-key-polyfill', keyboardeventKeyPolyfill);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    module.exports = keyboardeventKeyPolyfill;
  } else if (window) {
    window.keyboardeventKeyPolyfill = keyboardeventKeyPolyfill;
  }
})();

},{}],16:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';

/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
function toObject(val) {
  if (val === null || val === undefined) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }
  return Object(val);
}
function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    }

    // Detect buggy property enumeration order in older V8 versions.

    // https://bugs.chromium.org/p/v8/issues/detail?id=4118
    var test1 = new String('abc'); // eslint-disable-line no-new-wrappers
    test1[5] = 'de';
    if (Object.getOwnPropertyNames(test1)[0] === '5') {
      return false;
    }

    // https://bugs.chromium.org/p/v8/issues/detail?id=3056
    var test2 = {};
    for (var i = 0; i < 10; i++) {
      test2['_' + String.fromCharCode(i)] = i;
    }
    var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
      return test2[n];
    });
    if (order2.join('') !== '0123456789') {
      return false;
    }

    // https://bugs.chromium.org/p/v8/issues/detail?id=3056
    var test3 = {};
    'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
      test3[letter] = letter;
    });
    if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
      return false;
    }
    return true;
  } catch (err) {
    // We don't expect any of the above to throw, but better to be safe.
    return false;
  }
}
module.exports = shouldUseNative() ? Object.assign : function (target, source) {
  var from;
  var to = toObject(target);
  var symbols;
  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);
    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
    if (getOwnPropertySymbols) {
      symbols = getOwnPropertySymbols(from);
      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }
  return to;
};

},{}],17:[function(require,module,exports){
"use strict";

const assign = require('object-assign');
const delegate = require('../delegate');
const delegateAll = require('../delegateAll');
const DELEGATE_PATTERN = /^(.+):delegate\((.+)\)$/;
const SPACE = ' ';
const getListeners = function (type, handler) {
  var match = type.match(DELEGATE_PATTERN);
  var selector;
  if (match) {
    type = match[1];
    selector = match[2];
  }
  var options;
  if (typeof handler === 'object') {
    options = {
      capture: popKey(handler, 'capture'),
      passive: popKey(handler, 'passive')
    };
  }
  var listener = {
    selector: selector,
    delegate: typeof handler === 'object' ? delegateAll(handler) : selector ? delegate(selector, handler) : handler,
    options: options
  };
  if (type.indexOf(SPACE) > -1) {
    return type.split(SPACE).map(function (_type) {
      return assign({
        type: _type
      }, listener);
    });
  } else {
    listener.type = type;
    return [listener];
  }
};
var popKey = function (obj, key) {
  var value = obj[key];
  delete obj[key];
  return value;
};
module.exports = function behavior(events, props) {
  const listeners = Object.keys(events).reduce(function (memo, type) {
    var listeners = getListeners(type, events[type]);
    return memo.concat(listeners);
  }, []);
  return assign({
    add: function addBehavior(element) {
      listeners.forEach(function (listener) {
        element.addEventListener(listener.type, listener.delegate, listener.options);
      });
    },
    remove: function removeBehavior(element) {
      listeners.forEach(function (listener) {
        element.removeEventListener(listener.type, listener.delegate, listener.options);
      });
    }
  }, props);
};

},{"../delegate":19,"../delegateAll":20,"object-assign":16}],18:[function(require,module,exports){
"use strict";

module.exports = function compose(functions) {
  return function (e) {
    return functions.some(function (fn) {
      return fn.call(this, e) === false;
    }, this);
  };
};

},{}],19:[function(require,module,exports){
"use strict";

// polyfill Element.prototype.closest
require('element-closest');
module.exports = function delegate(selector, fn) {
  return function delegation(event) {
    var target = event.target.closest(selector);
    if (target) {
      return fn.call(target, event);
    }
  };
};

},{"element-closest":14}],20:[function(require,module,exports){
"use strict";

const delegate = require('../delegate');
const compose = require('../compose');
const SPLAT = '*';
module.exports = function delegateAll(selectors) {
  const keys = Object.keys(selectors);

  // XXX optimization: if there is only one handler and it applies to
  // all elements (the "*" CSS selector), then just return that
  // handler
  if (keys.length === 1 && keys[0] === SPLAT) {
    return selectors[SPLAT];
  }
  const delegates = keys.reduce(function (memo, selector) {
    memo.push(delegate(selector, selectors[selector]));
    return memo;
  }, []);
  return compose(delegates);
};

},{"../compose":18,"../delegate":19}],21:[function(require,module,exports){
"use strict";

module.exports = function ignore(element, fn) {
  return function ignorance(e) {
    if (element !== e.target && !element.contains(e.target)) {
      return fn.call(this, e);
    }
  };
};

},{}],22:[function(require,module,exports){
"use strict";

module.exports = {
  behavior: require('./behavior'),
  delegate: require('./delegate'),
  delegateAll: require('./delegateAll'),
  ignore: require('./ignore'),
  keymap: require('./keymap')
};

},{"./behavior":17,"./delegate":19,"./delegateAll":20,"./ignore":21,"./keymap":23}],23:[function(require,module,exports){
"use strict";

require('keyboardevent-key-polyfill');

// these are the only relevant modifiers supported on all platforms,
// according to MDN:
// <https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState>
const MODIFIERS = {
  'Alt': 'altKey',
  'Control': 'ctrlKey',
  'Ctrl': 'ctrlKey',
  'Shift': 'shiftKey'
};
const MODIFIER_SEPARATOR = '+';
const getEventKey = function (event, hasModifiers) {
  var key = event.key;
  if (hasModifiers) {
    for (var modifier in MODIFIERS) {
      if (event[MODIFIERS[modifier]] === true) {
        key = [modifier, key].join(MODIFIER_SEPARATOR);
      }
    }
  }
  return key;
};
module.exports = function keymap(keys) {
  const hasModifiers = Object.keys(keys).some(function (key) {
    return key.indexOf(MODIFIER_SEPARATOR) > -1;
  });
  return function (event) {
    var key = getEventKey(event, hasModifiers);
    return [key, key.toLowerCase()].reduce(function (result, _key) {
      if (_key in keys) {
        result = keys[key].call(this, event);
      }
      return result;
    }, undefined);
  };
};
module.exports.MODIFIERS = MODIFIERS;

},{"keyboardevent-key-polyfill":15}],24:[function(require,module,exports){
"use strict";

module.exports = {
  prefix: "fba-usa"
};

},{}],25:[function(require,module,exports){
"use strict";

const ComboBox = require("@uswds/uswds/packages/usa-combo-box/src/index.js");
const DatePicker = require("@uswds/uswds/packages/usa-date-picker/src/index.js");
const Modal = require("@uswds/uswds/packages/usa-modal/src/index.js");

// Make these components available in the global browser scope so that Touchpoints code can call initialization functions.
window.fbaUswds = {
  ComboBox,
  DatePicker,
  Modal
};

},{"@uswds/uswds/packages/usa-combo-box/src/index.js":1,"@uswds/uswds/packages/usa-date-picker/src/index.js":2,"@uswds/uswds/packages/usa-modal/src/index.js":3}]},{},[25]);


// Initialize any USWDS components used in this form
(function () {
	const formId = "touchpoints-form-2dcadeaf";
	const fbaFormElement = document.querySelector(`#${formId}`);
	if (fbaFormElement) {
		fbaUswds.ComboBox.on(fbaFormElement);
		fbaUswds.DatePicker.on(fbaFormElement);
	}
	const modalId = "fba-modal-2dcadeaf";
	const fbaModalElement = document.querySelector(`#${modalId}`);
	if (fbaModalElement) {
		fbaUswds.Modal.on(fbaModalElement);
	}
})();

