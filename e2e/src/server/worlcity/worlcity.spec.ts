import axios from 'axios';
import {WorldCities} from "@prisma/client";

const endpoint = 'world-cities';

describe(`GET /${endpoint}`, () => {
    it('should return paginated world cities', async () => {
        const res = await axios.get(`/${endpoint}`);

        expect(res.status).toBe(200);

        expect(res.data).toEqual(expect.objectContaining({
            items: expect.any(Array),
            totalItems: expect.any(Number),
            nextCursor: expect.any(Number),
            hasNextCursor: expect.any(Boolean),
            itemsPerPage: expect.any(Number),
        }))

        expect(res.data.items).toHaveLength(10);

        res.data.items.forEach((item: WorldCities) => {
            expect(item).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    city: expect.any(String),
                    country: expect.any(String)
                })
            );
        });

        // Test specific values
        expect(res.data.itemsPerPage).toBe(10);
        expect(res.data.totalItems).toBe(44692);
    });
});
