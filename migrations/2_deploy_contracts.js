const ColorTokenERC721 = artifacts.require('ColorTokenERC721');

module.exports = function (deployer) {
  deployer.deploy(ColorTokenERC721, 'ColorToken', 'CT').then(() => {
    console.log('VXERC20 contract address is: ', ColorTokenERC721.address);
  });
};
