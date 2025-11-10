sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (Controller) => {
  "use strict";

  return Controller.extend("flightui5ev.controller.View1", {
    onInit() {
      var oFlightJSONModel = new sap.ui.model.json.JSONModel();
      var that = this;
      var oDataModel = this.getOwnerComponent().getModel();
      var sPath = "/Flight";

      oDataModel.read(sPath, {
        sorters: [ new sap.ui.model.Sorter("Carrname", false) ],
        success: function (oresponse) {
          console.log(oresponse);
          oFlightJSONModel.setData(oresponse.results);
          that.getView().setModel(oFlightJSONModel, "flightDataModel");
        },
        error: function () {
          console.log("error");
        }
      });
    },

    onListItemPress(oEvent) {
      const sPath = oEvent.getSource().getBindingContext().getPath();

      this.getOwnerComponent().getRouter().navTo("Detail", {
        entityPath: encodeURIComponent(sPath)
      });
    }
  });
});
