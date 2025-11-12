sap.ui.define([
    "sap/ui/model/type/Time",
    "sap/ui/core/format/DateFormat",
], function (Time, DateFormat) {
    "use strict";

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
            if (!sCarrid) {
                return "img/default_logo.png";
            }
            var id = String(sCarrid).trim().toUpperCase();
            switch (id) {
                case "SR": return "img/lufthansa.png";
                case "AB": return "img/Logo_airberlin.svg.png";
                default:   return "img/default_logo.png";
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
