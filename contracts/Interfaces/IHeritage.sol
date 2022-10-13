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
        address owner,
        address heir,
        address token,
        uint256 timeWhenWithdraw, 
        uint256 amount
    );

    event UpdateWillTimeWhenWithdraw(
        uint256 ID,
        address owner,
        address heir,
        uint256 newTime
    );

    event UpdateAnHeir(
        uint256 ID,
        address owner,
        address newHeir
    );

    event RemoveWill(
        uint256 ID,
        address owner,
        address heir
    );

    event Withdraw(
        uint256 ID, 
        address owner, 
        address heir, 
        uint256 timeWhenWithdrawn
    );

}