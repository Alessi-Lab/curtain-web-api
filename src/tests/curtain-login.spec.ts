import {describe} from "mocha";
import {expect} from "chai";
import {CurtainWebAPI} from "../classes/curtain-api";
import * as assert from "assert";
import {User} from "../classes/curtain-user";

//sample user data
const userEx= {
    id: 1,
    username: "testroot",
    isStaff: true,
    canDelete: true,
    curtainLinkLimit: 10,
    totalCurtain: 0,
    curtainLinkLimitExceed: false,
    lastAccessTokenUpdateTime: new Date(),
    lastRefreshTokenUpdateTime: new Date(),
}

describe('User', function () {
    describe('User data management', function () {
        it("loading user data from local storage", async () => {
            const user = new User();

            await user.init();
            for (const i in userEx) {
                user[i] = userEx[i]
            }
            await user.updateDB();
            const data: any = await user.db.get("user")
            expect(data.username).to.deep.equal(userEx.username)
            await user.loadFromDB();
            expect(user.username).to.equal(userEx.username);
            await user.clearDB();
            await Promise.resolve()

            assert.ok(true)
        });
        it("destroying user data from local storage", async () => {
            const user = new User();
            await user.init();
            for (const i in userEx) {
                user[i] = userEx[i]
            }
            await user.updateDB();
            await user.clearDB();
            await user.loadFromDB();
            expect(user.username).to.equal("");
            await Promise.resolve()
            assert.ok(true)
        })
    })
});

describe("Login", () => {
    describe("Login into Curtain", () => {
        it("using a credential with an invalid username and password", async () => {
            const curtainLogin = new CurtainWebAPI();
            curtainLogin.login("testroot", "testpassword").then((response) => {

            }).catch((error) => {
                expect(error.status).to.equal(401);
            })
            await Promise.resolve()
            assert.ok(true)
        });
        it("using a credential with an valid username and password", async () => {
            const curtainLogin = new CurtainWebAPI();
            curtainLogin.login("testroot", "testactualpassword").then((response) => {
                expect(response.id).to.equal(1);
                expect(response.username).to.equal("testroot");
            }).catch((error) => {
            })
            await Promise.resolve()
            assert.ok(true)
        })
    })
    describe("Token method", () => {
      it("check token expiry", async () => {
          const curtainLogin = new CurtainWebAPI();
          await curtainLogin.user.loadFromDB()
          console.log(curtainLogin.user.lastRefreshTokenUpdate)
          const expired = curtainLogin.checkIfRefreshTokenExpired()
          expect(expired).to.equal(false)
          await Promise.resolve()
          assert.ok(true)
      })
    })
})

describe("Session data", () => {
    it('should retrieve session meta data', async () => {
        const curtainLogin = new CurtainWebAPI();
        const result = await curtainLogin.getSessionSettings("546c9ed7-30a6-4a0f-aedb-880815eb7051")
    });

    it('should retrieve session data', async () => {
        const curtainLogin = new CurtainWebAPI();
        const result = await curtainLogin.postSettings("546c9ed7-30a6-4a0f-aedb-880815eb7051", "")
    })
    it('should login and then retrieve session data', async () => {
        const curtainLogin = new CurtainWebAPI();
        await curtainLogin.login("testroot", "testpassword")
        const previousAccess = curtainLogin.user.access_token.slice()
        curtainLogin.user.access_token = ""
        expect(previousAccess).to.not.equal(curtainLogin.user.access_token)
        await curtainLogin.refresh()
        expect(previousAccess).to.not.equal(curtainLogin.user.access_token)
        const result = await curtainLogin.postSettings("546c9ed7-30a6-4a0f-aedb-880815eb7051", "")
    });
    it('should login, expire access, then try to retrieve data', async () => {
        const curtainLogin = new CurtainWebAPI();
        await curtainLogin.login("testroot", "testpassword")
        const previousAccess = curtainLogin.user.access_token.slice()
        curtainLogin.user.access_token = ""
        expect(previousAccess).to.not.equal(curtainLogin.user.access_token)
        const result = await curtainLogin.postSettings("546c9ed7-30a6-4a0f-aedb-880815eb7051", "")
        expect(previousAccess).to.not.equal(curtainLogin.user.access_token)
    })
});


