import { expect } from "chai";
import MemoryRAM from "../src/storage/memory.mjs";

import faker from 'faker';

faker.seed(111);

describe('Memory Storage',()=>{

    let storageMemory;

    before(async ()=>{
        
        
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
        storageMemory = undefined;
    });

    describe('GET all Users', () => {
        it('debería retornar a todas los usuarios', async () => {
            
            let users = await storageMemory.getAll();
            expect(users).to.be.a('array');
            expect(users).length.greaterThanOrEqual(3);
        });
    });

    describe('SAVE one User', () => {
        it('debería retornar un usuario agregado', async () => {
            const p4 = {
                name: faker.name.firstName(),
                age: faker.datatype.number(),
                surname: faker.name.lastName(),
                email: faker.internet.email()
            };
            let userCreated = await storageMemory.save(p4);
            expect(userCreated).to.be.a('object');
            expect(userCreated).to.include.keys('name','surname','age','email');
        });
    });

    describe('DELETE one User', () => {
        it('debería eliminar un usuario de la estructura', async () => {
            let users = await storageMemory.getAll();
            const keyDelete = users[0].id;
            let userDelete = await storageMemory.deleteOne(keyDelete);
            let noExiste = await storageMemory.findOne(keyDelete);
            expect(userDelete).to.be.a('string');
            expect(userDelete).to.eql(keyDelete);
            expect(noExiste).to.eql(false);
        });
    });

    describe('FINDONE one User', () => {
        it('debería retornar un usuario de la estructura', async () => {
            let users = await storageMemory.getAll();
            const keySearch = users[0].id;
            let userFind = await storageMemory.findOne(keySearch);
            expect(userFind).to.be.a('object');
            expect(userFind).to.include.keys('name','surname','age','email');
            expect(userFind.name).to.eql(users[0].name);
            expect(userFind.age).to.eql(users[0].age);
            expect(userFind.email).to.eql(users[0].email);
        });
    });

    describe('UPDATE one User', () => {
        it('debería actualizar un usuario de la estructura', async () => {
            let users = await storageMemory.getAll();
            const keyUpdate = users[0].id;
            const updateUser = {
                name: faker.name.firstName(),
                age: faker.datatype.number(),
                surname: faker.name.lastName(),
                email: faker.internet.email()
            };
            let userUpdate = await storageMemory.updateOne(keyUpdate,updateUser);
            expect(userUpdate).to.be.a('object');
            expect(userUpdate).to.include.keys('name','surname','age','email');
        });
    });

});