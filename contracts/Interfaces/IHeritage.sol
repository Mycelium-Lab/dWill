// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

interface IHeritage {

    struct InheritanceData {
        uint256 ID;
        address owner;
        address heir;
        address token; 
        uint256 timeWhenWithdraw; 
        uint256 amount;
        bool done;
    }
    
    event AddAnHeir(
        uint256 ID,
        address heir,
        address token,
        uint256 timeWhenWithdraw, 
        uint256 amount
    );

    event Withdraw(uint256 ID, uint256 timeWhenWithdrawn);

}