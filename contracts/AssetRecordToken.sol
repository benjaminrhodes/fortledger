// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title FortLedger Asset Record Token
/// @notice Transfer-disabled record of one digital property-record manifest.
///         legal_title and investment_rights are false. This token does not
///         confer land ownership, equity, debt, rent, securities, or any
///         other investment right. Source documents stay off-chain.
contract AssetRecordToken {
    string public constant name = "FortLedger Asset Record";
    string public constant symbol = "FLREC";
    string public constant RECORD_TYPE = "digital_property_record_manifest";
    string public constant TRANSFER_POLICY = "disabled";
    bool public constant LEGAL_TITLE = false;
    bool public constant INVESTMENT_RIGHTS = false;

    address public immutable issuer;
    uint256 public nextTokenId = 1;

    struct Record {
        string assetId;
        string recordVersion;
        string manifestHash;
        string manifestUri;
    }

    mapping(uint256 => Record) private records;
    mapping(uint256 => address) private owners;
    mapping(address => uint256) private balances;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event RecordAnchored(uint256 indexed tokenId, string assetId, string recordVersion, string manifestHash);

    error UnauthorizedIssuer();
    error TransfersDisabled();
    error TokenDoesNotExist();
    error ZeroAddress();
    error EmptyCommitment();

    constructor(address issuer_) {
        if (issuer_ == address(0)) revert ZeroAddress();
        issuer = issuer_;
    }

    function mint(
        address to,
        string calldata assetId,
        string calldata recordVersion,
        string calldata manifestHash,
        string calldata manifestUri
    ) external returns (uint256 tokenId) {
        if (msg.sender != issuer) revert UnauthorizedIssuer();
        if (to == address(0)) revert ZeroAddress();
        if (bytes(assetId).length == 0 || bytes(recordVersion).length == 0 || bytes(manifestHash).length == 0) {
            revert EmptyCommitment();
        }

        tokenId = nextTokenId++;
        owners[tokenId] = to;
        balances[to] += 1;
        records[tokenId] = Record(assetId, recordVersion, manifestHash, manifestUri);

        emit Transfer(address(0), to, tokenId);
        emit RecordAnchored(tokenId, assetId, recordVersion, manifestHash);
    }

    function getRecord(uint256 tokenId)
        external
        view
        returns (
            string memory assetId,
            string memory recordVersion,
            string memory manifestHash,
            string memory manifestUri,
            bool legalTitle,
            bool investmentRights,
            string memory transferPolicy
        )
    {
        Record storage record = records[tokenId];
        if (bytes(record.assetId).length == 0) revert TokenDoesNotExist();
        return (
            record.assetId,
            record.recordVersion,
            record.manifestHash,
            record.manifestUri,
            false,
            false,
            TRANSFER_POLICY
        );
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = owners[tokenId];
        if (owner == address(0)) revert TokenDoesNotExist();
        return owner;
    }

    function balanceOf(address account) external view returns (uint256) {
        if (account == address(0)) revert ZeroAddress();
        return balances[account];
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        if (owners[tokenId] == address(0)) revert TokenDoesNotExist();
        return records[tokenId].manifestUri;
    }

    function approve(address, uint256) external pure {
        revert TransfersDisabled();
    }

    function setApprovalForAll(address, bool) external pure {
        revert TransfersDisabled();
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        if (owners[tokenId] == address(0)) revert TokenDoesNotExist();
        return address(0);
    }

    function isApprovedForAll(address, address) external pure returns (bool) {
        return false;
    }

    function transferFrom(address, address, uint256) external pure {
        revert TransfersDisabled();
    }

    function safeTransferFrom(address, address, uint256) external pure {
        revert TransfersDisabled();
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert TransfersDisabled();
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 || interfaceId == 0x80ac58cd || interfaceId == 0x5b5e139f;
    }
}
