//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface VCFEvents {
    event setKYCForUser(address user, uint256 emitTime);
    event revertKYCOfUser(address user, uint256 emitTime);
    event TokenMint(
        address ownerAddress,
        address tokenAddress,
        uint256 amount,
        string _name,
        string _symbol,
        uint256 _sharePrice,
        uint256 emitTime
    );
    event CapitalCreation(
        address user,
        uint256 capitalId,
        uint256 _duration,
        uint256 _mintAmount,
        uint256 emitTime
    );
    event investmentForCapital(
        address investor,
        address capitalOwner,
        address tokenAddress,
        uint256 investedAmount,
        uint256 emitTime
    );
    event capitalBalanceWithdrawn(
        address owner,
        address _tokenAddress,
        uint256 capitalId,
        uint256 amount,
        uint256 emitTime
    );
    event usdtBalanceWithdrawn(
        address owner,
        address _tokenAddress,
        uint256 capitalId,
        uint256 withdrawnAmount,
        uint256 emitTime
    );
}
