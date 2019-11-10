import {Configuration} from "../../Configuration";

export class StringInput extends Configuration {
  constructor(config) {
    super(config);
    let base = {
      "name": "name",
      "label": "label",
      "desc": "description",
      "action": undefined,
      "type": "string",
      "initial": ""
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
    this.$label = $(`<label class="dex-label">${this.get("name")}:</label>`)
      .attr("title", this.get("desc"))

    this.$input = $(`<input class="dex-string-input" type="text"></input>`)
      .attr("value", this.get("initial"))

    this.$input.on('input', function (event) {
      if (self.isDefined("action")) {
        self.get("action")(event)
      }
    })

    return this;
  }

  setParents(...parent) {
    if (parent && parent.length > 0) {
        this.$label.detach()
        this.$input.detach()

      if (parent.length > 1) {
        let $labelParent = (parent[0] instanceof $) ? parent[0] : $(parent[0])
        let $inputParent = (parent[1] instanceof $) ? parent[1] : $(parent[1])
        $labelParent.append(this.$label)
        $inputParent.append(this.$input)
      }
      else {
        let $parent = (parent[0] instanceof $) ? parent[0] : $(parent[0])
        $parent.append(this.$label)
        $parent.append(this.$input)
      }
    }
    return this;
  }
}
