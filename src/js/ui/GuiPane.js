import {Component} from '../Component.js';

export class GuiPane extends Component {
  constructor(opts) {
    var base = {
      // The parent container of this pane.
      "parent": null,
      "id": "dex-ui-guipane",
      "class": "dex-ui-guipane",
      "targets": []
    };

    super(new dex.Configuration(base).overlay(opts));
    this.componentMap = {};
    this.targetList = {};
    this.controlCounter = 0;
    this.initialize()
  }

  initialize() {
    if (!$.contains(document, this.$root[0])) {
      return this;
    }
    let config = this.config;
    //let $parent = $(config.get("parent"));
    let components = config.get("targets");
    let self = this;
    let $root = this.$root;

    components.forEach(function (component, ci) {
      //dex.logString("COMPONENT[", ci,
      //  "] = parent='", component.get("parent"), "', id='", component.get("id"),
      //  "', class='", component.get("class"), "'");
      self.componentMap[component.getDomTarget()] = component;
    })

    this.addControls($root, components);

    ///////////////////
    // Enable booleans
    ///////////////////
    var $toggles = $root.find('.control-boolean input');
    //dex.log($root.find("input.dex-toggle[initialValue=true]"))
    $root.find("input.dex-toggle[initialValue=true]").prop("checked", true);

    // Collapse everything below the third tier:
    // GUI Config -> Charts -> Main Sections
    $root.find('.depth-1,.depth-2').collapse("show");
    return this;
  }

  update() {
    return this;
  };

  // TODO: Start here, work your way down and componetize everything
  addControls($target, components) {
    // Used to ensure all target names are unique.
    let config = this.config;
    this.targetList = {};
    var self = this;

    let $guiTitle = $(`<div class="dex-h1 text-center" data-toggle='collapse'
 data-target='#dex-ui-guipane-body'>Gui Configuration</div>`)
    let $guiDiv = $(`<div id="dex-ui-guipane-body" class="collapse depth-1"></div>`)
    let $guiTable = $(`<table class="dex-control-table"></table>`);
    let $guiBody = $(`<tbody></tbody>`)

    $guiDiv.append($guiTable);
    $guiTable.append($guiBody)
    $target.append($guiTitle)
    $target.append($guiDiv)

    config.get("targets").forEach(function (component) {
      let target = component.getDomTarget();
      if (target !== undefined) {
        self.addControl(target, $guiBody, component.getGuiDefinition(), 1);
      }
    });

    return this;
  }

