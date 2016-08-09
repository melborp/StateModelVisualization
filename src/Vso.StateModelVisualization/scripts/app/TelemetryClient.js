/// <reference path="ai.0.22.9-build00167.d.ts" />
/// <reference path="ai.0.22.9-build00167.d.ts" />

define(["require", "exports", "scripts/lib/ai.0.22.9-build00167"],
    function (require, exports, Microsoft2) {

        var telemetryClient;
        function getClient(){
            if (!this.telemetryClient) {
                this.telemetryClient = new TelemetryClient();
                this.telemetryClient.Init();
            }

            return this.telemetryClient;
        }

        var TelemetryClient = (function () {
            function TelemetryClient() {
                this.appInsightsClient = null;//: Microsoft.ApplicationInsights.AppInsights;
            }

            TelemetryClient.prototype.Init= function() {
                try {
                    var snippet = {
                        config: {
                            instrumentationKey: "43786d2b-25eb-4eaf-96c7-ec7f5ccba5a0",
                        }
                    };
                    var x = VSS.getExtensionContext();

                    var init = new Microsoft.ApplicationInsights.Initialization(snippet);
                    this.appInsightsClient = init.loadAppInsights();

                    var webContext = VSS.getWebContext();
                    this.appInsightsClient.setAuthenticatedUserContext(webContext.user.id, webContext.collection.id);
                }
                catch (e) {
                    this.appInsightsClient = null;
                    console.log(e);
                }
            }

            TelemetryClient.prototype.startTrackPageView= function(name){ //?: string) {
                try {
                    if (this.appInsightsClient != null) {
                        this.appInsightsClient.startTrackPage(name);
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }

            TelemetryClient.prototype.stopTrackPageView = function(name){ //?: string) {
                try {
                    if (this.appInsightsClient != null) {
                        this.appInsightsClient.stopTrackPage(name);
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }

            TelemetryClient.prototype.trackPageView= function(name, url, properties, measurements, duration) {
                try {
                    if (this.appInsightsClient != null) {
                        this.appInsightsClient.trackPageView( name, url, properties, measurements, duration);
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }

            TelemetryClient.prototype.trackEvent = function(name, properties, measurements) {
                try {
                    if (this.appInsightsClient != null) {
                        this.appInsightsClient.trackEvent( name, properties, measurements);
                        this.appInsightsClient.flush();
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }

            TelemetryClient.prototype.trackException = function(exception, handledAt, properties, measurements) {
                try {
                    if (this.appInsightsClient != null) {
                        this.appInsightsClient.trackException(exception, handledAt, properties, measurements);
                        this.appInsightsClient.flush();
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }

            TelemetryClient.prototype.trackMetric = function(name, average, sampleCount, min, max, propertiesObject) {
                try {
                    if (this.appInsightsClient != null) {
                        this.appInsightsClient.trackMetric( name, average, sampleCount, min, max, properties);
                        this.appInsightsClient.flush();
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }

            return TelemetryClient;
        })();
        exports.TelemetryClient = TelemetryClient;
        exports.getClient = getClient;
    });
