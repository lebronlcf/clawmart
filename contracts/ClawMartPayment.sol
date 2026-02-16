// ClawMart Payment Contract
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ClawMartPayment is ReentrancyGuard, Ownable {
    // $CLAW 代币地址 (Base 链) - 可交易版本
    address public constant CLAW_TOKEN = 0x869f37b5ed9244e4bc952eead011e04e7860e844;
    
    // 平台手续费 (2% = 200 / 10000)
    uint256 public platformFee = 200;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // 平台收款地址
    address public platformWallet;
    
    struct Order {
        address buyer;
        address seller;
        uint256 amount;
        uint256 fee;
        bool isPaid;
        bool isDelivered;
        bool isRefunded;
    }
    
    mapping(bytes32 => Order) public orders;
    mapping(address => uint256) public sellerBalance;
    
    event OrderCreated(bytes32 indexed orderId, address indexed buyer, address indexed seller, uint256 amount);
    event PaymentReceived(bytes32 indexed orderId, uint256 amount, uint256 fee);
    event OrderDelivered(bytes32 indexed orderId);
    event FundsReleased(bytes32 indexed orderId, uint256 sellerAmount, uint256 platformAmount);
    event Refunded(bytes32 indexed orderId, uint256 amount);
    
    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
    }
    
    // 创建订单
    function createOrder(
        bytes32 _orderId,
        address _seller,
        uint256 _amount
    ) external {
        require(_seller != address(0), "Invalid seller");
        require(_amount > 0, "Invalid amount");
        require(orders[_orderId].buyer == address(0), "Order exists");
        
        uint256 fee = (_amount * platformFee) / FEE_DENOMINATOR;
        
        orders[_orderId] = Order({
            buyer: msg.sender,
            seller: _seller,
            amount: _amount,
            fee: fee,
            isPaid: false,
            isDelivered: false,
            isRefunded: false
        });
        
        emit OrderCreated(_orderId, msg.sender, _seller, _amount);
    }
    
    // 支付订单
    function payOrder(bytes32 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.buyer == msg.sender, "Not buyer");
        require(!order.isPaid, "Already paid");
        require(!order.isRefunded, "Order refunded");
        
        IERC20 claw = IERC20(CLAW_TOKEN);
        require(
            claw.transferFrom(msg.sender, address(this), order.amount),
            "Transfer failed"
        );
        
        order.isPaid = true;
        
        emit PaymentReceived(_orderId, order.amount, order.fee);
    }
    
    // 确认交付（买家确认收到商品）
    function confirmDelivery(bytes32 _orderId) external {
        Order storage order = orders[_orderId];
        require(order.buyer == msg.sender, "Not buyer");
        require(order.isPaid, "Not paid");
        require(!order.isDelivered, "Already delivered");
        require(!order.isRefunded, "Order refunded");
        
        order.isDelivered = true;
        
        // 释放资金
        _releaseFunds(_orderId);
        
        emit OrderDelivered(_orderId);
    }
    
    // 内部函数：释放资金
    function _releaseFunds(bytes32 _orderId) internal {
        Order storage order = orders[_orderId];
        
        uint256 sellerAmount = order.amount - order.fee;
        uint256 platformAmount = order.fee;
        
        IERC20 claw = IERC20(CLAW_TOKEN);
        
        // 转给商家
        require(claw.transfer(order.seller, sellerAmount), "Seller transfer failed");
        
        // 转给平台
        require(claw.transfer(platformWallet, platformAmount), "Platform transfer failed");
        
        emit FundsReleased(_orderId, sellerAmount, platformAmount);
    }
    
    // 商家标记已交付（用于服务类商品）
    function markDelivered(bytes32 _orderId) external {
        Order storage order = orders[_orderId];
        require(order.seller == msg.sender, "Not seller");
        require(order.isPaid, "Not paid");
        require(!order.isDelivered, "Already delivered");
        require(!order.isRefunded, "Order refunded");
        
        order.isDelivered = true;
        
        _releaseFunds(_orderId);
        
        emit OrderDelivered(_orderId);
    }
    
    // 退款（平台管理员可操作）
    function refund(bytes32 _orderId) external onlyOwner {
        Order storage order = orders[_orderId];
        require(order.isPaid, "Not paid");
        require(!order.isDelivered, "Already delivered");
        require(!order.isRefunded, "Already refunded");
        
        order.isRefunded = true;
        
        IERC20 claw = IERC20(CLAW_TOKEN);
        require(claw.transfer(order.buyer, order.amount), "Refund failed");
        
        emit Refunded(_orderId, order.amount);
    }
    
    // 更新平台手续费
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // 最高 10%
        platformFee = _newFee;
    }
    
    // 更新平台钱包
    function setPlatformWallet(address _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid address");
        platformWallet = _newWallet;
    }
    
    // 紧急提款（仅限所有者）
    function emergencyWithdraw() external onlyOwner {
        IERC20 claw = IERC20(CLAW_TOKEN);
        uint256 balance = claw.balanceOf(address(this));
        require(claw.transfer(owner(), balance), "Withdraw failed");
    }
}