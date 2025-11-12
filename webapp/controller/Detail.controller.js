sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "flightui5ev/formatter/Formatter",
], (Controller, Formatter, JSONModel) => {
  "use strict";

  return Controller.extend("flightui5ev.controller.Detail", {

    formatter: Formatter,

    onInit() {
            
            this.getOwnerComponent().getRouter().getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
            this.getView().getModel("FlightDetailModel");
        },


    _onObjectMatched: function (oEvent) {
               //read the url parameters
                var sCarrId = oEvent.getParameter("arguments").Carrid;

                var oDetailJSONModel = new sap.ui.model.json.JSONModel();
                var that = this;
                //read the data from Back End (READ_GET_ENTITY)
                var oDataModel = this.getOwnerComponent().getModel();
                var sPath = "/Flight(Carrid='" + sCarrId + "',IsActiveEntity=true)";

                oDataModel.read(sPath, {
                    urlParameters: {
                        "$expand": "to_DetailEVI" // Replace with your navigation property name
                    },

                    success: function (oresponse) {
                        console.log(oresponse);
                        //attach the data to the model
                        oDetailJSONModel.setData(oresponse);
                        //attach the Model to the View
                        that.getView().setModel(oDetailJSONModel, "FlightDetailModel");
                        console.log(that.getView().getModel("FlightDetailModel"));
                    },
                    error: function (oerror) { },
                });
            },
    });
});

