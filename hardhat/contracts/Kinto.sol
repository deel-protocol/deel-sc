// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;


contract Kinto {

    // function initialize() external initializer {
    //
    // }

    function isKYC(address _address) external view returns (bool) {
        return true;
    }

    function isSanctionsSafe(address _account) external view returns (bool) {
        return true;
    }

    function isSanctionsSafeIn(address _account, uint16 _countryId) external view returns (bool) {
        return true;
    }

    function isCompany(address _account) external view returns (bool) {
        return true;
    }

    function isIndividual(address _account) external view returns (bool) {
        return true;
    }

    function hasTrait(address _account, uint16 _traitId) external view returns (bool) {
        return true;
    }

    // function hasTraits(address account, uint16[] memory _traitIds) public view returns (bool[] memory) {
    //     return true;
    // }
    //
    // function getCountry(address account) external view returns (uint16) {
    // }
    //
    // function getWalletOwners(address _wallet) public view returns (address[] memory owners) {
    // }
    //
    // function getUserInfo(address _account, address payable _wallet) external view returns (IKYCViewer.UserInfo memory info) {
    // }
    //
    // function getDevApps(address _wallet) external view returns (IKintoAppRegistry.Metadata[] memory) {
    // }
    //
    // function getBalances(address[] memory tokens, address target) external view returns (uint256[] memory balances) {
    // }

}
