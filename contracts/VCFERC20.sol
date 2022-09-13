// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./upgradeability/CustomOwnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";


contract VCFERC20 is ERC20, CustomOwnable {

    constructor(
        string memory _name,
        string memory _symbol,
        uint _totalSupply
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, _totalSupply*(10**uint(decimals())));
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
    function burn(address to, uint256 amount) public {
        _burn(to, amount);
    }
 
}
