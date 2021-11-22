import {task} from 'hardhat/config';

require("@nomiclabs/hardhat-web3");

const cGasPrice = 70 * 1000000000;

task("deploy-mock-token", "deploys a mock token")
    .addParam("name", "Name of the token")
    .addParam("symbol", "Symbol of the token")
    .addParam("decimals", "Amount of decimals", "18")
    .setAction(async (taskArgs, {ethers}) => {
        const signers = await ethers.getSigners();
        const factory = await ethers.getContractFactory('MockToken');
        const token = await factory.deploy(taskArgs.name, taskArgs.symbol, taskArgs.decimals);
        const utils = ethers.utils;
        await token.mint(await signers[0].getAddress(), utils.parseUnits("10000000000000"));
        console.log(`Deployed token at: ${token.address}`);
    });

task('deploy-matrix-farm', 'deploy MatrixFarm')
    .addParam("rewardtoken")
    .setAction(async (taskArgs, {ethers}) => {
        const MatrixFarm = await ethers.getContractFactory('MatrixFarm');
        const matrixFarm = await MatrixFarm.deploy(taskArgs.rewardtoken, {
            gasLimit: 10000000,
            gasPrice: cGasPrice
        });
        const farm = await matrixFarm.deployed();
        console.log('MatrixFarm address', farm.address);
    });

task('add-lp-to-pool')
    .addParam("address", "address of the pool")
    .addParam("farmtoken")
    .addParam("startblock")
    .addParam("endblock")
    .addParam("pre")
    .setAction(async (taskArgs, {ethers}) => {
        const signers = await ethers.getSigners();
        const farm = await ethers.getContractAt('MatrixFarm', taskArgs.address, signers[0]);
        const utils = ethers.utils;
        await farm.add(taskArgs.farmtoken, false, utils.parseUnits(taskArgs.pre), taskArgs.startblock, taskArgs.endblock);
    });

task('back-reward-token')
    .addParam("address", "address of the pool")
    .setAction(async (taskArgs, {ethers}) => {
        const signers = await ethers.getSigners();
        const farm = await ethers.getContractAt('MatrixFarm', taskArgs.address, signers[0]);
        const utils = ethers.utils;
        await farm.backRewardToken(utils.parseUnits("5"));
    });

task('deposit')
    .addParam("address", "address of the farm pool")
    .addParam("farmtoken")
    .setAction(async (taskArgs, {ethers}) => {
        const signers = await ethers.getSigners();
        const token = await ethers.getContractAt('MockToken', taskArgs.farmtoken, signers[0]);
        await token.approve(taskArgs.address, ethers.constants.MaxUint256, {
            gasLimit: 100000,
            gasPrice: cGasPrice
        });
        const farm = await ethers.getContractAt('MatrixFarm', taskArgs.address, signers[0]);
        const utils = ethers.utils;
        await farm.deposit(0, utils.parseUnits("100"));
    });

task('withdraw')
    .addParam("address", "address of the farm pool")
    .setAction(async (taskArgs, {ethers}) => {
        const signers = await ethers.getSigners();
        const farm = await ethers.getContractAt('MatrixFarm', taskArgs.address, signers[0]);
        const utils = ethers.utils;
        await farm.withdraw(0, utils.parseUnits("0"));
    });

task('farm-info')
    .addParam("address", "address of the pool")
    .setAction(async (taskArgs, {ethers}) => {
        const signers = await ethers.getSigners();
        const farm = await ethers.getContractAt('MatrixFarm', taskArgs.address, signers[0]);
        const poolInfo = await farm.poolInfo(1);
        console.log(poolInfo.toString());
    });

task('user-total-deposit-token')
    .addParam("address", "address of the pool")
    .setAction(async (taskArgs, {ethers}) => {
        const signers = await ethers.getSigners();
        const farm = await ethers.getContractAt('MatrixFarm', taskArgs.address, signers[0]);
        const userTotalDepositToken = await  farm.userTotalDepositToken();
        console.log(userTotalDepositToken.toString());
    });