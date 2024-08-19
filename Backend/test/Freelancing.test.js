const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Freelancing", function () {
  let Freelancing;
  let freelancing;
  let owner;
  let client;
  let freelancer;
  let otherFreelancer;

  beforeEach(async function () {
    Freelancing = await ethers.getContractFactory("Freelancing");
    [owner, client, freelancer, otherFreelancer] = await ethers.getSigners();
    freelancing = await Freelancing.deploy();
    await freelancing.deployed();
  });

  it("Should allow a client to register", async function () {
    await freelancing.connect(client).registerClient("Client Name", "Client Description");
    const clientData = await freelancing.clients(client.address);
    expect(clientData.name).to.equal("Client Name");
  });

  it("Should allow a freelancer to register", async function () {
    await freelancing.connect(freelancer).registerFreelancer("Freelancer Name", "Freelancer Description", []);
    const freelancerData = await freelancing.freelancers(freelancer.address);
    expect(freelancerData.name).to.equal("Freelancer Name");
  });

  it("Should allow a client to post a job", async function () {
    await freelancing.connect(client).registerClient("Client Name", "Client Description");
    await freelancing.connect(client).postJob("Web Development", "Build a website", ethers.utils.parseEther("1"), "fixed");

    const job = await freelancing.jobs(0);
    expect(job.category).to.equal("Web Development");
    expect(job.description).to.equal("Build a website");
    expect(job.amount).to.equal(ethers.utils.parseEther("1"));
  });

  it("Should allow a client to place an order", async function () {
    await freelancing.connect(client).registerClient("Client Name", "Client Description");
    await freelancing.connect(client).postJob("Web Development", "Build a website", ethers.utils.parseEther("1"), "fixed");

    await freelancing.connect(freelancer).registerFreelancer("Freelancer Name", "Freelancer Description", []);
    const job = await freelancing.jobs(0);

    const orderId = await freelancing.connect(client).placeOrder(job.jobId, freelancer.address, {
      value: ethers.utils.parseEther("1.01"), // Including the 1% tax
    });

    const order = await freelancing.orders(orderId);
    expect(order.client).to.equal(client.address);
    expect(order.freelancer).to.equal(freelancer.address);
    expect(order.amount).to.equal(ethers.utils.parseEther("1.01"));
  });

  it("Should allow a freelancer to deliver an order", async function () {
    await freelancing.connect(client).registerClient("Client Name", "Client Description");
    await freelancing.connect(client).postJob("Web Development", "Build a website", ethers.utils.parseEther("1"), "fixed");

    await freelancing.connect(freelancer).registerFreelancer("Freelancer Name", "Freelancer Description", []);
    const job = await freelancing.jobs(0);

    const orderId = await freelancing.connect(client).placeOrder(job.jobId, freelancer.address, {
      value: ethers.utils.parseEther("1.01"),
    });

    await freelancing.connect(freelancer).deliverOrder(orderId);

    const order = await freelancing.orders(orderId);
    expect(order.delivered).to.be.true;
  });

  it("Should allow a freelancer to complete an order", async function () {
    await freelancing.connect(client).registerClient("Client Name", "Client Description");
    await freelancing.connect(client).postJob("Web Development", "Build a website", ethers.utils.parseEther("1"), "fixed");

    await freelancing.connect(freelancer).registerFreelancer("Freelancer Name", "Freelancer Description", []);
    const job = await freelancing.jobs(0);

    const orderId = await freelancing.connect(client).placeOrder(job.jobId, freelancer.address, {
      value: ethers.utils.parseEther("1.01"),
    });

    await freelancing.connect(freelancer).deliverOrder(orderId);
    await network.provider.send("evm_increaseTime", [2 * 60]); // Increase time by 2 minutes
    await network.provider.send("evm_mine");

    await freelancing.connect(freelancer).completeOrder(orderId);

    const order = await freelancing.orders(orderId);
    expect(order.completed).to.be.true;

    const freelancerBalance = await ethers.provider.getBalance(freelancer.address);
    expect(freelancerBalance).to.be.above(ethers.utils.parseEther("10000")); // Assuming initial balance is 10000 ETH
  });

  it("Should allow a client to dispute an order", async function () {
    await freelancing.connect(client).registerClient("Client Name", "Client Description");
    await freelancing.connect(client).postJob("Web Development", "Build a website", ethers.utils.parseEther("1"), "fixed");

    await freelancing.connect(freelancer).registerFreelancer("Freelancer Name", "Freelancer Description", []);
    const job = await freelancing.jobs(0);

    const orderId = await freelancing.connect(client).placeOrder(job.jobId, freelancer.address, {
      value: ethers.utils.parseEther("1.01"),
    });

    await freelancing.connect(freelancer).deliverOrder(orderId);

    await freelancing.connect(client).disputeOrder(orderId);

    const order = await freelancing.orders(orderId);
    expect(order.disputed).to.be.true;
  });

  it("Should allow clients and freelancers to add reviews", async function () {
    await freelancing.connect(client).registerClient("Client Name", "Client Description");
    await freelancing.connect(client).postJob("Web Development", "Build a website", ethers.utils.parseEther("1"), "fixed");

    await freelancing.connect(freelancer).registerFreelancer("Freelancer Name", "Freelancer Description", []);
    const job = await freelancing.jobs(0);

    const orderId = await freelancing.connect(client).placeOrder(job.jobId, freelancer.address, {
      value: ethers.utils.parseEther("1.01"),
    });

    await freelancing.connect(freelancer).deliverOrder(orderId);
    await network.provider.send("evm_increaseTime", [2 * 60]); // Increase time by 2 minutes
    await network.provider.send("evm_mine");

    await freelancing.connect(freelancer).completeOrder(orderId);

    await freelancing.connect(client).addReviewForFreelancer(orderId, "Great work!");
    await freelancing.connect(freelancer).addReviewForClient(orderId, "Pleasant experience!");

    const freelancerReviews = await freelancing.getFreelancerReviews(freelancer.address);
    expect(freelancerReviews).to.include("Great work!");

    const clientReviews = await freelancing.getClientReviews(client.address);
    expect(clientReviews).to.include("Pleasant experience!");
  });
});
