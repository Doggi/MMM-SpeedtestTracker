/* global Module */

/* Magic Mirror
 * Module: MMM-SpeedtestTracker
 *
 * By
 * MIT Licensed.
 */

Module.register("MMM-SpeedtestTracker", {
  defaults: {
    showDownload: true,
    showUpload: true,
    showPing: true,
    showServerName: false,
    showDate: false,
    updateInterval: 60000,
    retryDelay: 5000,
    dateOptions: {
      localeMatcher: "best fit",
      timeZone: "Europe/Berlin",
      hour12: false, // oder true für 12-Stunden-Format
      formatMatcher: "best fit",
      weekday: undefined,
      era: undefined,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    },
    speedFormatOptions: {
      style: "unit",
      unit: "megabit-per-second",
      unitDisplay: "short",
      notation: "standard",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
    pingFormatOptions: {
      style: "unit",
      unit: "millisecond",
      unitDisplay: "short",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  },

  requiresVersion: "2.1.0", // Required version of MagicMirror

  start: function () {
    var self = this;
    var dataRequest = null;
    var dataNotification = null;

    //Flag for check if module is loaded
    this.loaded = false;

    if (this.config.url) {
      // Schedule update timer.
      this.getData();
      setInterval(function () {
        self.updateDom();
      }, this.config.updateInterval);
    } else {
      Log.error(self.name, "No URL defined");
    }
  },

  /*
   * getData
   * function example return data and show it in the module wrapper
   * get a URL request
   *
   */
  getData: function () {
    var self = this;

    var urlApi = this.config.url + "/api/speedtest/latest";
    var retry = true;

    var dataRequest = new XMLHttpRequest();
    dataRequest.open("GET", urlApi, true);
    dataRequest.onreadystatechange = function () {
      Log.debug(self.name, this.readyState);
      if (this.readyState === 4) {
        Log.debug(self.name, this.status);
        if (this.status === 200) {
          self.processData(JSON.parse(this.response));
        } else if (this.status === 401) {
          self.updateDom(self.config.animationSpeed);
          Log.error(self.name, this.status);
          retry = false;
        } else {
          Log.error(self.name, "Could not load data.");
        }
        if (retry) {
          self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
        }
      }
    };
    dataRequest.send();
  },

  /* scheduleUpdate()
   * Schedule next update.
   *
   * argument delay number - Milliseconds before next update.
   *  If empty, this.config.updateInterval is used.
   */
  scheduleUpdate: function (delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }
    nextLoad = nextLoad;
    var self = this;
    setTimeout(function () {
      self.getData();
    }, nextLoad);
  },
  /*
	getHeader: function() {
		return "Speedtest Tracker";
	},
	*/

  getDom: function () {
    var self = this;

    // create element wrapper for show into the module
    var wrapper = document.createElement("div");
    wrapper.classList.add("mmm-speedtest-tracker");
    // If this.dataRequest is not empty
    if (this.dataRequest) {
      let row1 = document.createElement("div");
      let row2 = document.createElement("div");
      row2.classList.add("xsmall", "dimmed");

      //download
      if (this.config.showDownload) {
        row1.appendChild(
          this.createMeasurementElement(
            this.dataRequest.data.download,
            ["fa-solid", "fa-download"],
            this.config.speedFormatOptions
          )
        );
      }
      // upload
      if (this.config.showUpload) {
        row1.appendChild(
          this.createMeasurementElement(
            this.dataRequest.data.upload,
            ["fa-solid", "fa-upload"],
            this.config.speedFormatOptions
          )
        );
      }
      // ping
      if (this.config.showPing) {
        row1.appendChild(
          this.createMeasurementElement(
            this.dataRequest.data.ping,
            ["fa-regular", "fa-clock"],
            this.config.pingFormatOptions
          )
        );
      }

      // server
      if (this.config.showServerName) {
        row2.appendChild(this.createTextElement(this.dataRequest.data.server_name, ["fa-solid", "fa-server"], []));
      }
      // date
      if (this.config.showDate) {
        let date = new Date(this.dataRequest.data.updated_at);
        let dateText = date.toLocaleString(config.locale, this.config.dateFromatOptions);
        row2.appendChild(this.createTextElement(dateText, ["fa-solid", "fa-clock-rotate-left"], []));
      }

      if (row1.hasChildNodes()) {
        wrapper.appendChild(row1);
      }

      if (row2.hasChildNodes()) {
        wrapper.appendChild(row2);
      }
    }

    if (!wrapper.hasChildNodes()) {
      wrapper.innerText = "No data";
    }

    return wrapper;
  },

  getScripts: function () {
    return [];
  },

  getStyles: function () {
    return ["MMM-SpeedtestTracker.css"];
  },

  // Load translations files
  getTranslations: function () {
    //FIXME: This can be load a one file javascript definition
    return {
      en: "translations/en.json",
      es: "translations/es.json",
    };
  },

  createMeasurementElement: function (value, faIconClasses, formatOptions) {
    let text = new Intl.NumberFormat(config.locale, formatOptions).format(value);
    return this.createTextElement(text, faIconClasses, ["bright"]);
  },

  createTextElement: function (text, faIconClasses, textClasses) {
    let iconWrapper = document.createElement("i");
    iconWrapper.classList.add(...faIconClasses);

    let textWraper = document.createElement("span");
    textWraper.classList.add(...textClasses);

    let downloadText = document.createTextNode(text);
    textWraper.appendChild(downloadText);

    let wrapper = document.createElement("span");
    wrapper.appendChild(iconWrapper);
    wrapper.appendChild(textWraper);

    return wrapper;
  },

  processData: function (data) {
    var self = this;
    this.dataRequest = data;
    if (this.loaded === false) {
      self.updateDom(self.config.animationSpeed);
    }
    this.loaded = true;

    // the data if load
    // send notification to helper
    this.sendSocketNotification("MMM-SpeedtestTracker-NOTIFICATION_TEST", data);
  },

  // socketNotificationReceived from helper
  socketNotificationReceived: function (notification, payload) {
    if (notification === "MMM-SpeedtestTracker-NOTIFICATION_TEST") {
      // set dataNotification
      this.dataNotification = payload;
      this.updateDom();
    }
  },
});
