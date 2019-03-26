var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "pluck episode bubble crush dress kiss alien output cycle piano powder monster";


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: 5777 // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/d3fe47cdbf454c9584113d05a918694f")
      },
      network_id: 3,
      gas: 7003605,
      gasPrice: 100000000000,
    } 
  }
};
