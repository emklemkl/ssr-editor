import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import app from "../app.js"; // Our app
import { MongoClient as mongo, ObjectId } from "mongodb";
chai.use(chaiHttp);

describe('Test routes and API endpoints', () => {
    let server;
    let insertedId;
    const NAME = "Mumintrollet";
    const COLLECTION_NAME = "crowd";
    const dsn = "mongodb://localhost:27017/mumin";
    before(async () => {
        // Start the server for testing
        try {
            server = app.listen(process.env.PORT || 5000, () => {
            });
            const client = await mongo.connect(dsn);
            const db = await client.db();
            const col = await db.collection(COLLECTION_NAME)
            const res = await col.insertOne({ name: NAME })
            insertedId = res.insertedId
            console.log("Document inserted:", res.insertedId);
            await client.close();
        } catch (err) {
            console.error("Error populating the database:", err);
        }
    });

    after(async () => {
        try {
            const client = await mongo.connect(dsn);
            const db = await client.db();
            const col = await db.collection(COLLECTION_NAME)
            const res = await col.deleteOne({ _id: insertedId })
        } catch (err) {
            console.error("Error cleaning up the test database:", err);
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
            .get(`/document/${insertedId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.name).to.equal(NAME);
                done();
            });
    });
});
