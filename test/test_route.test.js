import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import app from "../app.js"; // Our app
import { MongoClient as mongo } from "mongodb";
chai.use(chaiHttp);

describe('GET /test_route', () => {
    let server;

    before(async (done) => {
        // Start the server for testing
        try {
            const dsn = "mongodb://localhost:27017/mumin";
            server = app.listen(process.env.PORT || 5000, () => {
            });
            const client = await mongo.connect(dsn);
            const db = await client.db();
            const col = await db.collection("crowd")
            const res = await col.insertOne({ name: "Mumintrollet" })
            console.log("Document inserted:", res.insertedId);
            await client.close();
        } catch (error) {
            console.error("Error populating the database:", error);
        }
    });

    it.only('should return "apa" on GET /test_route', (done) => {
        chai.request(server)
            .get('/test_route')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.equal('apa');
                done();
            });
    });
    it.only('Should return Mumintrollet GET', (done) => {
        chai.request(server)
            .get('/document')
            .send({ name: "Mumintrollet"})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.name).to.equal('Mumintrollet');
                done();
            });
    });
});
