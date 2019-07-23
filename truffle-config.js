var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "...";


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
        return new HDWalletProvider(mnemonic, "ropsten.infura.io/v3/d3fe47cdbf454c...")
      },
      network_id: 3
    },
    sokol: {
      provider: function() {
            return new HDWalletProvider(mnemonic, "https://sokol.poa.network")
      },
      network_id: 77,
      gasPrice: 1000000000
    }
  }
};
