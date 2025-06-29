import request from "supertest";
import app from "../../src/app";
import { createMessageProducerBroker } from "../../src/common/factories/brokerFactory";

describe("Products", () => {
    beforeEach(async () => {
        const messageProducerBroker = createMessageProducerBroker();
        await messageProducerBroker.connect();
        console.log("Kafka Connected Successfully");
    });
    it("should return 200 status", async () => {
        const response = await request(app).get("/").send();
        expect(response.statusCode).toBe(200);
    });
});
