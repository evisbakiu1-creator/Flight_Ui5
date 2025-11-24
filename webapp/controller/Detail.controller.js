sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "flightui5ev/formatter/Formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, Formatter, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("flightui5ev.controller.Detail", {

        formatter: Formatter,

        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
        },

        
        _onObjectMatched: function (oEvent) {
            const sCarrId = oEvent.getParameter("arguments").Carrid;
            this._sCarrid = sCarrId; 

            const oDetailJSONModel = new JSONModel();
            const oDataModel = this.getOwnerComponent().getModel();
            const sPath = "/Flight(Carrid='" + sCarrId + "',IsActiveEntity=true)";
            const that = this;

            oDataModel.read(sPath, {
                urlParameters: {
                    "$expand": "to_DetailEVI"
                },
                success: function (oResponse) {
                    oDetailJSONModel.setData(oResponse);
                    that.getView().setModel(oDetailJSONModel, "FlightDetailModel");
                },
                error: function (oError) {
                    console.error("Error reading flight detail:", oError);
                }
            });
        },

    
        onDeleteFlightDetail: function (oEvent) {
    const oButton = oEvent.getSource();

    // 1) Context of clicked row in the JSON model
    const oCtx = oButton.getBindingContext("FlightDetailModel");
    if (!oCtx) {
        sap.m.MessageToast.show("No binding context for this row");
        return;
    }

    const sRowPath = oCtx.getPath();   // e.g. "/to_DetailEVI/results/3"
    const oRow = oCtx.getObject();     // row data

    // Keys of the child entity (from ZR_FLIGHT_DETAIL_EVI)
    const sCarrid = oRow.Carrid;
    const sConnid = oRow.Connid;

    const oODataModel = this.getOwnerComponent().getModel();
    const that = this;

    sap.m.MessageBox.confirm(
        "Do you really want to delete flight " + sConnid + "?",
        {
            actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            onClose: function (sAction) {
                if (sAction !== sap.m.MessageBox.Action.OK) {
                    return;
                }
                
                const sDeletePath = oODataModel.createKey("/FlightDetailsEVI", {
                    Carrid: sCarrid,
                    Connid: sConnid,
                    IsActiveEntity: true
                });

                oODataModel.remove(sDeletePath, {
                    success: function () {
                        sap.m.MessageToast.show("Flight " + sConnid + " deleted");

                        const oJsonModel = that.getView().getModel("FlightDetailModel");
                        const aDetails = oJsonModel.getProperty("/to_DetailEVI/results") || [];

                        const aParts = sRowPath.split("/");
                        const iIndex = parseInt(aParts[aParts.length - 1], 10);

                        if (!Number.isNaN(iIndex) && aDetails[iIndex]) {
                            aDetails.splice(iIndex, 1);
                            oJsonModel.setProperty("/to_DetailEVI/results", aDetails);
                        }
                    },
                    error: function (oError) {
                        sap.m.MessageToast.show("Error while deleting flight");
                        console.error("Delete error:", oError);
                            }
                        });
                    }
                }
            );
        }

    });
});
