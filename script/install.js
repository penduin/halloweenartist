window.addEventListener("DOMContentLoaded", function () {
	if(window.location.host !== "halloweenartist.penduin.net") {
		return;
	}

	var installUrl = null;
	if(navigator.mozApps) {
		var request = navigator.mozApps.getSelf();
		request.onsuccess = function () {
			if(!this.result) {
				installUrl = [
					location.href.substring(0, location.href.lastIndexOf("/")),
					"/manifest.webapp"
				].join("");
				try {
					navigator.mozApps.install(installUrl);
				} catch (error) {
				}
			}
		};
	} else if((typeof chrome !== "undefined") &&
			  chrome.webstore && chrome.app) {
		if(!chrome.app.isInstalled) {
			chrome.webstore.install(null);
		}
	} else if(typeof window.navigator.standalone !== "undefined") {
		if(!window.navigator.standalone) {
			alert([
				"To install, press the forward arrow in Safari ",
				"and touch \"Add to Home Screen\""
			].join(""));
			this.doIt = function() {
				this.trigger("showiOSInstall", navigator.platform.toLowerCase());
			};
		}
	}
});
