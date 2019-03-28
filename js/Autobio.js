// Require dependencies.
const driver = require('bigchaindb-driver');
const bip39 = require('bip39');

// Require the dotenv library.


class Autobio{


    /**
     * Initialise a new class that we'll use to handle our connection with the network.
     */
    constructor() {
        console.log("inside constructor");
        /* // Initialise a new connection.
        this.connection = new driver.Connection(process.env.APP_URL, {
            app_id: dotenv.env.APP_ID,
            app_key: dotenv.env.APP_KEY
        }); */
        //this.connection = new driver.Connection(process.env.APP_URL);

        this.connection = new driver.Connection('https://test.bigchaindb.com/api/v1/');

        //this.connection.app_key= 'd800db54';
        //this.connection.app_id='1nst44d530ba894e7a7c92999b180ea89b7';

        //console.log("app_key===="+this.connection.app_key);
        //console.log("app_id===="+this.connection.app_id);
        
        //var identitySeedInput=this.identitySeedInput1+this.identitySeedInput2;
        //console.log(identitySeedInput);
        //this.currentIdentity = this.generateKeypair("autobio");
        //console.log("current identity= "+this.currentIdentity.publicKey);
    }

    // Here we'll write our methods.

    /**
     * Generate a keypair based on the supplied seed string.
     * @param {string} keySeed - The seed that should be used to generate the keypair.
     * @returns {*} The generated keypair.
     */
    generateKeypair(keySeed) {
        if (typeof keySeed == "undefined" || keySeed == "") return new driver.Ed25519Keypair();
        //for
        //if(keySeed=="")
        return new driver.Ed25519Keypair(bip39.mnemonicToSeed(keySeed).slice(0, 32));
    }

    createAsset(name,description,genre) {

        return new Promise((resolve, reject) => {

            // Create asset object.
            const assetData = {
                "type": "AutobioAsset",
                "bookname": name,
                "description":description,
                "genre":genre,
                

            };

            // Create metadata object.
            const metaData = {
                "action": "Introduced",
                "action2": "",
                "date": new Date().toISOString(),
            };

            // Create a CREATE transaction.
            const introduceBooksToMarketTransaction = driver.Transaction.makeCreateTransaction(

                // Include the foodItem as asset data.
                assetData,
                // Include metadata to give information on the action.
                metaData,
                // Create an output.
                [driver.Transaction.makeOutput(
                    driver.Transaction.makeEd25519Condition(this.currentIdentity.publicKey))],
                // Include the public key
                this.currentIdentity.publicKey
            );

            // We sign the transaction
            const signedTransaction = driver.Transaction.signTransaction(introduceBooksToMarketTransaction, this.currentIdentity.privateKey);

            // Post the transaction to the network
            this.connection.postTransactionCommit(signedTransaction).then(postedTransaction => {

                // Let the promise resolve the created transaction.
                resolve(postedTransaction);

                // Catch exceptions
            }).catch(err => {

                reject(err);
            })
        });

    }

    /**
     * Get a list of ids of unspent transactions for a certain public key.
     * @returns {Array} An array containing all unspent transactions for a certain public key.
     */
    getAssets() {
        console.log("in method getAssets!!!");
        return new Promise((resolve, reject) => {
            console.log(this.currentIdentity);
            console.log("Printing currentIdentity-----"+this.currentIdentity.publicKey);
            // Get a list of ids of unspent transactions from a public key.
            this.connection.listOutputs(this.currentIdentity.publicKey, false).then(response => {

                resolve(response);
            });
        }).catch(err => {
            reject(err);
        })

    }

    searchBook(search_t)
    {

        console.log(search_t);
        this.connection.searchAssets('AutobioAsset')
        .then(response => {
            var obj=JSON.stringify(response);
            var txt="";
            for (var x in obj) {
                txt +=obj[x].bookname;
                
            }
            console.log(txt);
            
        });


        


    }
        /**
     * Get a list of all assets that belong to our POC. (they contain the string 'FtfTutorialAsset)
     * 
     * @returns {Array} The array of all assets that belong to our POC.
     */
    getAllAssets() {
        console.log("in getAllAssets");
        return new Promise((resolve, reject) => {

            this.connection.searchAssets('AutobioAsset').then(response => {
                resolve(response);
            });

        }).catch(error => {
            reject(error);
        })
    }

    /**
     * Load a transaction by using its transaction id.
     * @param {*} transactionId 
     */
    loadTransaction(transactionId) {
        return new Promise((resolve, reject) => {

            // Get the transaction by its ID.
            this.connection.getTransaction(transactionId).then(response => {
                resolve(response);
            }).catch(err => {
                reject(err);
            })
        });
    }

    /**
     * Update the asset by issuing a TRANSFER transaction with metadata containing the action performed on the asset.
     * 
     * @param {*} transaction - The transaction that needs to be chained upon.
     * @param {*} action - The action performed on the asset (e.g. processed with preservative).
     */
    updateAsset(transaction, action1,action2) {

        return new Promise((resolve, reject) => {

            console.log(transaction);

            // Create metadata for action.
            const metaData = {
                "action": action1,
                "action2": action2,
                "date": new Date().toISOString()
            };

            // Create a new TRANSFER transaction.
            const updateAssetTransaction = driver.Transaction.makeTransferTransaction(

                // previous transaction.
                [{ tx: transaction, output_index: 0 }],

                // Create new output.
                [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(this.currentIdentity.publicKey))],

                // Add metadata.
                metaData
            )

            // Sign new transaction.
            const signedTransaction = driver.Transaction.signTransaction(updateAssetTransaction, this.currentIdentity.privateKey);

            console.log("Posting transaction.");
            // Post the new transaction.
            this.connection.postTransactionCommit(signedTransaction).then(postedTransaction => {

                // Return the posted transaction to the callback function.
                resolve(postedTransaction);

            }).catch(err => {
                reject(err);
            });
        });

    }

    /**
     * Transfer an asset to another owner by using his/her/its public key.
     * 
     * @param {*} transaction - The transaction that needs to be chained upon.
     * @param {*} receiverPublicKey - The public key of the receiver.
     */
    transferAsset(transaction, receiverPublicKey) {

        return new Promise((resolve, reject) => {

            // Construct metadata.
            const metaData = {
                "action": "chaptername",
                "action2": "page content",
                "date": new Date().toISOString()
            };

            // Construct the new transaction
            const transferTransaction = driver.Transaction.makeTransferTransaction(

                // The previous transaction to be chained upon.
                [{ tx: transaction, output_index: 0 }],

                // The (poutput) condition to be fullfilled in the next transaction.
                [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(receiverPublicKey))],

                // Metadata
                metaData
            );

            // Sign the new transaction.
            const signedTransaction = driver.Transaction.signTransaction(transferTransaction, this.currentIdentity.privateKey);

            // Post the transaction.
            this.connection.postTransactionCommit(signedTransaction).then(successfullyPostedTransaction => {

                // Return the posted transaction to the callback funcion.
                resolve(successfullyPostedTransaction);

            }).catch(error => {

                // Throw error
                reject(error);
            })

        });
    }
}

// Create exports to make some functionality available in the browser.

module.exports = {
    Autobio
}