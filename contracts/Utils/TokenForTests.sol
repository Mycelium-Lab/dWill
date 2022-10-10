// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TokenForTests is ERC20 {

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 100000 * 10**18);
    }

}
