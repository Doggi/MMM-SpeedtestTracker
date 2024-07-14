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
			localeMatcher: 'best fit',
			timeZone: 'Europe/Berlin',
			hour12: false, // oder true für 12-Stunden-Format
			formatMatcher: 'best fit',
			weekday: undefined,
			era: undefined,
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			timeZoneName: 'short'
		}
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		if(this.config.url){
			// Schedule update timer.
			this.getData();
			setInterval(function() {
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
	getData: function() {
		var self = this;

		var urlApi = this.config.url + "/api/speedtest/latest";
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
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
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
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
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},
	/*
	getHeader: function() {
		return "Speedtest Tracker";
	},
	*/

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
		wrapper.classList.add("mmm-speedtest-tracker");
		// If this.dataRequest is not empty
		if (this.dataRequest) {
			let row1 = document.createElement("div");
			let row2 = document.createElement("div");
			row2.classList.add("xsmall", "light");

			//download
			if(this.config.showDownload){
				let downloadIcon = document.createElement("i");
				downloadIcon.classList.add("fa-solid", "fa-download");

				let downloadTextContainer = document.createElement("span");
				downloadTextContainer.classList.add("bright");
				
				let downloadText = document.createTextNode(this.dataRequest.data.download + " Mbps");
				downloadTextContainer.appendChild(downloadText);

				let download = document.createElement("span");
				download.appendChild(downloadIcon);
				download.appendChild(downloadTextContainer);
				row1.appendChild(download);
			}
			// upload
			if(this.config.showUpload){
				let uploadIcon = document.createElement("i");
				uploadIcon.classList.add("fa-solid", "fa-upload");

				let uploadTextContainer = document.createElement("span");
				uploadTextContainer.classList.add("bright");

				let uploadText = document.createTextNode(this.dataRequest.data.upload + " Mbps");
				uploadTextContainer.appendChild(uploadText);

				let upload = document.createElement("span");
				upload.appendChild(uploadIcon);
				upload.appendChild(uploadTextContainer);
				row1.appendChild(upload);
			}
			// ping
			if(this.config.showPing){
				let pingIcon = document.createElement("i");
				pingIcon.classList.add("fa-regular", "fa-clock");

				let pingTextContainer = document.createElement("span");
				pingTextContainer.classList.add("bright");

				let pingText = document.createTextNode(this.dataRequest.data.ping + " ms");
				pingTextContainer.appendChild(pingText);

				let ping = document.createElement("span");
				ping.appendChild(pingIcon);
				ping.appendChild(pingTextContainer);
				row1.appendChild(ping);
			}

			// server
			if(this.config.showServerName){
				let serverIcon = document.createElement("i");
				serverIcon.classList.add("fa-solid", "fa-server");

				let serverText = document.createTextNode(this.dataRequest.data.server_name);

				let server = document.createElement("span");
				server.appendChild(serverIcon);
				server.appendChild(serverText);
				row2.appendChild(server);
			}
			// date
			if(this.config.showDate){
				let dateIcon = document.createElement("i");
				dateIcon.classList.add("fa-solid", "fa-clock-rotate-left");
				
				let date = new Date(this.dataRequest.data.updated_at);
				let dateText = document.createTextNode(date.toLocaleString(config.locale));
				let dateWrapper = document.createElement("span");
				
				dateWrapper.appendChild(dateIcon);
				dateWrapper.appendChild(dateText);
				row2.appendChild(dateWrapper);
			}
			wrapper.appendChild(row1);
			wrapper.appendChild(row2);
		}

		// Data from helper
		if (this.dataNotification) {
			var wrapperDataNotification = document.createElement("div");
			wrapperDataNotification.classList.add("xsmall", "light");
			// translations  + datanotification
			wrapperDataNotification.innerHTML =  this.translate("UPDATE") + ": " + this.dataNotification.date;

			//wrapper.appendChild(wrapperDataNotification);
		}
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-SpeedtestTracker.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("MMM-SpeedtestTracker-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-SpeedtestTracker-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});
