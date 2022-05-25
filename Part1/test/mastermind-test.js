//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
//import assertion tool chai & path tool

const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;
//finite field library <= ffjavascript
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
const buildPoseidon = require("circomlibjs").buildPoseidon;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("test", function () {
    this.timeout(100000000);
    let poseidon;
    let F;
    it("mastermind variation", async () => {
        poseidon = await buildPoseidon();
        F = poseidon.F;        
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();
        const res2 =  poseidon([3,5,4,1,0,12345]);
        console.log("res2", F.toString(res2));
        const INPUT = {
            "pubGuessA": "3",
            "pubGuessB": "7",
            "pubGuessC": "2",
            "pubGuessD": "0",
            "pubGuessE": "4",
            "pubNumHit": "1",
            "pubNumBlow": "2",
            "pubSolnHash": F.toString(res2),
            "privSolnA": "3",
            "privSolnB": "5",
            "privSolnC": "4",
            "privSolnD": "1",
            "privSolnE": "0",
            "privSalt": "12345",
            

        }
        const witness = await circuit.calculateWitness(INPUT, true);
//(1) your wasm properly pass input (2) your witness generated is proper (3) the output of your circuit is correct
        console.log(witness);
        assert(F.eq(F.e("12481746260713241055062547604294348245023768412921662985646663391811614058235"), F.e(res2)));
        await circuit.assertOut(witness, {solnHashOut : F.toObject(res2)});
        await circuit.checkConstraints(witness);
        // assert(Fr.eq(Fr.e(witness[0]),Fr.e(res2)));
        // assert(Fr.eq(Fr.e(witness[1]),Fr.e(1)));
    });
});