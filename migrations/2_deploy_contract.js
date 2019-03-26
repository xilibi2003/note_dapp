var Note = artifacts.require("./NoteContract.sol");

module.exports = function(deployer) {
  deployer.deploy(Note);
};
