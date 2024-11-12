// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {
    uint256 public tokenId;

    constructor() ERC721("NFT", "NFT") {
        tokenId = 0;
    }

    function mint() public {
        _mint(msg.sender, tokenId);
        tokenId++;
    }
}