  getTargetName(name) {
    let targetList = this.targetList;

    var targetName = name.replace(/[\. >\(\)#:]/g, '_');
    //dex.console.log("NAME(" + name + ")->" + targetName);
    if (targetList[targetName] === undefined) {
      targetList[targetName] = 1;
    } else {
      targetList[targetName]++;
    }

    return targetName + "-" + targetList[targetName];
  }

  addControl(targetComponent, $targetElt, guiDef, depth) {

    if (guiDef === undefined || guiDef.type === undefined) {
      return;
    }

    switch (guiDef.type) {
      case "group" :
        this.addGroup(targetComponent, $targetElt, guiDef, depth + 1);
        break;
      case "string" :
        this.addString(targetComponent, $targetElt, guiDef, depth);
        break;
      case "float" :
        this.addFloat(targetComponent, $targetElt, guiDef, depth);
        break;
      case "int" :
        this.addInt(targetComponent, $targetElt, guiDef, depth);
        break;
      case "boolean" :
        this.addBoolean(targetComponent, $targetElt, guiDef, depth);
        break;
      case "choice" :
        this.addChoice(targetComponent, $targetElt, guiDef, depth);
        break;
      case "multiple-choice" :
        this.addMultipleChoice(targetComponent, $targetElt, guiDef, depth);
        break;
      case "color" :
        this.addColor(targetComponent, $targetElt, guiDef, depth);
        break;
      default:
        // Choice, color
        //dex.log("UNRECOGNIZED CONTROL TYPE: '" + guiDef.type + "'");
        break;
    }
    return this;
  }

  addGroup(targetComponent, $targetElt, guiDef, depth) {
    var groupTarget = this.getTargetName(
      targetComponent + ":" + guiDef.name);
    var self = this;

    let $row = $(`<tr></tr>`)
    let $groupTitle = $(`<tr><td colspan="2"><div class="dex-h${depth} "
 data-toggle='collapse' data-target='#${groupTarget}'>${guiDef.name}</div></td></tr>`)

    let $groupRow = $(`<tr id="${groupTarget}" class="depth-${depth} collapse"></tr>`);
    let $groupCol = $(`<td colspan="2"></td>`);
    let $groupDiv = $(`<div></div>`)
    let $groupTable = $(`<table class="dex-control-table"></table>`)

    $groupDiv.append($groupTable);
    $groupCol.append($groupDiv)
    $groupRow.append($groupCol)
    $targetElt.append($groupTitle)
    $targetElt.append($groupRow)

    guiDef.contents.forEach(function (contentDef) {
      self.addControl(targetComponent, $groupTable, contentDef, depth);
    });
  }

  createRow($left, $right) {
    let $row = $(`<tr></tr>`)
    let $leftCol = $(`<td class="left-column"></td>`)
    let $rightCol = $(`<td class="right-column"></td>`)
    $leftCol.append($left)
    $rightCol.append($right)
    $row.append($leftCol)
    $row.append($rightCol)
    return $row
  }

  addColor(targetComponent, $targetElt, guiDef, depth) {
    let self = this;

    let $label = $(`<label class="dex-label col-lg-4"></label>`)
      .attr("title", guiDef.description)
      .html(guiDef.name + ":");
    let $picker = $(`<input class="dex-ui-guipane-colorpicker col-lg-8" type=""color"></input>`)
      .attr("value", guiDef.initialValue)
      .attr("targetAttribute", guiDef.target)
      .attr("targetComponent", targetComponent);

    $targetElt.append(this.createRow($label, $picker));

    $picker.spectrum({
      showPalette: true,
      showAlpha: true,
      palette: [
        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", /*"rgb(153, 153, 153)","rgb(183, 183, 183)",*/
          "rgb(204, 204, 204)", "rgb(217, 217, 217)", /*"rgb(239, 239, 239)", "rgb(243, 243, 243)",*/ "rgb(255, 255, 255)"],
        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
          "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
        ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
          "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
          "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
          "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
          "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
          "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
          "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
          "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
          /*"rgb(133, 32, 12)", "rgb(153, 0, 0)", "rgb(180, 95, 6)", "rgb(191, 144, 0)", "rgb(56, 118, 29)",
          "rgb(19, 79, 92)", "rgb(17, 85, 204)", "rgb(11, 83, 148)", "rgb(53, 28, 117)", "rgb(116, 27, 71)",*/
          "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
          "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
      ],
      showSelectionPalette: true,
      clickoutFiresChange: true,
      showInitial: false,
      //palette: dex.color.palette['crayola120'],
      change: function (color) {
        //dex.console.log("COLOR-CHANGE", color, this);
        //$("#basic-log").text("change called: " + color.toHexString());
        var cmp = self.componentMap[this.getAttribute("targetComponent")];
        var attName = this.getAttribute("targetAttribute");
        var value = color.toHexString();
        if (cmp != undefined) {
          cmp.set(attName, value);
          cmp.save(attName, value);
          cmp.update();
        }
      }
    });
  }

  addChoice(targetComponent, $targetElt, guiDef, depth) {
    let self = this;

    self.controlCounter++;
    let id = self.controlCounter;

    let $label = $(`<label class="dex-label" title="${guiDef.description}">${guiDef.name}:</label>`)
    let $select = $(`<div class="dex-h3" id="dex-guipane-choice-${id}"></div>`);

    $targetElt.append(this.createRow($label, $select))
    var listSelector = new dex.ui.ListSelector({
      parent: `#dex-guipane-choice-${id}`,
      id: `dex-guipane-choice-selector-${id}`,
      name: guiDef.name,
      items: guiDef.choices,
      selectAll: false,
      multiple: false,
      selected : [ guiDef.initialValue ]
    }).render();

    dex.bus.subscribe(listSelector, "select", function(msg) {
      //dex.log("MSG", msg)
      var cmp = self.componentMap[targetComponent];

      if (cmp != undefined) {
        //dex.log("set-choice", cmp, attName, option.attr("value"))
        cmp.set(guiDef.target, msg.selected).update();
      }
    })
  }

  addMultipleChoice(targetComponent, $targetElt, guiDef, depth) {
    let self = this;

    self.controlCounter++;
    let id = self.controlCounter;

    let $label = $(`<label class="dex-label" title="${guiDef.description}">${guiDef.name}:</label>`)
    let $select = $(`<div class="dex-h3" id="dex-guipane-multi-choice-${id}"></div>`);

    $targetElt.append(this.createRow($label, $select))
    var listSelector = new dex.ui.ListSelector({
      parent: `#dex-guipane-multi-choice-${id}`,
      id: `dex-guipane-multi-choice-selector-${id}`,
      name: guiDef.name,
      items: guiDef.choices,
      selectAll: false,
      multiple: true,
      selected : [ guiDef.initialValue ]
    }).render();

    dex.bus.subscribe(listSelector, "select", function(msg) {
      //dex.log("MSG", msg)
      var cmp = self.componentMap[targetComponent];

      if (cmp != undefined) {
        //dex.log("set-choice", cmp, attName, option.attr("value"))
        cmp.set(guiDef.target, msg.selected).update();
      }
    })
  }

  addBoolean(targetComponent, $targetElt, guiDef, depth) {

    let $label = $(`<label class="dex-label"></label>`)
      .attr("title", guiDef.description)
      .html(guiDef.name + ":");
    let $switch = $(`<label class="switch"></label>`)
    let $input = $(`<input class="dex-toggle" type="checkbox"></input>`)
    let $span = $(`<span class="slider round"></span>`)
    $switch.append($input);
    $switch.append($span)

    $targetElt.append(this.createRow($label, $switch))

    if (guiDef.initialValue !== undefined) {
      $input.attr("initialValue", guiDef.initialValue);
    }

    var handler = function (cmp, guiDef) {
      return function () {
        var obj = $(this);
        var value = obj.prop('checked');
        //dex.log("boolean-handler", cmp, guiDef, obj, value)
        if (typeof guiDef.filter === "function") {
          value = guiDef.filter(value);
        }
        if (cmp != undefined) {
          cmp.set(guiDef.target, value)
          cmp.update();
        }
      }
    }(this.componentMap[targetComponent], guiDef);

    //$input.bootstrapToggle({
    //  on: "Yes",
    //  off: "No",
    //  onstyle: "primary",
    //  offstyle: "danger",
    //  width: 40,
    //  height: 25
    //});
    $input.change(handler);
  }

  addString(targetComponent, $targetElt, guiDef, depth) {

    let self = this;
    let $label = $(`<label class="dex-label">${guiDef.name}:</label>`)
      .attr("title", guiDef.description)

    let $input = $(`<input class="dex-string-input" type="text"></input>`)
      .attr("targetAttribute", guiDef.target)
      .attr("targetComponent", targetComponent)
      .attr("value", guiDef.initialValue)
      .attr("id", guiDef.target);

    $targetElt.append(this.createRow($label, $input))

    $input.on('input', function (event) {
      var cmp = self.componentMap[event.target.getAttribute("targetComponent")];
      var attName = event.target.getAttribute("targetAttribute");
      if (cmp != undefined) {
        //dex.log("cmp-set", cmp, attName, event.target.value)
        cmp.set(attName, event.target.value);
        cmp.update();
      }
    })
  }

  addFloat(targetComponent, $targetElt, guiDef, depth) {
    let self = this;

    let $label = $(`<tr><td colspan="2">
<label class="dex-label" title="${guiDef.description}">${guiDef.name}</label>
</td></tr>`)

    let $sliderRow = $(`<tr></tr>`)
    let $sliderCol = $(`<td colspan="2"></td>`)

    $sliderRow.append($sliderCol)

    $targetElt.append($label)
    $targetElt.append($sliderRow)

    var floatSlider = new dex.ui.Slider({
      parent: $sliderCol,
      min: guiDef.minValue,
      max: guiDef.maxValue,
      target: guiDef.target,
      targetComponent: targetComponent,
      step: guiDef.step,
      initial: guiDef.initialValue,
      onFinish: function (data) {
        //dex.log("setting " + guiDef.target + " to " + data.from)
        self.componentMap[targetComponent].set(guiDef.target, data.from).update();
      }
    });
  }

  addInt(targetComponent, $targetElt, guiDef, depth) {
    this.addFloat(targetComponent, $targetElt, guiDef, depth)
  }
}