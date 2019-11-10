import {Component} from '../Component.js';

export class ColumnSelector extends Component {

  constructor(opts) {
    var base = {
      // The parent container of this pane.
      "parent": null,
      "id": "dex-ui-column-selector",
      "class": "dex-ui-column-selector",
      "targets": [],
      "csv": undefined
    };

    super(new dex.Configuration(base).overlay(opts));
    this.initialize()
  }

  initialize() {
    // If the chart isn't attached to the dom, just return.
    if (!$.contains(document, this.$root[0])) {
      return this;
    }

    let config = this.config;
    // Replace with root
    //let $parent = $(config.get("parent"));
    let $root = this.$root;
    let csv = config.get("csv");
    let self = this;
    //$parent.empty();

    let targets = config.get("targets");

    // Add each component as a subscriber
    targets.forEach(function (component) {
      component.subscribe(self.getChannel(), "select", function (event) {
        component.set("csv", event.csv)
        component.update();
      });
    })

    var content = `<div class="dex-cs-center">
  <div class="alert dex-xs-alert alert-success text-center" role="alert">
    Selected
  </div>
  <div id="ColumnSelectorDest"></div>
</div>
<div class="dex-cs-east">
  <div class="alert dex-xs-alert alert-primary text-center" role="alert">
    Omitted
  </div>
  <div id="ColumnSelectorSource"></div>
</div>`;

    var types = csv.guessTypes();
    $root.append(content);

    var $source = $root.find('#ColumnSelectorSource');
    var $dest = $root.find('#ColumnSelectorDest');

    let buttonText = ""
    csv.header.forEach(function (h, hi) {
      let buttonType = 'btn-primary';
      switch (types[hi]) {
        case "date" : {
          buttonType = 'btn-secondary'
          break
        }
        case "string" : {
          buttonType = 'btn-primary';
          break;
        }
        case "number" : {
          buttonType = 'btn-success'
          break;
        }
        default : {
          buttonType = 'btn-primary'
        }
      }
      buttonText = `<button type='button' class='dex-xs-btn btn btn-block ${buttonType}'>${h}</button>`;
      let $button = $(buttonText)
      $button.click(function (event) {
        // On click, remove the element from the current list and
        // add it to the seconde list.
        if ("ColumnSelectorDest" === event.currentTarget.parentElement.id) {
          // Move from dest to source
          event.currentTarget.parentElement.removeChild(event.currentTarget);
          $source.append(event.currentTarget)
        }
        else {
          // Move from source to dest
          event.currentTarget.parentElement.removeChild(event.currentTarget);
          $dest.append(event.currentTarget)
        }
        // Query the selected columns (aka button names)
        // Send a message to listeners to update their data
        let selected = $dest.find("button").map(function () {
          return $(this).text();
        }).get();
        var selectedCsv = csv.include(selected);
        self.publish("select", {
          csv: selectedCsv
        });
      })
      $dest.append($button)
    });

    var drake = dragula([$source[0], $dest[0]], {
      copy: false
    });

    drake.on('drop', function (el, target, source, sibling) {
      let selected = $dest.find("button").map(function () {
        return $(this).text();
      }).get();
      var selectedCsv = csv.include(selected);
      self.publish("select", {
        csv: selectedCsv
      });
    })

    $root.layout({
      center__paneSelector: ".dex-cs-center",
      east__paneSelector: ".dex-cs-east"
    });

    return this;
  }

  update() {
    return this;
  };

}