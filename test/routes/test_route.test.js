import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import app from "../../app.js"; // Our app
chai.use(chaiHttp);

describe('GET /test_route', () => {
    let server;

    before((done) => {
        // Start the server for testing
        server = app.listen(process.env.PORT || 3000, () => {
            done();
        });
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
});