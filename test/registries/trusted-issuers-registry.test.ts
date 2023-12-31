import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployFullSuiteFixture } from "../fixtures/deploy-full-suite.fixture";

describe("ClaimIssuersRegistry", () => {
  describe(".addClaimIssuer()", () => {
    describe("when sender is not the owner", () => {
      it("should revert", async () => {
        const {
          suite: { claimIssuersRegistry },
          accounts: { anotherWallet },
        } = await loadFixture(deployFullSuiteFixture);

        await expect(
          claimIssuersRegistry
            .connect(anotherWallet)
            .addClaimIssuer(anotherWallet.address, [10])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when sender is the owner", () => {
      describe("when issuer to add is zero address", () => {
        it("should revert", async () => {
          const {
            suite: { claimIssuersRegistry },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          await expect(
            claimIssuersRegistry
              .connect(deployer)
              .addClaimIssuer(ethers.constants.AddressZero, [10])
          ).to.be.revertedWith("ERC-3643: Invalid zero address");
        });
      });

      describe("when issuer is already registered", () => {
        it("should revert", async () => {
          const {
            suite: { claimIssuersRegistry, claimIssuerContract },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          const claimTopics =
            await claimIssuersRegistry.getClaimIssuerClaimTopics(
              claimIssuerContract.address
            );

          await expect(
            claimIssuersRegistry
              .connect(deployer)
              .addClaimIssuer(claimIssuerContract.address, claimTopics)
          ).to.be.revertedWith("ERC-3643: Issuer already exists");
        });
      });

      describe("when claim topics array is empty", () => {
        it("should revert", async () => {
          const {
            suite: { claimIssuersRegistry },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          await expect(
            claimIssuersRegistry
              .connect(deployer)
              .addClaimIssuer(deployer.address, [])
          ).to.be.revertedWith("ERC-3643: Empty claim topics");
        });
      });
    });
  });

  describe(".removeClaimIssuer()", () => {
    describe("when sender is not the owner", () => {
      it("should revert", async () => {
        const {
          suite: { claimIssuersRegistry },
          accounts: { anotherWallet },
        } = await loadFixture(deployFullSuiteFixture);

        await expect(
          claimIssuersRegistry
            .connect(anotherWallet)
            .removeClaimIssuer(anotherWallet.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when sender is the owner", () => {
      describe("when issuer to remove is zero address", () => {
        it("should revert", async () => {
          const {
            suite: { claimIssuersRegistry },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          await expect(
            claimIssuersRegistry
              .connect(deployer)
              .removeClaimIssuer(ethers.constants.AddressZero)
          ).to.be.revertedWith("ERC-3643: Not a claim issuer");
        });
      });

      describe("when issuer is not registered", () => {
        it("should revert", async () => {
          const {
            suite: { claimIssuersRegistry },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          await expect(
            claimIssuersRegistry
              .connect(deployer)
              .removeClaimIssuer(deployer.address)
          ).to.be.revertedWith("ERC-3643: Not a claim issuer");
        });
      });

      describe("when issuer is registered", () => {
        it("should remove the issuer from claim list", async () => {
          const {
            suite: { claimIssuersRegistry, claimIssuerContract },
            accounts: { deployer, anotherWallet, charlieWallet, bobWallet },
          } = await loadFixture(deployFullSuiteFixture);

          await claimIssuersRegistry.addClaimIssuer(
            bobWallet.address,
            [66, 100, 10]
          );
          await claimIssuersRegistry.addClaimIssuer(
            anotherWallet.address,
            [10, 42]
          );
          await claimIssuersRegistry.addClaimIssuer(
            charlieWallet.address,
            [42, 66, 10]
          );

          await expect(
            claimIssuersRegistry.isClaimIssuer(anotherWallet.address)
          ).to.eventually.be.true;

          const tx = await claimIssuersRegistry
            .connect(deployer)
            .removeClaimIssuer(anotherWallet.address);
          await expect(tx)
            .to.emit(claimIssuersRegistry, "ClaimIssuerRemoved")
            .withArgs(anotherWallet.address);

          await expect(
            claimIssuersRegistry.isClaimIssuer(anotherWallet.address)
          ).to.eventually.be.false;
          await expect(
            claimIssuersRegistry.getClaimIssuers()
          ).to.eventually.deep.eq([
            claimIssuerContract.address,
            bobWallet.address,
            charlieWallet.address,
          ]);
        });
      });
    });
  });

  describe(".updateIssuerClaimTopics()", () => {
    describe("when sender is not the owner", () => {
      it("should revert", async () => {
        const {
          suite: { claimIssuersRegistry },
          accounts: { anotherWallet },
        } = await loadFixture(deployFullSuiteFixture);

        await expect(
          claimIssuersRegistry
            .connect(anotherWallet)
            .updateIssuerClaimTopics(anotherWallet.address, [10])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when sender is the owner", () => {
      describe("when issuer to update is zero address", () => {
        it("should rever", async () => {
          const {
            suite: { claimIssuersRegistry },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          await expect(
            claimIssuersRegistry
              .connect(deployer)
              .updateIssuerClaimTopics(ethers.constants.AddressZero, [10])
          ).to.be.revertedWith("ERC-3643: Not a claim issuer");
        });
      });

      describe("when issuer is not registered", () => {
        it("should revert", async () => {
          const {
            suite: { claimIssuersRegistry },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          await expect(
            claimIssuersRegistry
              .connect(deployer)
              .updateIssuerClaimTopics(deployer.address, [10])
          ).to.be.revertedWith("ERC-3643: Not a claim issuer");
        });
      });

      describe("when claim topics array is empty", () => {
        it("should revert", async () => {
          const {
            suite: { claimIssuersRegistry, claimIssuerContract },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          await expect(
            claimIssuersRegistry
              .connect(deployer)
              .updateIssuerClaimTopics(claimIssuerContract.address, [])
          ).to.be.revertedWith("ERC-3643: No claim topics");
        });
      });

      describe("when issuer is registered", () => {
        it("should update the topics of the claim issuers", async () => {
          const {
            suite: { claimIssuersRegistry, claimIssuerContract },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          const claimTopics =
            await claimIssuersRegistry.getClaimIssuerClaimTopics(
              claimIssuerContract.address
            );

          const tx = await claimIssuersRegistry
            .connect(deployer)
            .updateIssuerClaimTopics(claimIssuerContract.address, [66, 100]);
          await expect(tx)
            .to.emit(claimIssuersRegistry, "ClaimTopicsUpdated")
            .withArgs(claimIssuerContract.address, [66, 100]);

          await expect(
            claimIssuersRegistry.hasClaimTopic(claimIssuerContract.address, 66)
          ).to.eventually.be.true;
          await expect(
            claimIssuersRegistry.hasClaimTopic(claimIssuerContract.address, 100)
          ).to.eventually.be.true;
          await expect(
            claimIssuersRegistry.hasClaimTopic(
              claimIssuerContract.address,
              claimTopics[0]
            )
          ).to.eventually.be.false;
          await expect(
            claimIssuersRegistry.getClaimIssuerClaimTopics(
              claimIssuerContract.address
            )
          ).to.eventually.deep.eq([66, 100]);
        });
      });
    });
  });

  describe(".getClaimIssuerClaimTopics()", () => {
    describe("when issuer is not registered", () => {
      it("should revert", async () => {
        const {
          suite: { claimIssuersRegistry },
          accounts: { deployer },
        } = await loadFixture(deployFullSuiteFixture);

        await expect(
          claimIssuersRegistry
            .connect(deployer)
            .getClaimIssuerClaimTopics(deployer.address)
        ).to.be.revertedWith("ERC-3643: Issuer doesn't exist");
      });
    });
  });
});
