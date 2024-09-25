import Hyperlink from "editorjs-hyperlink";
import { isExternalURL } from "../utils/link-utils";

export class OnrrHyperlink extends Hyperlink {
    iconSvg(name, width = 24, height = 24) {
        const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );
        svg.classList.add("icon", "icon--" + name);
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("fill", "none");
        if (name == "link") {
            svg.innerHTML = `
          <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M7.69998 12.6L7.67896 12.62C6.53993 13.7048 6.52012 15.5155 7.63516 16.625V16.625C8.72293 17.7073 10.4799 17.7102 11.5712 16.6314L13.0263 15.193C14.0703 14.1609 14.2141 12.525 13.3662 11.3266L13.22 11.12"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16.22 11.12L16.3564 10.9805C17.2895 10.0265 17.3478 8.5207 16.4914 7.49733V7.49733C15.5691 6.39509 13.9269 6.25143 12.8271 7.17675L11.3901 8.38588C10.0935 9.47674 9.95706 11.4241 11.0888 12.6852L11.12 12.72"></path>
        `;
        } else {
            svg.innerHTML = `
          <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M15.7795 11.5C15.7795 11.5 16.053 11.1962 16.5497 10.6722C17.4442 9.72856 17.4701 8.2475 16.5781 7.30145V7.30145C15.6482 6.31522 14.0873 6.29227 13.1288 7.25073L11.8796 8.49999"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8.24517 12.3883C8.24517 12.3883 7.97171 12.6922 7.47504 13.2161C6.58051 14.1598 6.55467 15.6408 7.44666 16.5869V16.5869C8.37653 17.5731 9.93744 17.5961 10.8959 16.6376L12.1452 15.3883"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M17.7802 15.1032L16.597 14.9422C16.0109 14.8624 15.4841 15.3059 15.4627 15.8969L15.4199 17.0818"></path><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6.39064 9.03238L7.58432 9.06668C8.17551 9.08366 8.6522 8.58665 8.61056 7.99669L8.5271 6.81397"></path><line x1="12.1142" x2="11.7" y1="12.2" y2="11.7858" stroke="currentColor" stroke-linecap="round" stroke-width="2"></line>
        `;
        }
        return svg;
    }

    render() {
        this.nodes.button = document.createElement("button");
        this.nodes.button.type = "button";
        this.nodes.button.classList.add(
            this.CSS.button,
            this.CSS.buttonModifier
        );
        this.nodes.button.appendChild(this.iconSvg("link", 24, 24));
        this.nodes.button.appendChild(this.iconSvg("unlink", 24, 24));
        return this.nodes.button;
    }

    renderActions() {
        this.config.target = '_self';

        this.nodes.wrapper = document.createElement("div");
        this.nodes.wrapper.classList.add(this.CSS.wrapper);

        // Input
        this.nodes.input = document.createElement("input");
        this.nodes.input.placeholder = "Enter web URL, CMS path, or mailto address";
        this.nodes.input.classList.add(this.CSS.input);

        let i;

        // Target
        this.nodes.selectTarget = document.createElement("select");
        this.nodes.selectTarget.classList.add(this.CSS.selectTarget);
        this.addOption(
            this.nodes.selectTarget,
            this.i18n.t("Select target"),
            ""
        );
        for (i = 0; i < this.targetAttributes.length; i++) {
            this.addOption(
                this.nodes.selectTarget,
                this.targetAttributes[i],
                this.targetAttributes[i]
            );
        }

        if (!!this.config.target) {
            if (this.targetAttributes.length === 0) {
                this.addOption(
                    this.nodes.selectTarget,
                    this.config.target,
                    this.config.target
                );
            }

            this.nodes.selectTarget.value = this.config.target;
        }

        // Rel
        this.nodes.selectRel = document.createElement("select");
        this.nodes.selectRel.classList.add(this.CSS.selectRel);
        this.addOption(this.nodes.selectRel, this.i18n.t("Select rel"), "");
        for (i = 0; i < this.relAttributes.length; i++) {
            this.addOption(
                this.nodes.selectRel,
                this.relAttributes[i],
                this.relAttributes[i]
            );
        }

        if (!!this.config.rel) {
            if (this.relAttributes.length === 0) {
                this.addOption(
                    this.nodes.selectTarget,
                    this.config.rel,
                    this.config.rel
                );
            }

            this.nodes.selectRel.value = this.config.rel;
        }

        // Button
        this.nodes.buttonSave = document.createElement("button");
        this.nodes.buttonSave.type = "button";
        this.nodes.buttonSave.classList.add(this.CSS.buttonSave);
        this.nodes.buttonSave.innerHTML = this.i18n.t("Save");
        this.nodes.buttonSave.addEventListener("click", (event) => {
            this.savePressed(event);
        });

        // Link button toggle
        this.nodes.linkButtonToggleWrapper = document.createElement("div");
        this.nodes.linkButtonToggleWrapper.classList.add("link-button-toggle");

        this.nodes.linkButtonToggle = document.createElement("input");
        this.nodes.linkButtonToggle.type = "checkbox";
        this.nodes.linkButtonToggle.id = "linkButton";

        this.nodes.linkButtonToggleLabel = document.createElement("label");
        this.nodes.linkButtonToggleLabel.setAttribute("for", "linkButton");
        this.nodes.linkButtonToggleLabel.textContent = "Style as button";

        this.nodes.linkButtonToggleWrapper.appendChild(
            this.nodes.linkButtonToggle
        );
        this.nodes.linkButtonToggleWrapper.appendChild(
            this.nodes.linkButtonToggleLabel
        );

        // append
        this.nodes.wrapper.appendChild(this.nodes.input);

        if (!!this.targetAttributes && this.targetAttributes.length > 0) {
            this.nodes.wrapper.appendChild(this.nodes.selectTarget);
        }

        if (!!this.relAttributes && this.relAttributes.length > 0) {
            this.nodes.wrapper.appendChild(this.nodes.selectRel);
        }

        this.nodes.wrapper.appendChild(this.nodes.linkButtonToggleWrapper);

        this.nodes.wrapper.appendChild(this.nodes.buttonSave);

        return this.nodes.wrapper;
    }

    savePressed(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        let value = this.nodes.input.value || "";
        let target = this.nodes.selectTarget.value || "";
        let rel = this.nodes.selectRel.value || "";

        if (!!!value || !this.validateURL(value)) {
            this.tooltip.show(this.nodes.input, "The URL is not valid.", {
                placement: "top",
            });
            setTimeout(() => {
                this.tooltip.hide();
            }, 3000);
            return;
        }

        value = this.prepareLink(value);

        this.selection.restore();
        this.selection.removeFakeBackground();

        this.insertLink(
            value,
            target,
            rel,
            this.nodes.linkButtonToggle.checked
        );

        this.selection.collapseToEnd();
        this.inlineToolbar.close();
    }

    validateURL(str) {
        const urlPattern =
            /^(https?:\/\/(?:[a-zA-Z0-9-]+\.[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})(?:\/[^\s?#]*)?(?:\?[^\s#]*)?)|(\/[\w\-\.]+(?:\/[\w\-\.]*)?(?:\?[^\s#]*)?)|(mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
        return urlPattern.test(str);
    }

    insertLink(link, target = "", rel = "", checked = false) {
        let anchorTag = this.selection.findParentTag("A");
        if (anchorTag) {
            this.selection.expandToTag(anchorTag);
        }

        document.execCommand(this.commandLink, false, link);
        anchorTag = this.selection.findParentTag('A');

        if (anchorTag) {
            if (!!target) {
                anchorTag["target"] = target;
            } else {
                anchorTag.removeAttribute("target");
            }
            if (!!rel) {
                anchorTag["rel"] = rel;
            } else {
                anchorTag.removeAttribute("rel");
            }
            if (checked) {
                anchorTag.classList.add("usa-button");
            } else {
                anchorTag.classList.add("usa-link");
            }
            if (isExternalURL(anchorTag.href)) {
                anchorTag.classList.add("usa-link--external");
            }
        }
    }
}
