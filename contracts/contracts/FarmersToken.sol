// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @notice A basic contract that stores erc-721 farmers tokens.
 */
contract FarmersToken is ERC721URIStorage {
    struct Params {
        uint investmentAmount;
        address investmentToken;
        address investor;
        uint returnAmount;
        uint returnDate;
    }

    uint private _nextTokenId;
    mapping(uint tokenId => Params params) private _params;

    constructor() ERC721("Farmers Token", "FARMT") {}

    function create(
        uint investmentAmount,
        address investmentToken,
        string memory uri
    ) public {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        Params memory params;
        params.investmentAmount = investmentAmount;
        params.investmentToken = investmentToken;
        _params[tokenId] = params;
    }

    function setURI(uint tokenId, string memory uri) public {
        require(_ownerOf(tokenId) == msg.sender, "Not owner");
        _setTokenURI(tokenId, uri);
    }

    function makeInvestment(uint tokenId) public {
        // Check investor
        require(
            _params[tokenId].investor == address(0),
            "Already has investor"
        );
        // Check allowance
        require(
            IERC20(_params[tokenId].investmentToken).allowance(
                msg.sender,
                address(this)
            ) >= _params[tokenId].investmentAmount,
            "Insufficient allowance"
        );
        // Check balance
        require(
            IERC20(_params[tokenId].investmentToken).balanceOf(msg.sender) >=
                _params[tokenId].investmentAmount,
            "Insufficient balance"
        );
        // Send tokens to owner
        require(
            IERC20(_params[tokenId].investmentToken).transferFrom(
                msg.sender,
                _ownerOf(tokenId),
                _params[tokenId].investmentAmount
            ),
            "Failed to transfer"
        );
        // Update params
        _params[tokenId].investor = msg.sender;
    }

    function returnInvestment(uint tokenId, uint returnAmount) public {
        // Check owner
        require(_ownerOf(tokenId) == msg.sender, "Not owner");
        // Check investor
        require(_params[tokenId].investor != address(0), "No investor");
        // Check allowance
        require(
            IERC20(_params[tokenId].investmentToken).allowance(
                msg.sender,
                address(this)
            ) >= returnAmount,
            "Insufficient allowance"
        );
        // Check balance
        require(
            IERC20(_params[tokenId].investmentToken).balanceOf(msg.sender) >=
                returnAmount,
            "Insufficient balance"
        );
        // Send tokens to investor
        IERC20(_params[tokenId].investmentToken).transferFrom(
            msg.sender,
            _params[tokenId].investor,
            returnAmount
        );
        // Update params
        _params[tokenId].returnAmount = returnAmount;
        _params[tokenId].returnDate = block.timestamp;
    }

    function getNextTokenId() public view returns (uint nextTokenId) {
        return _nextTokenId;
    }

    function getParams(
        uint tokenId
    ) public view returns (Params memory params) {
        return _params[tokenId];
    }
}
