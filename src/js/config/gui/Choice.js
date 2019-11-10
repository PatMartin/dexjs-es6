import {Configuration} from "../../Configuration";

export class Choice extends Configuration {
  constructor(config) {
    super(config);
    let base = {
      "name": "choice name",
      "label": "choice label",
      "desc": "choice description",
      "action": undefined,
      "choices": ["choice 1", "choice 2", "default choice"],
      "type": "choice",
      "initial": "default choice"
    }
    this.underlay(base);
    this.update();
  }

  set(name, value) {
    dex.log("set()")
    super.set(name, value)
    return this.update()
  }

  update() {
    dex.log("update()", this)
    let self = this;

    this.$label = $(`<label class="dex-label" title="${this.get("desc")}">${this.get("name")}:</label>`)
    this.$select = $(`<select class="dex-config-choice"></select>`)

    this.get("choices").forEach(function (choice) {
      var $option = $("<option></option>")
        .attr("value", choice)
        .text(choice);

      //dex.console.log("COMPARING CHOICE: '" + choice + "' to '", guiDef);
      if (choice === self.get("initial")) {
        $option.attr("selected", "selected");
      }

      self.$select.append($option);
    });

    this.$select.multiselect({
      includeSelectAllOption: true,
      allSelectedText: 'All',
      enableFiltering: true,
      enableFullValueFiltering: true,
      onChange: function toggleOnChange(option, checked, select) {
        dex.log("toggle")
        if (checked) {
          dex.log("Checked")
          if (self.isDefined("action")) {
            self.get("action")(option, checked, select)
          }
        }
        self.$select.multiselect('updateButtonText');
      }
    });

    return this;
  }

  setParents(...parent) {
    if (parent && parent.length > 0) {
      this.$label.detach()
      this.$select.detach()

      if (parent.length > 1) {
        let $labelParent = (parent[0] instanceof $) ? parent[0] : $(parent[0])
        let $selectParent = (parent[1] instanceof $) ? parent[1] : $(parent[1])
        $labelParent.append(this.$label)
        $selectParent.append(this.$select)
      } else {
        let $parent = (parent[0] instanceof $) ? parent[0] : $(parent[0])
        $parent.append(this.$label)
        $parent.append(this.$select)
      }
    }
    this.update()
    return this;
  }
}
