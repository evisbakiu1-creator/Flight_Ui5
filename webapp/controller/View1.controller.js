sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, JSONModel) => {
    "use strict";

    return Controller.extend("flightui5ev.controller.View1", {

        _oSelectedItem: null,

        onInit() {
            const oFlightJSONModel = new JSONModel();
            const oDataModel = this.getOwnerComponent().getModel();
            const sPath = "/Flight";
            const that = this;

            oDataModel.read(sPath, {
                sorters: [new sap.ui.model.Sorter("Carrname", false)],
                success(oresponse) {
                    oFlightJSONModel.setData(oresponse.results);
                    that.getView().setModel(oFlightJSONModel, "flightDataModel");
                },
                error(oError) {
                    // handle error if needed
                }
            });
        },

        // navigate to detail when row (not delete btn) is pressed
        onListItemPress(oEvent) {
            this.getOwnerComponent().getRouter().navTo("Detail", {
                Carrid: oEvent.getSource()
                    .getBindingContext("flightDataModel")
                    .getProperty().Carrid
            });
        },

        // table row selection (for update)
        onSelectionChange(oEvent) {
            this._oSelectedItem = oEvent.getParameter("listItem");
        },

        // --- CREATE DIALOG ----------------------------------------------------

          onAddNewRecord() {
            if (!this.oDialog) {
                this.loadFragment({
                    name: "flightui5ev.fragment.CreateAirline"
                }).then(function (oDialog) {
                    this.oDialog = oDialog;
                    this.getView().addDependent(this.oDialog);
                    this.oDialog.open();
                }.bind(this));
            } else {
                this.oDialog.open();
            }
        },

        onCreateNewRecord() {
            const sCarrId = this.byId("carrIDInput").getValue();
            if (!sCarrId) {
                MessageToast.show("Carrid must not be empty");
                return;
            }

            const mParams = {
                Carrid: this.byId("carrIDInput").getValue(),
                Carrname: this.byId("carrNameInput").getValue(),
                Currcode: this.byId("currCodeInput").getValue(),
                Url: this.byId("URLInput").getValue()
            };

            const oDataModel = this.getOwnerComponent().getModel();
            const that = this;
            this.oDialog.setBusy(true);

            oDataModel.callFunction("/create_airline", {
                method: "POST",
                urlParameters: mParams,
                success() {
                    that.oDialog.setBusy(false);
                    that.oDialog.close();
                    that.readFlight(that);
                    MessageToast.show("Airline created successfully");
                },
                error() {
                    that.oDialog.setBusy(false);
                    that.oDialog.close();
                    MessageToast.show("There was an error");
                }
            });
        },

        onCancelPressed() {
            this.oDialog.close();
        },

       readFlight(that) {
            const oFlightModel = that.getView().getModel("flightDataModel");
            const oDataModel = that.getOwnerComponent().getModel();
            const sPath = "/Flight";

            oDataModel.read(sPath, {
                sorters: [new sap.ui.model.Sorter("Carrname", false)],
                success(oresponse) {
                    oFlightModel.setData(oresponse.results);
                },
                error(oError) { },
            });
        },

        // --- UPDATE DIALOG ----------------------------------------------------

        onUpdateRecord() {
            if (!this._oSelectedItem) {
                MessageToast.show("Please select an airline to update");
                return;
            }

            const oCtx = this._oSelectedItem.getBindingContext("flightDataModel");

            if (!this.oUpdateDialog) {
                this.loadFragment({
                    name: "flightui5ev.fragment.Updatebutton"
                }).then(function (oDialog) {
                    this.oUpdateDialog = oDialog;
                    this.getView().addDependent(this.oUpdateDialog);

                    this.oUpdateDialog.setBindingContext(oCtx, "flightDataModel");
                    this.oUpdateDialog.open();
                }.bind(this));
            } else {
                this.oUpdateDialog.setBindingContext(oCtx, "flightDataModel");
                this.oUpdateDialog.open();
            }
        },

        onSaveUpdate() {
    // 1. Get current row data from the JSON model (flightDataModel)
    const oCtx = this.oUpdateDialog.getBindingContext("flightDataModel");
    const oRow = oCtx.getObject();

    // key and new values
    const sCarrid  = oRow.Carrid; // Key
    const sNewName = this.byId("updCarrNameInput").getValue();
    const sNewCurr = this.byId("updCurrCodeInput").getValue();
    const sNewUrl  = this.byId("updURLInput").getValue();

    // 2. Get the OData model (real backend model)
    const oODataModel = this.getOwnerComponent().getModel();
    const that = this;

    // 3. Build payload - property names must match your entity Flight
    const oPayload = {
        Carrid:        sCarrid,
        Carrname:      sNewName,
        Currcode:      sNewCurr,
        Url:           sNewUrl,
        IsActiveEntity: true   // important for RAP projections
    };

    // 4. Build the OData key path: /Flight(Carrid='XX',IsActiveEntity=true)
    const sPath = oODataModel.createKey("/Flight", {
        Carrid: sCarrid,
        IsActiveEntity: true
    });

    // 5. Call OData update
    this.oUpdateDialog.setBusy(true);

    oODataModel.update(sPath, oPayload, {
        merge: true,   // send only changed fields (PATCH-like)
        success() {
            that.oUpdateDialog.setBusy(false);
            that.oUpdateDialog.close();
            sap.m.MessageToast.show("Airline " + sCarrid + " updated");

            // 6. Reload data from backend into your JSON model
            that.readFlight(that);
        },
        error(oError) {
            that.oUpdateDialog.setBusy(false);
            sap.m.MessageToast.show("Error while updating airline");
            console.error("Update error:", oError);
        }
    });
},

        onCancelUpdate() {
            if (this.oUpdateDialog) {
                this.oUpdateDialog.close();
            }
        },

        // --- DELETE ROW -------------------------------------------------------

        onDeleteAirline(oEvent) {
    // Debug: make sure the handler is called
    console.log("onDeleteAirline fired");
    
    // Get the context directly from the button
    const oCtx = oEvent.getSource().getBindingContext("flightDataModel");

    if (!oCtx) {
        MessageToast.show("No binding context found for this row");
        console.error("Binding context is null. Check model name 'flightDataModel' and path in XML.");
        return;
    }

    const oRow = oCtx.getObject();
    const sCarrid = oRow.Carrid;

    console.log("Deleting airline with Carrid:", sCarrid);

    const oODataModel = this.getOwnerComponent().getModel();
    const that = this;

    oODataModel.callFunction("/Delete_Item_airline", {
        method: "POST", // or 'GET' depending on how function import is defined
        urlParameters: {
            Carrid: sCarrid
        },
        success() {
            MessageToast.show("Airline " + sCarrid + " deleted");
            that.readFlight(that);
        },
        error(oError) {
            MessageToast.show("Error while deleting airline");
            console.error("Delete error:", oError);
                
                }
            });
        }

    });
});
