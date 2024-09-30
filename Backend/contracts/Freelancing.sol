// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Freelancing is ReentrancyGuard, Pausable {
    using Address for address payable;

    uint256 private constant TAX_RATE = 1; // We're taking a 1% tax on each payment
    uint256 public jobCounter; // This will keep track of how many jobs have been posted
    address private _owner; // The person who deploys the contract is the owner

    constructor() {
        _owner = msg.sender; // Setting the contract deployer as the owner
    }

    // Only the owner of the contract can use these functions
    modifier onlyOwner() {
        require(msg.sender == _owner, "Oops! Only the owner can do this.");
        _;
    }

    // Ensure that only users who are not the owner can register
    modifier onlyNonOwner() {
        require(
            msg.sender != _owner,
            "Sorry, but you can't register as a client or freelancer."
        );
        _;
    }

    // Check that the client is not already registered
    modifier onlyUnregisteredClient() {
        require(
            bytes(clients[msg.sender].name).length == 0,
            "You are already registered as a client."
        );
        _;
    }

    // Check that the freelancer is not already registered
    modifier onlyUnregisteredFreelancer() {
        require(
            bytes(freelancers[msg.sender].name).length == 0,
            "You are already registered as a freelancer."
        );
        _;
    }

    // Only the parties involved in an order can perform certain actions
    modifier onlyInvolvedParties(bytes32 _orderId) {
        require(
            msg.sender == orders[_orderId].client ||
                msg.sender == orders[_orderId].freelancer,
            "You must be involved in this order to perform this action."
        );
        _;
    }

    // Restrict function access to the specific client
    modifier onlyClient(address _clientAddress) {
        require(
            msg.sender == _clientAddress,
            "Only the designated client can do this."
        );
        _;
    }

    // Restrict function access to the specific freelancer
    modifier onlyFreelancer(address _freelancerAddress) {
        require(
            msg.sender == _freelancerAddress,
            "Only the designated freelancer can do this."
        );
        _;
    }

    // Define what a job looks like
    struct Job {
        uint256 jobId;
        address clientAddress;
        string category;
        string description;
        uint256 amount;
        string paymentType; // Payment type: hourly, part-time, full-time
    }

    // Define what a freelancer looks like
    struct Freelancer {
        address freelancerAddress;
        string name;
        string description;
        string[] reviews; // Reviews from clients
        uint256 trustRating; // Rating based on reviews
        string[] certificates; // URLs to certificates
    }

    // Define what a client looks like
    struct Client {
        address clientAddress;
        string name;
        string description;
        string[] reviews; // Reviews from freelancers
    }

    // Define what an order looks like
    struct Order {
        bytes32 orderId;
        uint256 jobId;
        address client;
        address freelancer;
        uint256 amount;
        bool completed;
        bool disputed;
        uint256 startTime;
        uint256 endTime;
        bool delivered;
        bool cancelled;
    }

    event orderIdInEvent(bytes32);

    // Mappings to store data about freelancers, clients, jobs, and orders
    mapping(address => Freelancer) public freelancers;
    mapping(address => Client) public clients;
    mapping(uint256 => Job) public jobs;
    mapping(bytes32 => Order) public orders;
    mapping(bytes32 => bool) private orderIds; // To make sure each order ID is unique

    // Register a new client
    function registerClient(
        string memory _name,
        string memory _description
    ) public onlyNonOwner onlyUnregisteredClient whenNotPaused {
        clients[msg.sender] = Client({
            clientAddress: msg.sender,
            name: _name,
            description: _description,
            reviews: new string[](0) // Start with an empty list of reviews
        });
    }

    // Register a new freelancer
    function registerFreelancer(
        string memory _name,
        string memory _description,
        string[] memory _certificates
    ) public onlyNonOwner onlyUnregisteredFreelancer whenNotPaused {
        freelancers[msg.sender] = Freelancer({
            freelancerAddress: msg.sender,
            name: _name,
            description: _description,
            reviews: new string[](0), // Start with an empty list of reviews
            trustRating: 0,
            certificates: _certificates
        });
    }

    // Clients use this function to post new jobs
    function postJob(
        string memory _category,
        string memory _description,
        uint256 _amount,
        string memory _paymentType
    ) public onlyNonOwner whenNotPaused {
        jobs[jobCounter] = Job({
            jobId: jobCounter,
            clientAddress: msg.sender,
            category: _category,
            description: _description,
            amount: _amount,
            paymentType: _paymentType
        });
        jobCounter++; // Increase the job counter for the next job
    }

    // Generate a unique ID for each order
    function generateOrderId(
        uint256 _jobId,
        address _client,
        address _freelancer
    ) private view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(_jobId, _client, _freelancer, block.timestamp)
            );
    }

    // Place an order for a job
    function placeOrder(
        address _freelancer
    ) public payable nonReentrant whenNotPaused returns (bytes32) {
        require(
            jobs[jobCounter].clientAddress != address(0),
            "The job you're trying to order doesn't exist."
        );
        require(
            msg.value >= (jobs[jobCounter].amount * (100 + TAX_RATE)) / 100,
            "Incorrect payment amount. Make sure to include the tax."
        );


        bytes32 orderId = generateOrderId(jobCounter, msg.sender, _freelancer);
        require(
            !orderIds[orderId],
            "This order ID has already been used. Please try again."
        );

        orders[orderId] = Order({
            orderId: orderId,
            jobId: jobCounter,
            client: msg.sender,
            freelancer: _freelancer,
            amount: msg.value,
            completed: false,
            disputed: false,
            startTime: 0,
            endTime: 0,
            delivered: false,
            cancelled: false
        });
        orderIds[orderId] = true; // Mark the order ID as used

        emit orderIdInEvent(orderId);

        return orderId;
    }

    // Mark an order as delivered
    function deliverOrder(
        bytes32 _orderId
    ) public onlyFreelancer(orders[_orderId].freelancer) whenNotPaused {
        Order storage order = orders[_orderId];
        require(!order.delivered, "This order has already been delivered.");

        order.delivered = true;
        order.startTime = block.timestamp;
        order.endTime = block.timestamp + 2 minutes; // Set an end time 2 minutes from now
    }

    // Complete an order after delivery
    function completeOrder(
        bytes32 _orderId
    )
        public
        onlyFreelancer(orders[_orderId].freelancer)
        nonReentrant
        whenNotPaused
    {
        Order storage order = orders[_orderId];
        require(
            order.delivered,
            "You need to deliver the order before completing it."
        );
        require(!order.completed, "This order is already marked as completed.");
        require(
            block.timestamp >= order.endTime,
            "You cannot complete the order before the end time."
        );

        order.completed = true;

        uint256 totalTax = (order.amount * 2) / 100; // Calculate 2% tax
        uint256 freelancerAmount = order.amount - totalTax;
        payable(_owner).sendValue(totalTax); // Send the tax amount to the owner
        payable(order.freelancer).sendValue(freelancerAmount); // Send the remaining amount to the freelancer
    }

    // Clients can dispute an order if there are issues
    function disputeOrder(
        bytes32 _orderId
    ) public onlyClient(orders[_orderId].client) whenNotPaused {
        Order storage order = orders[_orderId];
        require(
            order.delivered,
            "You can only dispute orders that have been delivered."
        );
        require(
            block.timestamp < order.endTime,
            "The dispute period for this order has ended."
        );

        order.delivered = false; // Reset delivery status
        order.disputed = true;
    }

    // Add a review for a freelancer
    function addReviewForFreelancer(
        bytes32 _orderId,
        string memory _review
    ) public onlyClient(orders[_orderId].client) whenNotPaused {
        freelancers[orders[_orderId].freelancer].reviews.push(_review);
    }

    // Add a review for a client
    function addReviewForClient(
        bytes32 _orderId,
        string memory _review
    ) public onlyFreelancer(orders[_orderId].freelancer) whenNotPaused {
        clients[orders[_orderId].client].reviews.push(_review);
    }

    // Retrieve all reviews for a specific client
    function getClientReviews(
        address _clientAddress
    ) public view returns (string[] memory) {
        return clients[_clientAddress].reviews;
    }

    // Retrieve all reviews for a specific freelancer
    function getFreelancerReviews(
        address _freelancerAddress
    ) public view returns (string[] memory) {
        return freelancers[_freelancerAddress].reviews;
    }

    // Allow a client to cancel an order after delivery
    function cancelAfterDelivery(
        bytes32 _orderId
    ) public onlyClient(orders[_orderId].client) nonReentrant whenNotPaused {
        Order storage order = orders[_orderId];
        require(
            order.delivered,
            "You can only cancel orders that have been delivered."
        );
        require(
            block.timestamp < order.endTime,
            "The dispute period for this order has ended."
        );
        require(!order.completed, "This order has already been completed.");

        order.completed = true;
        payable(order.client).sendValue(order.amount); // Refund the client
    }

    // Pause all contract operations
    function pauseContract() public onlyOwner {
        _pause();
    }

    // Unpause all contract operations
    function unpauseContract() public onlyOwner {
        _unpause();
    }
}