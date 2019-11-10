import { Component } from './Component.js'
import {log} from "./logger/logger";

export default class EventBus {
  constructor(params) {
    this.subscriptions = {};
  }

  /**
   *
   * Clear all of the bus subscriptions.
   *
   */
  clear() {
    this.subscriptions = {};
  }

  /**
   *
   * Clear all subscriptions to the given channel.
   *
   */
  clear(channel) {
    if (channel) {
      this.subscriptions[channel] = {}
    }
  }

  /**
   * Clear all subscriptions of this event type to this channel.
   *
   */
  clear(channel, eventType) {
    if (channel && eventType && this.subscriptions[channel][eventType]) {
      this.subscriptions[channel][eventType] = []
    }
  }

  /**
   * Publishes a Topic. If the topic exists in the PubSub subscriptions, the
   * corresponding function will be invoked
   *
   * @param {string} channel The channel we will publish to.
   * @param {string} eventType The event type to publish.
   * @param {Object} event The event to be published.
   *
   */
  publish(channel, eventType, event) {
    if (channel && eventType && event && this.subscriptions[channel] &&
      this.subscriptions[channel][eventType]) {
      for (const fn of this.subscriptions[channel][eventType])
        fn(event);
    }
  }

  /**
   * Subscribes a Function to a channel. The function will be invoked when the
   *  corresponding channel is published.
   *
   * @param {string} channel Identifier for storing subscriptions.
   * @param {string} eventType Second part of the identifier for storing subscriptions.
   * @param {Function} fn fn Function to be invoked when the matching channel
   *  is published to.
   *
   *  @return {Function} Returns the callback function for the purpose of
   *  later unsubscribing.
   *
   */
  subscribe(channel, eventType, fn) {
    let chan = (channel instanceof Component) ? channel.getDomTarget() : channel;

    this.subscriptions[chan] = this.subscriptions[chan] || {};
    this.subscriptions[chan][eventType] = this.subscriptions[chan][eventType] || []
    this.subscriptions[chan][eventType].push(fn);
    return fn;
  }

  /**
   * Unsubscribe a function from a channel. Only Deletes functions stored
   *  through a variable/ or function name.
   *
   * @param {String} channel channel to unsubscribe.
   * @param {String} eventType Event type to unsubscribe.
   * @param {Function} fn The function to unsubscribe.
   *
   */
  unsubscribe(channel, eventType, fn) {
    let chan = (channel instanceof Component) ? channel.getDomTarget() : channel;

    if (this.subscriptions[chan] && this.subscriptions[chan][eventType]) {
      this.subscriptions[chan][eventType].forEach((value, index) => {
        if (value === fn) {
          this.subscriptions[chan][eventType].splice(index, 1);
        }
      });
    }
  }
};

