sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter"
], function (Controller, JSONModel, Filter, FilterOperator, Sorter) {
  "use strict";

  return Controller.extend("flightui5ev.controller.Detail", {
    onInit: function () {
      this.getOwnerComponent().getRouter()
        .getRoute("Detail")
        .attachPatternMatched(this._onMatched, this);
    },

    _onMatched: function (oEvent) {
      var sCarrid = oEvent.getParameter("arguments").Carrid;
      var oView   = this.getView();
      var oModel  = this.getOwnerComponent().getModel();

      // Header (optional): read the carrier entity to show at top
      // If your service has /Flight('<Carrid>')
      oModel.read("/Flight('" + sCarrid + "')", {
        success: function (oData) {
          oView.setModel(new JSONModel(oData), "Header");
        }
        // error: function() { /* ignore */ }
      });

      // Bind child table to your details entity set FlightDetailsEVI
      // Keys: (Carrid, Connid, IsActiveEntity). We filter by Carrid and active=true.
      var oTable    = oView.byId("detailsTable");
      var oTemplate = oTable.getBindingInfo("items").template.clone();

      oTable.bindItems({
        path: "/FlightDetailsEVI",
        filters: [
          new Filter("Carrid", FilterOperator.EQ, sCarrid),
          new Filter("IsActiveEntity", FilterOperator.EQ, true)
        ],
        sorter: [ new Sorter("Connid", false) ],
        template: oTemplate
      });
    }
  });
});
