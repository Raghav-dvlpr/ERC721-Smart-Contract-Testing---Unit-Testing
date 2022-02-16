const { expect } = require('chai');
const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { describe } = require('mocha');

const [owner, user1, user2, user3] = accounts;
const ColorTokenERC721 = contract.fromArtifact('ColorTokenERC721');
const BN = web3.utils.toBN;

describe('ColorToken ERC721 -- Testing @Raja Ragavan', () => {
  const totalSupplyBN = BN(0);
  const TOkenURILINK="https://www.google.com/"
  const TokenName='ColorTokenERC721'
  const TokenSymbol='CT'
 
  // Before every [ It statement ] a new Instance of contract is created to verify the testcases.....
  beforeEach(async () => {
    this.CT_Token = await ColorTokenERC721.new(TokenName, TokenSymbol,  {
      from: owner,
    });
  });

    /*
    Testing of Contract Deployment and Contract Owner
    */
  describe('Deployment', () => {

     /*
    This will check the Contract Owner of
    deployed contract....
     */
    it('deployer is owner', async () => {
      expect(await this.CT_Token.owner()).to.equal(owner);
    });
  });

    /*
    Testing of Contract MetaData
    */
  describe('Metadata', () => {

    /*
    This will check the Tokenname and Token To 
    deployed contract....
    */
    it('token metadata is correct', async () => {
      expect(await this.CT_Token.name()).to.equal(TokenName);
      expect(await this.CT_Token.symbol()).to.equal(TokenSymbol);
    });
  });

   /*
    Testing of Total Supply
    */
  describe('Total Supply', () => {

    /*
    This will check the Initial Total supply in contract
    Initally contract Total Supply is 0. 
    */
    it('Checking Inital Total Supply Data ', async () => {
      let GetTotalSupplyfromContract=await this.CT_Token.totalSupply()
      let GetTotalSupplyforTest=totalSupplyBN
      //console.log(GetTotalSupplyfromContract.words[0]);        // un-comment to view output
      //console.log(GetTotalSupplyforTest.words[0]);
      TotalSupplyInContract=GetTotalSupplyfromContract.words[0]
      TotalSupplyInTesting=GetTotalSupplyforTest.words[0]
      expect(TotalSupplyInContract).to.equal(TotalSupplyInTesting)
    });


    /*
    This will check the Total supply in contract after Minted token
    Initally contract Total Supply is 0. 
    After Minted Total Supply is 1.
    */
    it('Checking Total Supply after SafeMint ', async () => {
      
      let TokenIDToMint =0
      await this.CT_Token.safeMint(user1, TokenIDToMint, {
              from: owner,
            });      
      //console.log(await this.CT_Token.totalSupply());                  // un-comment to view output
      let GetTotalSupplyfromContract=await this.CT_Token.totalSupply()
      let TotalSupplyforTest=BN(1)
      TotalSupplyInContract=GetTotalSupplyfromContract.words[0]
      TotalSupplyInTesting=TotalSupplyforTest.words[0]
      expect(TotalSupplyInContract).to.equal(TotalSupplyInTesting)
    
    });
  });




  describe('URI Data', () => {

    it('Checking Token is Minted and Verifying that Token using URI Data', async () => {
      let TokenIDToMint =0
      await this.CT_Token.safeMint(user1, TokenIDToMint, {
              from: owner,
            });      
      
      expect(await this.CT_Token.tokenURI(0)).to.equal(TOkenURILINK+TokenIDToMint)
      //console.log(await this.CT_Token.tokenURI(0));
    });   

  });


  describe('Contract State', () => {

    it('Checking Initially contract is paused', async () => {
      expect(await this.CT_Token.paused()).is.false;
      //console.log(await this.CT_Token.paused().equal(false));
    });

    it('Now Pausing the contract and verifying now contract is paused ', async () => {
      await this.CT_Token.pause({ from: owner });
      expect(await this.CT_Token.paused()).is.true;
    });

    it('Now UnPausing the contract and verifying now contract is unpaused ', async () => {
      await this.CT_Token.pause({ from: owner });
      await this.CT_Token.unpause({ from: owner });
      expect(await this.CT_Token.paused()).is.false;
    });

  });


  describe('Miniting and Burning TokenId', () => {

    it('Minting Token', async () => {
      let TokenIDToMint =0
      await this.CT_Token.safeMint(user1, TokenIDToMint, {
              from: owner,
            });      
      
      expect(await this.CT_Token.tokenURI(0)).to.equal(TOkenURILINK+TokenIDToMint)
    });

    it('Burning the Minited Tokem ID', async () => {
      let TokenIDToMint =0
      await this.CT_Token.safeMint(owner, TokenIDToMint, {
              from: owner,
            });      
      
    
      await this.CT_Token.burn(TokenIDToMint,{
          from:owner,
        })
      
     await expectRevert(this.CT_Token.tokenURI(0),'ERC721Metadata: URI query for nonexistent token')
    });

    it('Trying to Burn a Minited Tokem ID from another user [ If they not approve ] as your are contract owner', async () => {
      let TokenIDToMint =0
      await this.CT_Token.safeMint(user1, TokenIDToMint, {
              from: owner,
            });      
    
      
     await expectRevert(this.CT_Token.burn(TokenIDToMint,{
      from:owner,
    }),'ERC721Burnable: caller is not owner nor approved -- Reason given: ERC721Burnable: caller is not owner nor approved.')

    });

    it('Trying to Burn a Minited Tokem ID from another user [ If they approve ] as your are contract owner', async () => {
      let TokenIDToMint =0
      await this.CT_Token.safeMint(user1, TokenIDToMint, {
              from: owner,
            });      
      await this.CT_Token.approve(owner, TokenIDToMint, {
        from: user1,
      });   

      await this.CT_Token.burn(TokenIDToMint,{
        from:owner,
      })
      await expectRevert(this.CT_Token.tokenURI(0),'ERC721Metadata: URI query for nonexistent token')

    });

    it('Trying to Transfer Non-Existing Token', async () => {
      let TokenID =0

      await expectRevert(
        this.CT_Token.transferFrom(owner,user1, TokenID, {
          from: owner,
        }),
      'ERC721: operator query for nonexistent token -- Reason given: ERC721: operator query for nonexistent token')

    });

    it('Trying to Burn Non-Existing Token', async () => {
      let TokenID =0

      await expectRevert(
        this.CT_Token.burn(TokenID,{
          from:owner,
        }),
      'ERC721: operator query for nonexistent token -- Reason given: ERC721: operator query for nonexistent token.')

    });  

  });
  
  describe('Transfering Tokens and OwnerShips', () => {

    it('Transfer TokenId from One user to another user by token Owner', async () => {
      let TokenIDToMint =0

      //console.log(await this.CT_Token.balanceOf(user1));

      await this.CT_Token.safeMint(owner, TokenIDToMint, {
              from: owner,
            });      
     
      await this.CT_Token.transferFrom(owner,user1, TokenIDToMint, {
        from: owner,
      });   

      //console.log(await this.CT_Token.balanceOf(user1));

    });

    it('Check TokenId is get approved from token Owner to transfer behalf owner', async () => {
      let TokenIDToMint =0

      //console.log(await this.CT_Token.balanceOf(user1));

      await this.CT_Token.safeMint(owner, TokenIDToMint, {
              from: owner,
            });  

      await this.CT_Token.approve(user1, TokenIDToMint, {
        from: owner,
      });  
      expect(await this.CT_Token.getApproved(0)).to.equal(user1)
      // console.log(user1);
      // console.log(await this.CT_Token.getApproved(0));

    });


    it('Transfer TokenId from One user to another user behalf of TokenID owner', async () => {
      let TokenIDToMint =0
      
      //console.log(await this.CT_Token.balanceOf(user1));

      await this.CT_Token.safeMint(owner, TokenIDToMint, {
              from: owner,
            });    

      await this.CT_Token.approve(user1, TokenIDToMint, {
        from: owner,
      });  
     
      await this.CT_Token.safeTransferFrom(owner,user1, TokenIDToMint, {
        from: user1,
      });   

    
      let GetTokenDatafromUser1=await this.CT_Token.balanceOf(user1)
      User1_TokenData=GetTokenDatafromUser1.words[0]
      expect(User1_TokenData).to.equal(1)


      //console.log(await this.CT_Token.balanceOf(user1));

    });

    it('Verifing the owner of Token ID', async () => {
      let TokenIDToMint =0

      await this.CT_Token.safeMint(owner, TokenIDToMint, {
              from: owner,
            });  
      expect(await this.CT_Token.ownerOf(TokenIDToMint)).to.equal(owner)

      // console.log(await this.CT_Token.ownerOf(TokenIDToMint));
      // console.log(owner);      
 

    });

    it('Verifying Current Owner of Token ID after transfered the token', async () => {
      let TokenIDToMint =0

      //console.log(await this.CT_Token.balanceOf(user1));

      await this.CT_Token.safeMint(owner, TokenIDToMint, {
              from: owner,
            });      
     
      await this.CT_Token.transferFrom(owner,user1, TokenIDToMint, {
        from: owner,
      });   
      expect(await this.CT_Token.ownerOf(TokenIDToMint)).to.equal(user1)
      //console.log(await this.CT_Token.balanceOf(user1));

    });

    
    it('Transfer the Token when contract is paused', async () => {
      let TokenIDToMint =0

      //console.log(await this.CT_Token.balanceOf(user1));

      await this.CT_Token.safeMint(owner, TokenIDToMint, {
              from: owner,
            });      

      await this.CT_Token.pause({ from: owner });

      await expectRevert(
        this.CT_Token.transferFrom(owner,user1, TokenIDToMint, {
          from: owner,
        }),
      'Pausable: paused -- Reason given: Pausable: paused.')
      
      
     // console.log(await this.CT_Token.paused());
    });

    it('Transfer the Token when contract is unpaused', async () => {
      let TokenIDToMint =0

      //console.log(await this.CT_Token.balanceOf(user1));

      await this.CT_Token.safeMint(owner, TokenIDToMint, {
              from: owner,
            });      

      await this.CT_Token.pause({ from: owner });
      await this.CT_Token.unpause({ from: owner });
      await this.CT_Token.transferFrom(owner,user1, TokenIDToMint, {
          from: owner,
        })
      
      
     // console.log(await this.CT_Token.paused());
    });


    it('Renounce Ownership', async () => {
      await this.CT_Token.renounceOwnership({ from: owner });
      expect(await this.CT_Token.owner()).to.not.equal(owner);
    });

  });
});
