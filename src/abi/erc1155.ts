export default { abi: [{ type: 'constructor', payable: false, inputs: [{ type: 'string', name: 'uri' }] }, { type: 'event', anonymous: false, name: 'ApprovalForAll', inputs: [{ type: 'address', name: 'account', indexed: true }, { type: 'address', name: 'operator', indexed: true }, { type: 'bool', name: 'approved', indexed: false }] }, { type: 'event', anonymous: false, name: 'RoleAdminChanged', inputs: [{ type: 'bytes32', name: 'role', indexed: true }, { type: 'bytes32', name: 'previousAdminRole', indexed: true }, { type: 'bytes32', name: 'newAdminRole', indexed: true }] }, { type: 'event', anonymous: false, name: 'RoleGranted', inputs: [{ type: 'bytes32', name: 'role', indexed: true }, { type: 'address', name: 'account', indexed: true }, { type: 'address', name: 'sender', indexed: true }] }, { type: 'event', anonymous: false, name: 'RoleRevoked', inputs: [{ type: 'bytes32', name: 'role', indexed: true }, { type: 'address', name: 'account', indexed: true }, { type: 'address', name: 'sender', indexed: true }] }, { type: 'event', anonymous: false, name: 'TransferBatch', inputs: [{ type: 'address', name: 'operator', indexed: true }, { type: 'address', name: 'from', indexed: true }, { type: 'address', name: 'to', indexed: true }, { type: 'uint256[]', name: 'ids', indexed: false }, { type: 'uint256[]', name: 'values', indexed: false }] }, { type: 'event', anonymous: false, name: 'TransferSingle', inputs: [{ type: 'address', name: 'operator', indexed: true }, { type: 'address', name: 'from', indexed: true }, { type: 'address', name: 'to', indexed: true }, { type: 'uint256', name: 'id', indexed: false }, { type: 'uint256', name: 'value', indexed: false }] }, { type: 'event', anonymous: false, name: 'URI', inputs: [{ type: 'string', name: 'value', indexed: false }, { type: 'uint256', name: 'id', indexed: true }] }, { type: 'function', name: 'DEFAULT_ADMIN_ROLE', constant: true, stateMutability: 'view', payable: false, inputs: [], outputs: [{ type: 'bytes32', name: '' }] }, { type: 'function', name: 'MINTER_ROLE', constant: true, stateMutability: 'view', payable: false, inputs: [], outputs: [{ type: 'bytes32', name: '' }] }, { type: 'function', name: 'balanceOf', constant: true, stateMutability: 'view', payable: false, inputs: [{ type: 'address', name: 'account' }, { type: 'uint256', name: 'id' }], outputs: [{ type: 'uint256', name: '' }] }, { type: 'function', name: 'balanceOfBatch', constant: true, stateMutability: 'view', payable: false, inputs: [{ type: 'address[]', name: 'accounts' }, { type: 'uint256[]', name: 'ids' }], outputs: [{ type: 'uint256[]', name: '' }] }, { type: 'function', name: 'burn', constant: false, payable: false, inputs: [{ type: 'address', name: 'account' }, { type: 'uint256', name: 'id' }, { type: 'uint256', name: 'value' }], outputs: [] }, { type: 'function', name: 'burnBatch', constant: false, payable: false, inputs: [{ type: 'address', name: 'account' }, { type: 'uint256[]', name: 'ids' }, { type: 'uint256[]', name: 'values' }], outputs: [] }, { type: 'function', name: 'getRoleAdmin', constant: true, stateMutability: 'view', payable: false, inputs: [{ type: 'bytes32', name: 'role' }], outputs: [{ type: 'bytes32', name: '' }] }, { type: 'function', name: 'getRoleMember', constant: true, stateMutability: 'view', payable: false, inputs: [{ type: 'bytes32', name: 'role' }, { type: 'uint256', name: 'index' }], outputs: [{ type: 'address', name: '' }] }, { type: 'function', name: 'getRoleMemberCount', constant: true, stateMutability: 'view', payable: false, inputs: [{ type: 'bytes32', name: 'role' }], outputs: [{ type: 'uint256', name: '' }] }, { type: 'function', name: 'grantRole', constant: false, payable: false, inputs: [{ type: 'bytes32', name: 'role' }, { type: 'address', name: 'account' }], outputs: [] }, { type: 'function', name: 'hasRole', constant: true, stateMutability: 'view', payable: false, inputs: [{ type: 'bytes32', name: 'role' }, { type: 'address', name: 'account' }], outputs: [{ type: 'bool', name: '' }] }, { type: 'function', name: 'isApprovedForAll', constant: true, stateMutability: 'view', payable: false, inputs: [{ type: 'address', name: 'account' }, { type: 'address', name: 'operator' }], outputs: [{ type: 'bool', name: '' }] }, { type: 'function', name: 'mint', constant: false, payable: false, inputs: [{ type: 'address', name: 'account' }, { type: 'uint256', name: 'id' }, { type: 'uint256', name: 'amount' }, { type: 'bytes', name: 'data' }], outputs: [] }, { type: 'function', name: 'mintBatch', constant: false, payable: false, inputs: [{ type: 'address', name: 'account' }, { type: 'uint256[]', name: 'ids' }, { type: 'uint256[]', name: 'amounts' }, { type: 'bytes', name: 'data' }], outputs: [] }, { type: 'function', name: 'renounceRole', constant: false, payable: false, inputs: [{ type: 'bytes32', name: 'role' }, { type: 'address', name: 'account' }], outputs: [] }, { type: 'function', name: 'revokeRole', constant: false, payable: false, inputs: [{ type: 'bytes32', name: 'role' }, { type: 'address', name: 'account' }], outputs: [] }, { type: 'function', name: 'safeBatchTransferFrom', constant: false, payable: false, inputs: [{ type: 'address', name: 'from' }, { type: 'address', name: 'to' }, { type: 'uint256[]', name: 'ids' }, { type: 'uint256[]', name: 'amounts' }, { type: 'bytes', name: 'data' }], outputs: [] }, { type: 'function', name: 'safeTransferFrom', constant: false, payable: false, inputs: [{ type: 'address', name: 'from' }, { type: 'address', name: 'to' }, { type: 'uint256', name: 'id' }, { type: 'uint256', name: 'amount' }, { type: 'bytes', name: 'data' }], outputs: [] }, { type: 'function', name: 'setApprovalForAll', constant: false, payable: false, inputs: [{ type: 'address', name: 'operator' }, { type: 'bool', name: 'approved' }], outputs: [] }, { type: 'function', name: 'supportsInterface', constant: true, stateMutability: 'view', payable: false, inputs: [{ type: 'bytes4', name: 'interfaceId' }], outputs: [{ type: 'bool', name: '' }] }, { type: 'function', name: 'uri', constant: true, stateMutability: 'view', payable: false, inputs: [{ type: 'uint256', name: '' }], outputs: [{ type: 'string', name: '' }] }] };