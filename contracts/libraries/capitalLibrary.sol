//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./UserLibrary.sol";

library capitalLibrary {
    using UserLibrary for UserLibrary.User;
    struct capital {
        
        uint32 timeOfCreation;
        uint32 duration;
        uint64 pricePerShare;
        uint128 withdrawn;
        address tokenAddress;
    }
/**
    * @dev the function is used to set values of capital
    * 
    * Requirement:
    *   @param _tokenAddress is the address of the token created for a capital.
    *   @param _duration is the time period of the capital is to be active.
    *   @param _pricePerShare is the value of the token.
     */
    function _createCapital(
        capital storage self,
        address _tokenAddress,
        uint32 _duration,
        uint64 _pricePerShare
    ) internal returns (bool) {
        self.timeOfCreation = uint32(block.timestamp);
        self.tokenAddress = _tokenAddress;
        self.duration = _duration;
        self.pricePerShare = _pricePerShare;
        return true;
    }
    
}
