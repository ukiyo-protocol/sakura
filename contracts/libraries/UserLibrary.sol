//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

library UserLibrary {
    struct User {
        uint64 registrationTime;
        uint64 capitalCount;
        uint128 investmentCount;
        bool isKYCed;
        mapping(address => bool) investment;
        mapping(address => bool) capitalCreation;
    }

    /**
     * @dev this function is used to get information about user existance
     * send true if yes else false
     */
    function _exists(User storage self) internal view returns (bool) {
        return self.registrationTime != uint256(0);
    }

    /**
     * @dev this function is used to set KYC
     */

    function _approveKYC(User storage self) internal {
        self.isKYCed = true;
    }

    /**
     * @dev this function is used to revoke the kyc
     */

    function _revokeKYC(User storage self) internal {
        if (self.isKYCed == true) {
            self.isKYCed = false;
        }
    }

    /**
     * @dev this function is used create capital to user
     * @param _tokenAddress is the address of token to set true
     */

    function _setCapitalCreation(User storage self, address _tokenAddress)
        internal
    {
        self.capitalCount++;
        self.capitalCreation[_tokenAddress] = true;
    }

    /**
     * @dev this function is used to make investment for user
     * @param _tokenAddress is the address of token to set true
     */
    function _setInvestment(User storage self, address _tokenAddress) internal {
        self.investmentCount++;
        self.investment[_tokenAddress] = true;
    }

    /**
     * @dev this function is used to revoke the capital
     * @param _tokenAddress is the address of token to set false
     */

    function _revokeCapitalCreation(User storage self, address _tokenAddress)
        internal
    {
        if (self.capitalCreation[_tokenAddress] = true) {
            self.capitalCreation[_tokenAddress] = false;
        }
    }
}
