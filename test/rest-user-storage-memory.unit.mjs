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
    before(async ()=>{
        token='daddsadsadsadsadas';
        storageMemory=new MemoryRAM();

        const p1 = {
            name: faker.name.firstName(),
            age: faker.datatype.number(),
            surname: faker.name.lastName(),
            email: faker.internet.email()
        };

        const p2 = {
            name: faker.name.firstName(),
            age: faker.datatype.number(),
            surname: faker.name.lastName(),
            email: faker.internet.email()
        };

        const p3 = {
            name: faker.name.firstName(),
            age: faker.datatype.number(),
            surname: faker.name.lastName(),
            email: faker.internet.email()
        };

        await storageMemory.save(p1);
        await storageMemory.save(p2);
        await storageMemory.save(p3);
    });

    after(async ()=>{
        token='';
    });

    describe('GET Users', () => {
        it('debería retornar lista de usuarios', async () => {
            let response = await request.get('/api/v1/users/list').set('Authorization',`bearer ${token}`);
            expect(response.status).to.eql(200);
            const usuarioResponse = response.body;
            expect(usuarioResponse).to.be.a('object');
            expect(usuarioResponse).to.include.keys('message');
            expect(usuarioResponse.message).to.be.a('object');
            expect(usuarioResponse.message).to.include.keys('data','code');
            expect(usuarioResponse.message.data).to.be.a('array');
        });
    })

    describe('ADD One User', () => {
        it('debería agregar un usuario', async () => {
            let responseTest = await request.post('/api/v1/users').set('Authorization',`bearer ${token}`).send({name:'asdsada',email:'sample@domain.dot',surname:'sample',age:111});
            expect(responseTest.status).to.eql(201);
            const response = responseTest.body;
            expect(response).to.be.a('object');
            expect(response).to.include.keys('message');
            expect(response.message).to.be.a('object');
            expect(response.message).to.include.keys('data','code');
            expect(response.message.data).to.be.a('object');
            expect(response.message.data).to.include.keys('name','email','surname','age');
        });
    });

    describe('GET One User', () => {
        it('Debería retornar un usuario', async () => {
            const users = await storageMemory.getAll();
            let responseTest = await request.get(`/api/v1/users/${users[0].id}`).set('Authorization',`bearer ${token}`);
            expect(responseTest.status).to.eql(200);
            const response = responseTest.body;
            expect(response).to.be.a('object');
            expect(response).to.include.keys('message');
            expect(response.message).to.be.a('object');
            expect(response.message).to.include.keys('data','code');
            expect(response.message.data).to.be.a('object');
            expect(response.message.data).to.include.keys('name','email','surname','age');
            expect(response.message.data.name).to.eql(users[0].name);
            expect(response.message.data.email).to.eql(users[0].email);
            expect(response.message.data.age).to.eql(users[0].age);

        });
    });

    describe('UPDATE One User', () => {
        it('debería actualizar un usuario', async () => {
            const users = await storageMemory.getAll();
            let responseTest = await request.put(`/api/v1/users/${users[0].id}`).set('Authorization',`bearer ${token}`).send({name:'asdsada',email:'sample@domain.dot',surname:'sample',age:111});
            expect(responseTest.status).to.eql(200);
            const response = responseTest.body;
            expect(response).to.be.a('object');
            expect(response).to.include.keys('message');
            expect(response.message).to.be.a('object');
            expect(response.message).to.include.keys('data','code');
            expect(response.message.data).to.be.a('object');
            expect(response.message.data.name).to.eql('asdsada');
            expect(response.message.data.email).to.eql('sample@domain.dot');
            expect(response.message.data.age).to.eql(111);
        });
    });

    describe('DELETE One User', () => {
        it('Debería eliminar un usuario', async () => {
            const users = await storageMemory.getAll();
            let responseTest = await request.delete(`/api/v1/users/${users[1].id}`).set('Authorization',`bearer ${token}`);
            expect(responseTest.status).to.eql(200);
            const response = responseTest.body;
            expect(response).to.be.a('object');
            expect(response).to.include.keys('message');
            expect(response.message).to.be.a('object');
            expect(response.message).to.include.keys('data','code');
            expect(response.message.data).to.be.a('string');
            expect(response.message.data).to.eql(users[1].id);
        });
    });

    describe('ADD One User incomplete', () => {
        it('No debería agregar un usuario', async () => {
            let responseTest = await request.post('/api/v1/users').set('Authorization',`bearer ${token}`).send({name:'asdsada'});
            expect(responseTest.status).to.eql(400);
            const response = responseTest.body;
            expect(response).to.be.a('object');
            expect(response).to.include.keys('message');
            expect(response.message).to.be.a('object');
            expect(response.message).to.include.keys('data','code');
            expect(response.message.code).to.eql(code.ERROR_PAYLOAD);
        });
    });

    describe('ADD One User incomplete II', () => {
        it('No debería agregar un usuario', async () => {
            let responseTest = await request.post('/api/v1/users').set('Authorization',`bearer ${token}`).send({});
            expect(responseTest.status).to.eql(400);
            const response = responseTest.body;
            expect(response).to.be.a('object');
            expect(response).to.include.keys('message');
            expect(response.message).to.be.a('object');
            expect(response.message).to.include.keys('data','code');
            expect(response.message.code).to.eql(code.ERROR_PAYLOAD);
        });
    });

    describe('UPDATE One User incomplete', () => {
        it('debería actualizar un usuario', async () => {
            let responseTest = await request.put('/api/v1/users/rwerewrewrwrw').set('Authorization',`bearer ${token}`).send({name:'asdsada'});
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

    describe('UPDATE One User incomplete II', () => {
        it('debería actualizar un usuario', async () => {
            let responseTest = await request.put('/api/v1/users/rwerewrewrwrw').set('Authorization',`bearer ${token}`).send({});
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

    describe('GET One User not found', () => {
        it('No debería retornar un usuario', async () => {
            let responseTest = await request.get('/api/v1/users/asdadadadasdsada').set('Authorization',`bearer ${token}`);
            expect(responseTest.status).to.eql(404);
            const response = responseTest.body;
            expect(response).to.be.a('object');
            expect(response).to.include.keys('message');
            expect(response.message).to.be.a('object');
            expect(response.message).to.include.keys('data','code');
            expect(response.message.code).to.eql(code.OK_NOTFOUND);
        });
    });

    describe('DELETE One User not exists', () => {
        it('No debería eliminar un usuario', async () => {
            let responseTest = await request.delete('/api/v1/users/asdadadadasdsada').set('Authorization',`bearer ${token}`);
            expect(responseTest.status).to.eql(400);
            const response = responseTest.body;
            expect(response).to.be.a('object');
            expect(response).to.include.keys('message');
            expect(response.message).to.be.a('object');
            expect(response.message).to.include.keys('data','code');
            expect(response.message.code).to.eql(code.ERROR_PAYLOAD);
        });
    });

})