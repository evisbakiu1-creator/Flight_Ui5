sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, MessageToast, JSONModel, Spreadsheet, exportLibrary, Filter, FilterOperator) => {
    "use strict";

    const EdmType = exportLibrary.EdmType;

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

                }
            });
        },

        // DOWNLOAD TO EXCEL

       onExport() {
    const oTable = this.byId("_IDGenTable1");
    const oBinding = oTable.getBinding("items");

    if (!oBinding) {
        MessageToast.show("No data to export");
        return;
    }

    // 
    const aContexts = oBinding.getCurrentContexts();
    const aData = aContexts.map(function (oCtx) {
        return oCtx.getObject();
    });

    if (!aData || !aData.length) {
        MessageToast.show("Table is empty");
        return;
    }

    const aCols = this._createColumnConfig();
    const oSettings = {
        workbook: {
            columns: aCols
        },
        dataSource: aData,
        fileName: "Airlines.xlsx"
    };

    const oSheet = new Spreadsheet(oSettings);
    oSheet.build().finally(function () {
        oSheet.destroy();
    });
},

        _createColumnConfig() {
            return [
                {
                    label: "Airline ID",
                    property: "Carrid",
                    type: EdmType.String
                },
                {
                    label: "Airline Name",
                    property: "Carrname",
                    type: EdmType.String
                },
                {
                    label: "Currency",
                    property: "Currcode",
                    type: EdmType.String
                },
                {
                    label: "URL",
                    property: "Url",
                    type: EdmType.String
                }
            ];
        },


        onListItemPress(oEvent) {
            this.getOwnerComponent().getRouter().navTo("Detail", {
                Carrid: oEvent.getSource()
                    .getBindingContext("flightDataModel")
                    .getProperty().Carrid
            });
        },


        onSelectionChange(oEvent) {
            this._oSelectedItem = oEvent.getParameter("listItem");
        },

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
                error(oError) { }
            });
        },

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

            const oCtx = this.oUpdateDialog.getBindingContext("flightDataModel");
            const oRow = oCtx.getObject();


            const sCarrid = oRow.Carrid; // Key
            const sNewName = this.byId("updCarrNameInput").getValue();
            const sNewCurr = this.byId("updCurrCodeInput").getValue();
            const sNewUrl = this.byId("updURLInput").getValue();


            const oODataModel = this.getOwnerComponent().getModel();
            const that = this;


            const oPayload = {
                Carrid: sCarrid,
                Carrname: sNewName,
                Currcode: sNewCurr,
                Url: sNewUrl,
                IsActiveEntity: true
            };

            const sPath = oODataModel.createKey("/Flight", {
                Carrid: sCarrid,
                IsActiveEntity: true
            });

            this.oUpdateDialog.setBusy(true);

            oODataModel.update(sPath, oPayload, {
                merge: true,
                success() {
                    that.oUpdateDialog.setBusy(false);
                    that.oUpdateDialog.close();
                    sap.m.MessageToast.show("Airline " + sCarrid + " updated");


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

        onDeleteAirline(oEvent) {
            console.log("onDeleteAirline fired");

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
                method: "POST",
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
        },

        onSearchAirline(oEvent) {
            const sQuery = oEvent.getSource().getValue();
            const oTable = this.byId("_IDGenTable1");
            const oBinding = oTable.getBinding("items");

            if (!sQuery) {
                oBinding.filter([]);
                return;
            }

            const aFilters = [
                new Filter("Carrid",   FilterOperator.Contains, sQuery),
                new Filter("Carrname", FilterOperator.Contains, sQuery)
            ];

            const oCombinedFilter = new Filter({
                filters: aFilters,
                and: false 
            });

            oBinding.filter(oCombinedFilter);
        }

    });
});
