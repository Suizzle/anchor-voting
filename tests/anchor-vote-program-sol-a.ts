import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorScorekeeper } from "../target/types/anchor_scorekeeper";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { createHash } from "crypto";
import wallet from "../wba-wallet.json"


describe("anchor_scorekeeper", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.AnchorScorekeeper as Program<AnchorScorekeeper>;

  const provider = anchor.getProvider();

  const signer = Keypair.fromSecretKey(new Uint8Array(wallet));

  const user = "Coq Inu";

  const hasher = createHash('sha256');
  hasher.update(Buffer.from(user));
  const hash = hasher.digest();

  const count = PublicKey.findProgramAddressSync([hash], program.programId)[0];

  const confirm = async (signature: string): Promise<string> => {
    const block = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature,
      ...block
    })
    return signature
  }

  const log = async(signature: string): Promise<string> => {
    console.log(`Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
    return signature;
  }

  it("Airdrop", async () => {
    await provider.connection.requestAirdrop(signer.publicKey, LAMPORTS_PER_SOL * 10)
    .then(confirm)
    .then(log)
  })

  it("Initialize", async () => {
    const tx = await program.methods
    .initialize(user)
    .accounts({
      signer: signer.publicKey,
      count,
      systemProgram: SystemProgram.programId
    })
    .signers([
      signer
    ])
    .rpc()
    .then(confirm)
    .then(log);
  });

  it("Increment", async () => {
    const tx = await program.methods
    .increment(user)
    .accounts({
      signer: signer.publicKey,
      count,
      systemProgram: SystemProgram.programId
    })
    .signers([
      signer
    ])
    .rpc()
    .then(confirm)
    .then(log);
  });

  xit("Decrement", async () => {
    const tx = await program.methods
    .decrement(user)
    .accounts({
      signer: signer.publicKey,
      count,
      systemProgram: SystemProgram.programId
    })
    .signers([
      signer
    ])
    .rpc()
    .then(confirm)
    .then(log);
  });
});
