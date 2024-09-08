pragma solidity ^0.8.19;

interface IWETH9 {

    function allowance(address, address) external returns(uint256);
    function approve(address guy, uint256 wad) external returns (bool);
    function balanceOf(uint256) external returns(uint256);
    function decimals() external returns(uint8);
    function deposit() external payable;
    function name() external  returns(string memory);
    function symbol() external  returns(string memory);
    function totalSupply() external view returns (uint256);
    function transfer(address dst, uint256 wad) external returns (bool);
    function transferFrom( address src, address dst, uint256 wad) external returns (bool) ;
    function withdraw(uint256 wad) external;

    receive() external payable;
}
