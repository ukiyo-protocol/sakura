const { expect } = require("chai");

describe("VCF", () => {

    let USDT, VCF, vcf, owner, addr1, addr2, addr3, addr4, TokenAddress, monthDuration = 2592000;

    beforeEach(async () => {
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        USDT = "0xD92E713d051C37EbB2561803a3b5FBAbc4962431";
        
        // MyToken = await ethers.getContractFactory('MyToken');
        MyToken = await ethers.getContractFactory('TetherUSDT');
        // usdt = await MyToken.attach(USDT);
        token = await MyToken.deploy();
        await token.deployed();
       
    //    await token.mint(token.address,10000000000000)
        await token.transfer(addr1.address,10000);
        await token.transfer(addr2.address,10000);
        await token.transfer(addr3.address,10000);
        await token.transfer(addr4.address,10000);

        VCF = await ethers.getContractFactory('VCF');
        vcf = await VCF.deploy();
        await vcf.deployed();
    });
    describe("Create capital", async () => {
        it("Should  approve KYC", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);
            await vcf.connect(owner).approveKYC(addr2.address);
            await vcf.connect(owner).approveKYC(addr3.address);
            await vcf.connect(owner).approveKYC(addr4.address);
        });
        it("Only owner should approve KYC", async () => {
            await expect(vcf.connect(addr1).approveKYC(addr1.address)).to.be.revertedWith('CustomOwnable: FORBIDDEN');
        })
        it("Should revert KYC", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);
            await vcf.connect(owner).approveKYC(addr2.address);
            await vcf.connect(owner).approveKYC(addr3.address);
            await vcf.connect(owner).approveKYC(addr4.address);

            await vcf.connect(owner).revertKYC(addr1.address);
            await vcf.connect(owner).revertKYC(addr2.address);
            await vcf.connect(owner).revertKYC(addr3.address);
            await vcf.connect(owner).revertKYC(addr4.address);
        })
        it("Only owner should revert KYC", async () => {
            await expect(vcf.connect(addr1).revertKYC(addr1.address)).to.be.revertedWith('CustomOwnable: FORBIDDEN');
        })
        it("Should check KYC approved", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);
            await vcf.connect(owner).approveKYC(addr4.address);
            await vcf.connect(owner).approveKYC(addr2.address);
            await vcf.connect(owner).approveKYC(addr3.address);

            expect((await vcf.users(addr1.address)).isKYCed).to.be.eq(true);
            expect((await vcf.users(addr2.address)).isKYCed).to.be.eq(true);
            expect((await vcf.users(addr3.address)).isKYCed).to.be.eq(true);
            expect((await vcf.users(addr4.address)).isKYCed).to.be.eq(true);
        })
        it("Should check KYC not approved", async () => {
            expect((await vcf.users(addr1.address)).isKYCed).to.be.eq(false);
            expect((await vcf.users(addr3.address)).isKYCed).to.be.eq(false);
            expect((await vcf.users(addr4.address)).isKYCed).to.be.eq(false);
            expect((await vcf.users(addr2.address)).isKYCed).to.be.eq(false);
        })
        it("Should check KYC reverted", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);
            await vcf.connect(owner).revertKYC(addr1.address);
            expect((await vcf.users(addr1.address)).isKYCed).to.be.eq(false);

            await vcf.connect(owner).approveKYC(addr2.address);
            await vcf.connect(owner).revertKYC(addr2.address);
            expect((await vcf.users(addr2.address)).isKYCed).to.be.eq(false);

            await vcf.connect(owner).approveKYC(addr3.address);
            await vcf.connect(owner).revertKYC(addr3.address);
            expect((await vcf.users(addr3.address)).isKYCed).to.be.eq(false);

            await vcf.connect(owner).approveKYC(addr4.address);
            await vcf.connect(owner).revertKYC(addr4.address);
            expect((await vcf.users(addr4.address)).isKYCed).to.be.eq(false);
        })
        it("Should not create a capital if user no completed KYC", async () => {
            await expect(vcf.connect(owner).createCapital(8640000, 75, 1, addr1.address, "Sharingan", "S")).to.be.revertedWith('VCF : User not completed KYC');
        })
        it("Should not create capital if duration is less", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);
            await expect(vcf.connect(owner).createCapital(86400, 75, 1, addr1.address, "Sharingan", "S")).to.be.revertedWith('VCF: Duration Should be more than a day');
        })
        it("should not create if amount is less than or equal to zero", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);
            await expect(vcf.connect(owner).createCapital(8640000, 0, 1, addr1.address, "Sharingan", "S")).to.be.revertedWith("VCF : price per share can't be zero");
        })
        it("should not create if total Supply is less than or equal to zero", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);
            await expect(vcf.connect(owner).createCapital(8640000, 100, 0, addr1.address, "Sharingan", "S")).to.be.revertedWith("VCF : Total Supply should be greater than zero");
        })
        it("Should create a capital", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);
            await vcf.connect(owner).createCapital(8640000, 1, 10000, addr1.address, "Kakashi", "K");
            
            // await vcf.connect(owner).createCapital(8640000, 1, 10000, addr1.address, "Zabuza", "Z");
            
            // await vcf.connect(owner).createCapital(8640000, 1, 10000, addr1.address, "Haku", "H");
            
            await vcf.connect(owner).approveKYC(addr2.address);
            await vcf.connect(owner).createCapital(8640000, 1, 10000, addr2.address, "Shin", "SH");
           
            // await vcf.connect(owner).createCapital(8640000, 1, 10000, addr2.address, "Chan", "C");
            
            // await vcf.connect(owner).createCapital(8640000, 1, 10000, addr2.address, "Dorato", "D");
            
            await vcf.connect(owner).approveKYC(addr3.address);
            await vcf.connect(owner).createCapital(8640000, 1, 10000, addr3.address, "Hato", "HT");
           
            // await vcf.connect(owner).createCapital(8640000, 1, 10000, addr3.address, "Chakra", "CR");
           
            // await vcf.connect(owner).createCapital(8640000, 1, 10000, addr3.address, "Genin", "G");
           
            // await vcf.connect(owner).createCapital(8640000, 1, 10000, addr3.address, "Jonin", "J");
            // TokenAddress = (await vcf.capitalFund(addr3.address, 4)).tokenAddress
            // console.log(TokenAddress);
            
        })
        it("Should check the balance after capital creation",async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

           
            let balance = await vcf.capitalBalance(TokenAddress,vcf.address);
            let bal = balance.toString();
            expect (bal).to.be.eq("100000000000000000000000");
        })

    })
    describe("Invest", async () => {
        it("Should revert user KYC not approved", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 2, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

            await expect(vcf.connect(addr3).investInCapital(1, 1, addr1.address,token.address)).to.be.revertedWith("VCF : User not completed KYC");
        })
        it("Should revert if share is zero", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 2, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

            await vcf.connect(owner).approveKYC(addr3.address);
            await expect(vcf.connect(addr3).investInCapital(0, 1, addr1.address,token.address)).to.be.revertedWith("VCF : Should invest on atleast 1 unit");

        })
        it("Should revert if capital doesnt exist", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 2, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

            await vcf.connect(owner).approveKYC(addr3.address);
            await expect(vcf.connect(addr3).investInCapital(5, 5, addr1.address,token.address)).to.be.revertedWith("VCF : No capital found");
        })
        it("Should revert if not enough usdt", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 2, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

            await vcf.connect(owner).approveKYC(addr3.address);
            // await vcf.connect(addr3).investInCapital(100, 1, addr1.address,token.address)
            await expect(vcf.connect(addr3).investInCapital(100000000, 1, addr1.address,token.address)).to.be.revertedWith("VCF : Not enough balance");
        })
        it("Should invest on a capital", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

            await vcf.connect(owner).approveKYC(addr3.address);
            await token.connect(addr3).approve(vcf.address,100)
            await vcf.connect(addr3).investInCapital(100, 1, addr1.address,token.address)

            //await expect(vcf.connect(addr3).investInCapital(100, 1, addr1.address,token.address)).to.be.revertedWith("VCF : Not enough balance");
        })
    })
    describe("Withdraw", async () => {
        it("should revert if not owner of capital", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress
            await expect(vcf.connect(addr2).withdrawCapital(TokenAddress, 1)).to.be.revertedWith("VCF : User is not creator of this token");

        })
        it("Should revert if the duration havent reached", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress
            await expect(vcf.connect(addr1).withdrawCapital(TokenAddress, 1)).to.be.revertedWith("VCF : User did not reach the time period");

        })
        it("Should withdraw", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress
            moveAtMonth(5);
            vcf.connect(addr1).withdrawCapital(TokenAddress, 1)

            async function getCurrentUnix() {
                const block = await ethers.provider.send('eth_getBlockByNumber', ['latest', false])
                return parseInt(block.timestamp)
            }
            async function setNextBlockTimestamp(timestamp) {
                const block = await ethers.provider.send('eth_getBlockByNumber', ['latest', false])
                const currentTs = block.timestamp
                const diff = timestamp - currentTs
                await ethers.provider.send('evm_increaseTime', [diff])
            }
            async function moveAtMonth(month) {
                await setNextBlockTimestamp((await getCurrentUnix()) + monthDuration * month)
                await ethers.provider.send('evm_mine')
            }
        })
    })
    describe("Mint token",async() => {
        it("Should mint Tokens", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

            await vcf.connect(addr1).mintToken(TokenAddress,10);
            let balance = await vcf.capitalBalance(TokenAddress,vcf.address);
            console.log(balance.toString());
        })
        it("Should revert if not capital owner",async () =>{
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress
            await expect(vcf.connect(addr2).mintToken(TokenAddress,10)).to.be.revertedWith("VCF : User is not creator of this token");
            
        })
        it("Should revert if mint amount is zero",async ( )=> {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 10000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress
            await expect(vcf.connect(addr1).mintToken(TokenAddress,0)).to.be.revertedWith("VCF : Mint amount can't be zero");
         
        }) 
        it("Should check balance before mint" , async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

           
            let balance = await vcf.capitalBalance(TokenAddress,vcf.address);
            let bal = balance.toString();
            expect (bal).to.be.eq("100000000000000000000000");
        })
        it("Should check balance after mint" , async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

            await vcf.connect(addr1).mintToken(TokenAddress,10);
            let balance = await vcf.capitalBalance(TokenAddress,vcf.address);
            let bal = balance.toString();
            expect (bal).to.be.eq("100000000000000000000010");
        })
        
    })
    describe("Burn token",async() => {
        it("Should burn Tokens", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

            await vcf.connect(addr1).burnToken(TokenAddress,100000)
            let balance = await vcf.capitalBalance(TokenAddress,vcf.address);
            console.log(balance.toString());
        })
        it("Should revert if not capital owner",async () =>{
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 10000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress
            await expect(vcf.connect(addr2).burnToken(TokenAddress,10000000)).to.be.revertedWith("VCF : User is not creator of this token");
            
        })
        it("Should revert if burn amount is zero",async ( )=> {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 10000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress
            await expect(vcf.connect(addr1).burnToken(TokenAddress,0)).to.be.revertedWith("VCF : Burn amount can't be zero");
         
        })
        it("Should check balance before burn" , async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

         
            let balance = await vcf.capitalBalance(TokenAddress,vcf.address);
            let bal = balance.toString();
            expect (bal).to.be.eq("100000000000000000000000");
        }) 
        it("Should check balance after burn" , async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress

            await vcf.connect(addr1).burnToken(TokenAddress,100000);
            let balance = await vcf.capitalBalance(TokenAddress,vcf.address);
            let bal = balance.toString();
            expect (bal).to.be.eq("99999999999999999900000");
        })
        
    })
    describe("Withdraw USDT", async () => {
        it("should revert if not owner of capital", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress
            await expect(vcf.connect(addr2).withdrawUSDT(TokenAddress, 1,token.address)).to.be.revertedWith("VCF : User is not creator of this token");

        })
        it("Should revert if the duration havent reached", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress
            await expect(vcf.connect(addr1).withdrawUSDT(TokenAddress, 1,token.address)).to.be.revertedWith("VCF : User did not reach the time period");

        })
        it("Should withdraw", async () => {
            await vcf.connect(owner).approveKYC(addr1.address);

            await vcf.connect(owner).createCapital(8640000, 1, 100000, addr1.address, "Sharingan", "S");
            TokenAddress = (await vcf.capitalFund(addr1.address, 1)).tokenAddress
            moveAtMonth(5);
            vcf.connect(addr1).withdrawUSDT(TokenAddress, 1,token.address)

            async function getCurrentUnix() {
                const block = await ethers.provider.send('eth_getBlockByNumber', ['latest', false])
                return parseInt(block.timestamp)
            }
            async function setNextBlockTimestamp(timestamp) {
                const block = await ethers.provider.send('eth_getBlockByNumber', ['latest', false])
                const currentTs = block.timestamp
                const diff = timestamp - currentTs
                await ethers.provider.send('evm_increaseTime', [diff])
            }
            async function moveAtMonth(month) {
                await setNextBlockTimestamp((await getCurrentUnix()) + monthDuration * month)
                await ethers.provider.send('evm_mine')
            }
        })
    })
})
