import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployFullSuiteFixture } from "../fixtures/deploy-full-suite.fixture";

describe("ClaimTopicsRegistry", () => {
  describe(".addClaimTopic", () => {
    describe("when sender is not owner", () => {
      it("should revert", async () => {
        const {
          suite: { claimTopicsRegistry },
          accounts: { anotherWallet },
        } = await loadFixture(deployFullSuiteFixture);

        await expect(
          claimTopicsRegistry.connect(anotherWallet).addClaimTopic(1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when sender is owner", () => {
      describe("when topic array contains more than 14 elements", () => {
        it("should succeed", async () => {
          const {
            suite: { claimTopicsRegistry },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          await Promise.all(
            Array.from({ length: 14 }, (_, i) => i).map((i) =>
              claimTopicsRegistry.addClaimTopic(i)
            )
          );

          await claimTopicsRegistry.connect(deployer).addClaimTopic(14);
        });
      });

      describe("when adding a topic that is already added", () => {
        it("should revert", async () => {
          const {
            suite: { claimTopicsRegistry },
            accounts: { deployer },
          } = await loadFixture(deployFullSuiteFixture);

          await claimTopicsRegistry.addClaimTopic(1);

          await expect(
            claimTopicsRegistry.connect(deployer).addClaimTopic(1)
          ).to.be.revertedWith("ERC-3643: Topic exists");
        });
      });
    });
  });

  describe(".removeClaimTopic", () => {
    describe("when sender is not owner", () => {
      it("should revert", async () => {
        const {
          suite: { claimTopicsRegistry },
          accounts: { anotherWallet },
        } = await loadFixture(deployFullSuiteFixture);

        await expect(
          claimTopicsRegistry.connect(anotherWallet).removeClaimTopic(1)
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when sender is owner", () => {
      it("should remove claim topic", async () => {
        const {
          suite: { claimTopicsRegistry },
          accounts: { deployer },
        } = await loadFixture(deployFullSuiteFixture);

        await claimTopicsRegistry.addClaimTopic(1);
        await claimTopicsRegistry.addClaimTopic(2);
        await claimTopicsRegistry.addClaimTopic(3);

        const tx = await claimTopicsRegistry
          .connect(deployer)
          .removeClaimTopic(2);
        await expect(tx)
          .to.emit(claimTopicsRegistry, "ClaimTopicRemoved")
          .withArgs(2);
      });
    });
  });
});
