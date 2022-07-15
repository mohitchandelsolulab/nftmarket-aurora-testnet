// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarket is ERC721URIStorage {
    
    uint256 private _tokenIdCounter;

    struct Item {
        uint256 itemId;
        string name;
        string description;
        uint256 price;
        address owner;
        string tokenURI;
        bool forSale;
    }
    mapping(uint256 => Item) public items;

    constructor() ERC721("Anime", "ANM") {}

    function createToken(address to, string memory tokenURI, uint256 _tokenID) internal {
        _safeMint(to, _tokenID);
        _setTokenURI(_tokenID, tokenURI);
    }
    
    function listItem(
        string memory _name,
        string memory _desc,
        uint256 _price,
        string memory _tokenURI
    ) external {
        require(_price > 0, "price should be greater than 0");
        _tokenIdCounter = _tokenIdCounter + 1;
        uint256 id = _tokenIdCounter;
        createToken(msg.sender, _tokenURI, id);
        _transfer(msg.sender, address(this), id);
        items[id] = Item(id, _name, _desc, _price, msg.sender, _tokenURI, true);
    }

    function buyItem(uint256 _itemId) external payable{
        require(msg.sender != items[_itemId].owner, "Cant't buy own Item");
        require(items[_itemId].owner != address(0), "Don't Exist");
        address payable prevOwner = payable(items[_itemId].owner);
        items[_itemId].owner = msg.sender;
        items[_itemId].forSale = false;
        _transfer(address(this), msg.sender, _itemId);
        prevOwner.transfer(msg.value);
    }

    function resellItem(uint256 _itemId, uint256 _newSellingPrice) external{
        require(items[_itemId].owner != address(0), "Don't Exist");
        require(msg.sender == items[_itemId].owner, "Not allowed");
        items[_itemId].forSale = true;
        items[_itemId].price = _newSellingPrice;
        _transfer(msg.sender, address(this), _itemId);
    }

    function getSingleItem(uint256 _itemId) external view returns(Item[] memory){
        uint256 totalItems = _tokenIdCounter + 1;
        Item[] memory nft = new Item[](totalItems);
        Item storage item = items[_itemId];
        nft[_itemId] = item;
        return nft;
    }

    function getAllItemsForSale() external view returns (Item[] memory){
        uint256 totalItems = _tokenIdCounter + 1;
        Item[] memory nfts = new Item[](totalItems);
        for (uint i = 0; i < totalItems; i++) {
            if(items[i].forSale){
                Item storage item = items[i];
                nfts[i] = item;
            }
        }
        return nfts;
    }

    function getOwnedItems(address _owner) external view returns(Item[] memory){
        uint256 totalItems = _tokenIdCounter + 1;
        Item[] memory nfts = new Item[](totalItems);
        for (uint i = 1; i < totalItems; i++) {
            if(items[i].owner == _owner){
                Item storage item = items[i];
                nfts[i] = item;
            }
        }
        return nfts;
    }
}