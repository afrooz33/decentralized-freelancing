async function main() {

  const Freelancing = await hre.ethers.getContractFactory("Freelancing");
  const freelancing = await Freelancing.deploy();
  await freelancing.deployed();

  console.log("Freelancing contract deployed to:", freelancing.address);
}

main()
.then(()=>process.exit(0))
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
