import {Component} from '../Component.js';

export class ListSelector extends Component {

  constructor(opts) {
    var base = {
      // The parent container of this pane.
      "parent": null,
      "id": "ListSelectorId",
      "class": "ListSelectorClass",
      items: [],
      selected: [],
      name: "Item",
      text: "count>0",
      actions: true,
      multiple: true,
      search: true,
      selectAll: true,
      style: "info"
    };

    super(new dex.Configuration(base).overlay(opts));
  }

  render() {
    super.render();
    let config = this.config;
    let $parent = $(config.get("parent"));
    let self = this;

    let domStr = `<select class="selectpicker" 
data-title="${config.get("name")}: None Selected"
title="${config.get("name")}: None Selected"
data-width="100%"
data-size="5"
data-style="btn-${config.get("style")}"
data-live-search="${config.get("search") ? "true" : "false"}"
data-count-selected-text="${config.get("name")}: ({0}/{1})"
data-selected-text-format="${config.get("text")}"
data-actions-box="${config.get("actions") ? "true" : "false"}"
${config.get("multiple") ? " multiple" : ""}>`

    if (config.get("selectAll")) {
      config.set("selected", dex.array.copy(config.get("items")))
    }

    var items = config.get("items")

    let selectedMap = {};
    config.get("selected").forEach(function(item) { selectedMap[item] = true})

    _.uniq(items).forEach(function (val) {
      domStr += `<option value="${val}"${selectedMap[val] ? " selected" : ""}>${val}</option>`
    });
    domStr += "</select>"

    $parent.append(domStr)
    var $picker = $parent.find(".selectpicker");
    $picker.selectpicker({
      virtualScroll: (items.length > 100)
    })

    $picker.selectpicker("refresh")

      $parent.find('.selectpicker').on('hidden.bs.select',
          function (evt) {
          dex.log("SELECTED", $(this).val())
          self.publish("select", { selected: $(this).val() })
      });


      return this;
  }

  update() {
    return this;
  };

}