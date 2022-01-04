import { expect } from "chai";
import supertest from "supertest";
import { app } from "../src/index.mjs";
import MemoryRAM from "../src/storage/memory.mjs";
import faker from 'faker';
import * as code from '../src/config/status.mjs';

faker.seed(111);

const request = supertest(app);

describe('Test Rest user',()=>{

    let token = '';
    let storageMemory;
    let p1,p2,p3 = {};
    before(async ()=>{
        
        p1 = {
            name: faker.name.firstName(),
            age: faker.datatype.number(),
            surname: faker.name.lastName(),
            email: faker.internet.email(),
            password:'sample2022'
        };

        p2 = {
            name: faker.name.firstName(),
            age: faker.datatype.number(),
            surname: faker.name.lastName(),
            email: faker.internet.email(),
            password:'sample2022'
        };

        p3 = {
            name: faker.name.firstName(),
            age: faker.datatype.number(),
            surname: faker.name.lastName(),
            email: faker.internet.email(),
            password:'sample2022'
        };

    });

    after(async ()=>{
        token='';
    });

    describe('SignUP One User', () => {
        it('debería registrar un usuario', async () => {
            let responseTest = await request.post('/api/v1/signup').send(p1);
            expect(responseTest.status).to.eql(201);
            const response = responseTest.body;
            expect(response).to.be.a('object');
            expect(response).to.include.keys('message');
            expect(response.message).to.be.a('object');
            expect(response.message).to.include.keys('data','code');
            expect(response.message.data).to.be.a('object');
            expect(response.message.data).to.include.keys('email');
            expect(response.message.data.email).to.eql(p1.email);
        });
    });

    describe('Falla SignUP One User', () => {
        it('No debería registrar un usuario', async () => {
            let responseTest = await request.post('/api/v1/signup').send({});
            expect(responseTest.status).to.eql(400);
            const response = responseTest.body;
            expect(response).to.be.a('object');
            expect(response).to.include.keys('message');
            expect(response.message).to.be.a('object');
            expect(response.message).to.include.keys('data','code');
            expect(response.message.data).to.be.a('object');
            expect(response.message.code).to.eql(code.ERROR_PAYLOAD);
        });
    });

    // describe('Check login One User', () => {
    //     it('debería agregar un usuario', async () => {
    //         let responseTest = await request.post('/api/v1/login').set('Authorization',`bearer ${token}`).send({name:'asdsada',email:'sample@domain.dot',surname:'sample',age:111});
    //         expect(responseTest.status).to.eql(201);
    //         const response = responseTest.body;
    //         expect(response).to.be.a('object');
    //         expect(response).to.include.keys('message');
    //         expect(response.message).to.be.a('object');
    //         expect(response.message).to.include.keys('data','code');
    //         expect(response.message.data).to.be.a('object');
    //         expect(response.message.data).to.include.keys('name','email','surname','age');
    //     });
    // });

})