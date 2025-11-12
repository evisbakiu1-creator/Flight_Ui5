sap.ui.define([
    "sap/ui/model/type/Time",
    "sap/ui/core/format/DateFormat",
], function (Time, DateFormat) {
    "use strict";

    
    function imgUrl(file) {
    
        return sap.ui.require.toUrl("flightui5ev/img/" + file);
    }

    return {
        formatTableDates: function (oDate) {
            if (!oDate) {
                return "";
            }
            var date = new Date(oDate);
            var day = String(date.getDate()).padStart(2, "0");
            var month = String(date.getMonth() + 1).padStart(2, "0");
            var year = date.getFullYear();
            return day + "." + month + "." + year;
        },

        getCarrierLogo: function (sCarrid) {
            var id = (sCarrid || "").toString().trim().toUpperCase();

            switch (id) {
                case "SR":
                    return imgUrl("lufthansa.png");
                case "AB":
                    return imgUrl("Logo_airberlin.svg.png");
                default:
                    return imgUrl("default_logo.png");
            }
        },

        shouldShowUrlRow: function (sUrl, sCarrname) {
            return !!((sUrl && String(sUrl).trim()) || (sCarrname && String(sCarrname).trim()));
        },

        displayUrl: function (sUrl, sCarrname) {
            var raw = sUrl && String(sUrl).trim();
            if (raw) return raw;
            var name = sCarrname && String(sCarrname).trim().replace(/[^A-Za-z0-9]/g, "");
            if (!name) return "";
            return "www." + name.toUpperCase() + ".COM";
        },

        hrefUrl: function (sUrl, sCarrname) {
            var raw = sUrl && String(sUrl).trim();
            if (raw) return /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
            var name = sCarrname && String(sCarrname).trim().replace(/[^A-Za-z0-9]/g, "");
            if (!name) return "";
            var domain = "www." + name.toLowerCase() + ".com";
            return "https://" + domain;
        }
    };
});
