import {describe} from "mocha";
import {expect} from "chai";
import * as Util from "../utilities"
import * as assert from "assert";

describe("Utilities", () => {
    it('Get Interactome Atlas data', async () => {
        const result = await Util.interactomeAtlas(["BAK1", "BID", "BAD", "BCL2", "BAX"])
        expect(result["found_protein_summary"]).to.equal('BAK1</br>BID</br>BAD</br>BCL2</br>BAX')
        await Promise.resolve()
        assert.ok(true)
    });
    it('Get StringDB data', async () => {
        const result = await Util.getStringDBInteractions(["BAK1_HUMAN", "BID_HUMAN", "BAD_HUMAN", "BCL2_HUMAN", "BAX_HUMAN"], "9606")
        await Promise.resolve()
        assert.ok(true)
    });
    it("Get EBI AlphaFold data", async () => {
        const result = await Util.getEBIAlpha("Q5S006")
        await Promise.resolve()
        assert.ok(true)
    })
})