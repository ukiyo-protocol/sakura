//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./upgradeability/CustomOwnable.sol";
import "./libraries/UserLibrary.sol";
import "./libraries/capitalLibrary.sol";
import "./interfaces/VCFEvents.sol";
import "./VCFERC20.sol";

contract VCF is CustomOwnable, VCFEvents {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using UserLibrary for UserLibrary.User;
    using capitalLibrary for capitalLibrary.capital;

    mapping(address => UserLibrary.User) public users;
    mapping(address => mapping(uint256 => capitalLibrary.capital))
        public capitalFund; //userAddress => capitalCount => CapitalFund

    //rinkeby tusdt
    // IERC20 usdt = IERC20(address(0xD92E713d051C37EbB2561803a3b5FBAbc4962431));

    /**
     *@dev this modifier is used to confirm that
     *@param _userAddress should complete the KYC process.
     */
    modifier _isKYCed(address _userAddress) {
        require(users[_userAddress].isKYCed, "VCF : User not completed KYC");
        _;
    }

    /**
     *@dev this modifier is used to confirm that
     *@param user should be the owner of token.
     *@param _tokenAddress is the address of the token.
     */
    modifier _isCreator(address user, address _tokenAddress) {
        require(
            users[user].capitalCreation[_tokenAddress],
            "VCF : User is not creator of this token"
        );
        _;
    }

    /**
     *@dev this function grants the KYC approval
     *@param _userAddress is the address of the user whose successfully completed KYC.
     */
    function approveKYC(address _userAddress) external onlyOwner {
        users[_userAddress]._approveKYC();
        emit setKYCForUser(_userAddress, block.timestamp);
    }

    /**
     *@dev this function revokes the KYC approval
     *@param _userAddress is the address of user whose KYC is to be revoked.
     */
    function revertKYC(address _userAddress) external onlyOwner {
        users[_userAddress]._revokeKYC();
        emit revertKYCOfUser(_userAddress, block.timestamp);
    }

    /**
     * @dev this function is create capital for approved idea.
     *
     * Requirement:
     *   @param _userAddress is the address of user whose idea is accepted.
     *   @param _duration is the time period in unix to fullfill the capital fund.
     *   @param _pricePerShare is the price of single unit of capital to be minted as tokens.
     *   @param _name is the name of token to be created
     *   @param _symbol is the symbol of the token to be created.
     *   @param _totalSupply is the supply to be minted.
     */
    function createCapital(
        uint256 _duration,
        uint256 _pricePerShare,
        uint256 _totalSupply,
        address _userAddress,
        string memory _name,
        string memory _symbol
    ) external onlyOwner _isKYCed(_userAddress) {
        require(_duration > 86400, "VCF: Duration Should be more than a day");
        require(_pricePerShare > 0, "VCF : price per share can't be zero");
        require(
            _totalSupply > 0,
            "VCF : Total Supply should be greater than zero"
        );
        VCFERC20 tokenContract = new VCFERC20(_name, _symbol, _totalSupply);
        uint256 duration = block.timestamp.add(_duration);
        users[_userAddress]._setCapitalCreation(address(tokenContract));
        capitalFund[_userAddress][users[_userAddress].capitalCount]
            ._createCapital(
                address(tokenContract),
                uint32(duration),
                uint64(_pricePerShare)
            );
        emit TokenMint(
            _userAddress,
            address(tokenContract),
            _totalSupply,
            _name,
            _symbol,
            _pricePerShare,
            block.timestamp
        );
        emit CapitalCreation(
            _userAddress,
            users[_userAddress].capitalCount,
            _duration,
            _totalSupply,
            block.timestamp
        );
    }

    /**
     * @dev this function is used to invest shares in a capital
     *  and recieve tokens in return.
     *
     * Requirement:
     *   @param _amountOfToken is the no.of unit to be bought.
     *   @param _capitalId is the id of the capital.
     *   @param _capitalOwnerAddress is the address of the owner of the capital.
     */
    function investInCapital(
        uint256 _amountOfToken,
        uint256 _capitalId,
        address _capitalOwnerAddress,
        address _tokenInvested
    ) external _isKYCed(msg.sender) {
        require(_amountOfToken > 0, "VCF : Should invest on atleast 1 unit");
        IERC20 token = IERC20(
            address(capitalFund[_capitalOwnerAddress][_capitalId].tokenAddress)
        );
        require(
            users[_capitalOwnerAddress].capitalCreation[address(token)],
            "VCF : No capital found"
        );
        require(
            token.balanceOf(address(this)) >= _amountOfToken,
            "VCF : No enough capital shares"
        );
        uint256 amount = _amountOfToken.mul(
            capitalFund[_capitalOwnerAddress][_capitalId].pricePerShare
        );
        require(
            IERC20(address(_tokenInvested)).balanceOf(msg.sender) >= amount,
            "VCF : Not enough balance"
        );

        users[msg.sender]._setInvestment(
            capitalFund[_capitalOwnerAddress][_capitalId].tokenAddress
        );
        IERC20(address(_tokenInvested)).safeTransferFrom(
            msg.sender,
            address(this),
            amount
        );
        token.safeTransfer(msg.sender, _amountOfToken);
        emit investmentForCapital(
            msg.sender,
            _capitalOwnerAddress,
            address(token),
            amount,
            block.timestamp
        );
    }

    /**
     * @dev this function is used to withdraw capital
     *  when the time period is reached
     *
     * Requirement:
     *   @param _tokenAddress is the address of the token to the capital.
     *   @param capitalId is the id of the capital.
     */
    function withdrawCapital(address _tokenAddress, uint256 capitalId)
        external
        _isCreator(msg.sender, _tokenAddress)
    {
        require(
            capitalFund[msg.sender][capitalId].duration < block.timestamp,
            "VCF : User did not reach the time period"
        );
        IERC20 token = IERC20(address(_tokenAddress));
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(msg.sender, balance);
        emit capitalBalanceWithdrawn(
            msg.sender,
            _tokenAddress,
            capitalId,
            balance,
            block.timestamp
        );
    }

    /**
     * @dev this function is used to mint tokens
     *
     * Requirement:
     *   @param _tokenAddress is the address of the token to the capital.
     *   @param amount is supply to be minted.
     */
    function mintToken(address _tokenAddress, uint256 amount)
        external
        _isCreator(msg.sender, _tokenAddress)
    {
        require(amount > 0, "VCF : Mint amount can't be zero");
        VCFERC20 token = VCFERC20(address(_tokenAddress));
        token.mint(address(this), amount);
    }

    /**
     * @dev this function is used to burn tokens
     *
     * Requirement:
     *   @param _tokenAddress is the address of the token to the capital.
     *   @param amount is supply to be burned.
     */
    function burnToken(address _tokenAddress, uint256 amount)
        external
        _isCreator(msg.sender, _tokenAddress)
    {
        require(amount > 0, "VCF : Burn amount can't be zero");
        VCFERC20 token = VCFERC20(address(_tokenAddress));
        token.burn(address(this), amount);
    }

    /**
     * @dev this function is used to get balance of token
     *
     * Requirement:
     *   @param _tokenAddress is the address of the token to the capital.
     *   @param _user is the address of the user.
     */
    function capitalBalance(address _tokenAddress, address _user)
        external
        view
        returns (uint256)
    {
        VCFERC20 token = VCFERC20(address(_tokenAddress));
        return token.balanceOf(_user);
    }

    /**
     * @dev this function is used to withdraw USDT
     *  when the time period is reached
     *
     * Requirement:
     *   @param _tokenAddress is the address of the token to the capital.
     *   @param capitalId is the id of the capital.
     */
    function withdrawUSDT(
        address _tokenAddress,
        uint256 capitalId,
        address _tokenInvested
    ) external _isCreator(msg.sender, _tokenAddress) {
        require(
            capitalFund[msg.sender][capitalId].duration < block.timestamp,
            "VCF : User did not reach the time period"
        );
        IERC20 token = IERC20(address(_tokenAddress));
        uint256 amount = token.totalSupply().sub(
            token.balanceOf(address(this))
        );
        uint256 withdrawAmount = (
            amount.sub(capitalFund[msg.sender][capitalId].withdrawn)
        ).mul(capitalFund[msg.sender][capitalId].pricePerShare);
        capitalFund[msg.sender][capitalId].withdrawn = uint128(amount);
        IERC20(address(_tokenInvested)).safeTransfer(
            msg.sender,
            withdrawAmount
        );
        emit usdtBalanceWithdrawn(
            msg.sender,
            _tokenAddress,
            capitalId,
            withdrawAmount,
            block.timestamp
        );
    }
}
