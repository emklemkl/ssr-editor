import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import app from "../app.js"; // Our app
import { MongoClient as mongo } from "mongodb";
chai.use(chaiHttp);

describe('Test routes and API endpoints', () => {
    let server;
    let insertedId;
    const NAME = "Mumintrollet";
    const COLLECTION_NAME = "crowd";
    const dsn = "mongodb://localhost:27017/mumin";

    let idToRemove;

    before(async () => {
        // Start the server for testing
        try {
            server = app.listen(process.env.PORT || 5000, () => {
            });
            const client = await mongo.connect(dsn);
            const db = await client.db();
            const col = await db.collection(COLLECTION_NAME);
            const res = await col.insertOne({ name: NAME });

            insertedId = res.insertedId;
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

            const col = await db.collection(COLLECTION_NAME);

            await col.deleteOne({ _id: insertedId });

            await col.deleteOne({ _id: idToRemove });
        } catch (err) {
            console.error("Error cleaning up the test database:", err);
        }
    });

    it('should return "apa" on GET /test_route', (done) => {
        chai.request(server)
            .get('/sandbox/test_route')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.equal('apa');
                done();
            });
    });
    it('Should return Mumintrollet GET', (done) => {
        chai.request(server)
            .get(`/document/${insertedId}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.have.header('content-type', /json/);
                expect(res.body.name).to.equal(NAME);
                done();
            });
    });
    it('Should return Mumintrollet GET', (done) => {
        const BROKEN_ID = "00001111";

        chai.request(server)
            .get(`/document/${BROKEN_ID}`)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body).to.have.property('error', "Document not found");
                done();
            });
    });
    it('Should return 204 PUT', (done) => {
        const UPDATED_NAME = "Apan";

        chai.request(server)
            .put(`/document/update`)
            .send({ _id: insertedId, name: UPDATED_NAME })
            .end((err, res) => {
                expect(res).to.have.status(204);


                chai.request(app)
                    .get(`/document/${insertedId}`)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', /json/);
                        expect(res.body).to.have.property('_id', insertedId.toString());
                        expect(res.body).to.have.property('name', UPDATED_NAME);
                        done();
                    });
            });
    });
    it('Should return 201 POST', (done) => {
        const CREATED_NAME = "Johnny";

        chai.request(server)
            .post(`/document/create`)
            .send({ name: CREATED_NAME })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property("message", "Document created successfully");
                expect(res.body).to.have.property("_id");
                idToRemove = res.body._id;
                chai.request(app)
                    .get(`/document/${res.body._id}`)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', /json/);
                        expect(res.body).to.have.property('name', CREATED_NAME);
                        done();
                    });
            });
    });
});
