var autobioApp = new Vue({
    el: "#autobio-container",


    data: {
        autobio: new autobio_module.Autobio(),
        activePane: 'identity',


        // Inputs
        identitySeedInput: "autobio",
        identitySeedInput1: "",
        identitySeedInput2: "",
        assetName: "",
        assetDescription: "",
        assetGenre: "",
        actionInput1: "",
        actionInput2: "",
        otherFirmInput: "",
        search_t : "",
        myAssets : "",
        activeTransaction: {
            "asset": {
                "data": {
                    "item": "Loading..."
                }
            }
        },
        //

        // Assets
        transactionIds: new Array(),
        assets: new Array(),
        transactionsForAsset: new Array(),
        allAssets: new Array(),
            searchedBooks: new Array(),
        // Flag
        myAssets: false,
    },

    
    methods: {
        setActive(pane) {
            this.activePane = pane;
        },
        isActive(pane) {
            return this.activePane == pane;
        },
        getAssets() {
            return this.assets;
        },


        // Forms
        identityButtonClicked() {
            console.log("inside identityButtonClicked");
            this.identitySeedInput=this.identitySeedInput1+this.identitySeedInput2;
            this.autobio.currentIdentity = this.autobio.generateKeypair(this.identitySeedInput);
            console.log(this.identitySeedInput);
            console.log(this.autobio.currentIdentity.publicKey);
            //window.location.href = 'http://localhost:3000/login';
            
            //res.sendFile("C:/autobioscrypt/autobio_bigchain_ftf/FarmToFork-master/index.html");
        },
        /*identityButtonClicked1() {
            console.log("inside identityButtonClicked1");
            console.log(this.identitySeedInput);
            this.autobio.currentIdentity = this.autobio.generateKeypair(this.identitySeedInput);
        },*/
        assetButtonClicked() {
            if (this.assetInput == "") return;
            this.autobio.createAsset(this.assetName,this.assetDescription,this.assetGenre).then(response => {
                
                console.log("New asset added.");
                // Do nothing, just reload the asset list.
                autobioApp.loadAssetsIds();
            });
        },

       /* previewButtonClicked(id,myAssets) {
            
               
            console.log("inside preview clicked");
            this.myAssets = myAssets;
            this.autobio.connection.getTransaction(id).then(response => autobioApp.activeTransaction = response);
            this.loadTransactionsForAsset(id);
            this.setActive('transactions');

            this.actionInput1;
            this.actionInput2;
            
       
            
        },*/



        // Menu
        menuClicked(link) {

            switch (link) {
                case "identity":
                    this.activePane = "identity";
                    break;

                case "assets":
                    console.log("In case ASSETS!!!");
                    this.loadAssetsIds();
                    this.activePane = "assets";
                    break;

                case "all-assets":
                    console.log("In case All assets");
                    this.loadAllAssets();
                    this.activePane = "all-assets";
                    break;

                case "search":
                    console.log("In case search");
                    
                    this.searchClicked();
                    this.activePane= "search";
                    break;
            }
        },

        // Loading assets
        loadAssetsIds() {
                    console.log("In method loadAssetsIds!!!");
            this.autobio.getAssets().then(response => {
                autobioApp.transactionIds = response;
                autobioApp.loadAssetsFromTransactionIds();
            });

        },
        loadAllAssets() {
            this.autobio.getAllAssets().then( response => {
                autobioApp.allAssets = response;
            });
        },
        loadAssetsFromTransactionIds() {

            this.assets = new Array();

            for (let transaction of this.transactionIds) {
                this.autobio.connection.getTransaction(transaction.transaction_id).then(response => {
                    if (response.operation == 'CREATE') return autobioApp.autobio.connection.listTransactions(response.id, 'CREATE');
                    return autobioApp.autobio.connection.listTransactions(response.asset.id, 'CREATE');
                }).then(responseCreate => {
                    autobioApp.assets.push(responseCreate[0]);
                }).catch(err => {
                    console.log(transaction.transaction_id);
                })
            }
        },
        
        transactionClicked(id, myAssets) {
            console.log("inside transaction clicked");
            this.myAssets = myAssets;
            this.autobio.connection.getTransaction(id).then(response => autobioApp.activeTransaction = response);
            this.loadTransactionsForAsset(id);
            this.setActive('transactions');
        },

        loadTransactionsForAsset(assetId) {

            this.autobio.connection.listTransactions(assetId).then(response => autobioApp.transactionsForAsset = response);
        },
        actionButtonClicked() {
            this.autobio.connection.listTransactions(this.activeTransaction.id).then(response => {
                
                var a=autobioApp.actionInput1+"\n\n"+autobioApp.actionInput2+"";
                console.log(a);
                return autobioApp.autobio.updateAsset(response[response.length - 1],autobioApp.actionInput1,autobioApp.actionInput2 );
            }).then(response => {
                autobioApp.loadTransactionsForAsset(autobioApp.activeTransaction.id);
            });
        },

        
        searchClicked() {
            //console.log(autobioApp.search_t);
            console.log("inside transaction search clicked");
            //console.log(search_key);
            this.autobio.searchBook(autobioApp.search_t);
            //this.loadAllAssets();

           //this.myAssets = myAssets;
            /*this.autobio.connection.getTransaction(id).then(response => autobioApp.activeTransaction = response);
            this.loadTransactionsForAsset(id);
            this.setActive('transactions');*/
 
        },

        otherFirmButtonClicked() {
            this.autobio.connection.listTransactions(this.activeTransaction.id).then(response => {
                return this.autobio.transferAsset(response[response.length -1], autobioApp.autobio.generateKeypair(autobioApp.otherFirmInput).publicKey);
            }).then( response => {
                // Don't do anything with the response, go back to asset overview.
                autobioApp.menuClicked('assets');
            });
        },
    }
});