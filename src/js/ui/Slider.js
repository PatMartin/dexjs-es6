import {Component} from '../Component.js';

export class Slider extends Component {

  constructor(opts) {
    var base = {
      id: "dex-ui-slider",
      class: "dex-ui-slider",
      range: false,
      type: "number"
    }

    super(new dex.Configuration(base).overlay(opts));

    switch (this.get("type")) {
      case "number": {
        this.internalSlider = this.createNumberSlider(this.$root)
        break
      }
      case "date": {
        this.internalSlider = this.createDateSlider(this.$root)
        break;
      }
    }
  }

  getStep(extent) {
    try {
      var delta = Math.abs(+extent[1] - extent[0]) / 100;
      if (delta < 1) {
        return delta;
      }
      return 1;
    } catch (ex) {
      return 1;
    }
  }

  getFormatter(extent) {
    var step = this.getStep(extent);
    if (step < 1) {

      return {
        from: Number,
        to: function (value) {
          return parseFloat(Math.round(value * 100) / 100).toFixed(2);
        }
      };
    }
    return {
      from: Number,
      to: function (value) {
        return Math.floor(value);
      }
    };
  }

  createNumberSlider(selection) {
    let sliderConfig = {
      skin: "big",
      type: "single",
      grid: true,
      min: this.config.get("min"),
      max: this.get("max"),
      from: (this.isDefined("initial") ? this.get("initial") : this.get("min")),
      step: this.getStep([this.get("min"), this.get("max")]),
      drag_interval: true,
      min_interval: null,
      max_interval: null,
      onFinish: this.get("onFinish")
    }
    if (this.config.get("range")) {
      sliderConfig.type = "double"
      sliderConfig.to = this.get("max");
    }
    //dex.log("Slider Config:", sliderConfig)
    return selection.ionRangeSlider(sliderConfig)
  }

  dateToTS (date) {
    return date.valueOf();
  }

  timestampToDate(timestamp) {
    var d = new Date(timestamp);

    return d.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  createDateSlider(selection) {
    let sliderConfig = {
      skin: "big",
      type: "single",
      grid: true,
      min: this.get("min"),
      max: this.get("max"),
      from: this.timestampToDate((this.isDefined("initial")
        ? this.get("initial").getTime() : this.get("min").getTime())),
      drag_interval: true,
      min_interval: null,
      max_interval: null,
      prettify: this.timestampToDate
    }

    if (this.config.get("range")) {
      sliderConfig.type = "double"
      sliderConfig.to = this.timestampToDate(this.get("max").getTime())
    }

    return selection.ionRangeSlider(sliderConfig);
  }

  update() {
    return this;
  };

}