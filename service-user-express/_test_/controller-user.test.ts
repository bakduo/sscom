import * as chai from 'chai';
import supertest from "supertest";
import faker from '@faker-js/faker';
import { app } from '../src/main';
import { userDAO, tokenDAO, loadUserDAO } from '../src/init/configure';

const request = supertest(app);

const expect = chai.expect;

describe('Test controller UNIT',async () => {

    let tokenUser = '';
    let refreshTokenUser='';

    let tokenAdmin = '';
    let refreshTokenAdmin='';


    before(async function(){

        await loadUserDAO();
        
        console.log("###############BEGIN TEST Controller#################");

    });

    after(async () => {
        
        console.log("###############AFTER TEST Controller#################");
        
        await userDAO.deleteAll();
        await tokenDAO.deleteAll();

    });

    describe('Operations commons user', () => {


        it('debería generar un usuario', async () => {  

            const user= {email:"sample@dot.com",deleted:false,roles:['user'],username:faker.internet.userName(),password:"sample"};

            const response = await request.post('/api/signup').send(user);
            
            expect(response.status).to.eql(201);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');

            expect(responseUser).to.include.keys('profile');

            expect(responseUser.profile).to.include.keys('id','roles');
        });

        it('debería generar un usuario admin', async () => {  

            const user= {email:"admin@dot.com",deleted:false,roles:['admin'],username:faker.internet.userName(),password:"sample"};

            const response = await request.post('/api/signup').send(user);
            
            expect(response.status).to.eql(201);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');

            expect(responseUser).to.include.keys('profile');

            expect(responseUser.profile).to.include.keys('id','roles');
        });

        it('No debería generar un usuario repetido', async () => {  

            const user= {email:"sample@dot.com",deleted:false,roles:['user'],username:faker.internet.userName(),password:"sample"};

            const response = await request.post('/api/signup').send(user);
            
            expect(response.status).to.eql(400);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');

            expect(responseUser).to.include.keys('message');

            expect(responseUser.message).to.contain("User existent Not permit");
        });


        it('debería realizar login de un usuario', async () => {  

            const user= {email:"sample@dot.com",password:"sample"};

            const response = await request.post('/api/login').send(user);
            
            expect(response.status).to.eql(200);

            const responseUser = response.body;

            tokenUser = responseUser.token;
                        
            refreshTokenUser = responseUser.refresh;

            expect(responseUser).to.be.a('object');
            
            expect(responseUser).to.include.keys('token','refresh','fail');

            expect(responseUser.token).to.be.a('string');
            
            expect(responseUser.refresh).to.be.a('string');
            
            expect(responseUser.fail).to.be.a('boolean');
            
            expect(responseUser.fail).to.equal(false);

        });


        it('debería realizar login de un admin', async () => {  

            const user= {email:"admin@dot.com",password:"sample"};

            const response = await request.post('/api/login').send(user);
            
            expect(response.status).to.eql(200);

            const responseUser = response.body;

            tokenAdmin = responseUser.token;
                        
            refreshTokenAdmin = responseUser.refresh;

            expect(responseUser).to.be.a('object');
            
            expect(responseUser).to.include.keys('token','refresh','fail');

            expect(responseUser.token).to.be.a('string');
            
            expect(responseUser.refresh).to.be.a('string');
            
            expect(responseUser.fail).to.be.a('boolean');
            
            expect(responseUser.fail).to.equal(false);

        });


        it('debería realizar login de un usuario de nuevo y retornar token valido', async () => {

            const user= {email:"sample@dot.com",password:"sample"};

            const response = await request.post('/api/login').send(user);
            
            expect(response.status).to.eql(200);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');
            
            expect(responseUser).to.include.keys('token','refresh','fail');

            expect(responseUser.token).to.be.a('string');
            
            expect(responseUser.refresh).to.be.a('string');
            
            expect(responseUser.fail).to.be.a('boolean');
            
            expect(responseUser.fail).to.equal(false);

            expect(responseUser.token).to.equal(tokenUser);
            
            expect(responseUser.refresh).to.equal(refreshTokenUser);

        });


        it('debería mostrar el profile', async () => {

            const response = await request.get('/api/profile').set('Authorization',`Bearer ${tokenUser}`);
            
            expect(response.status).to.eql(200);

            const responseUser = response.body;

            expect(responseUser.profile).to.be.a('object');

            expect(responseUser.profile).to.include.keys('id','roles');

            expect(responseUser.profile.id).to.be.a('string');

            expect(responseUser.profile.roles).to.be.a('array');

            expect(responseUser.profile.id).to.equal("sample@dot.com");

        });

        it('No debería eliminar un usuario sin privilegio', async () => {
            
            const response = await request.delete('/api/delete').set('Authorization',`Bearer ${tokenUser}`).send({email:"sample@dot.com"});
            
            expect(response.status).to.eql(401);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');
            
            expect(responseUser).to.include.keys('message');

            expect(responseUser.message).to.be.a('string');
            
            expect(responseUser.message).to.equal("User not have privileges");

        });
        
        it('debería realizar logout de un usuario', async () => {  
            
            const response = await request.post('/api/logout').set('Authorization',`Bearer ${tokenUser}`).send({token:refreshTokenUser});
            
            expect(response.status).to.eql(200);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');
            
            expect(responseUser).to.include.keys('message');

            expect(responseUser.message).to.be.a('string');
            
            expect(responseUser.message).to.equal("Logout successful");

        });

        it('debería eliminar un usuario', async () => {  
            
            const response = await request.delete('/api/delete').set('Authorization',`Bearer ${tokenAdmin}`).send({email:"sample@dot.com"});
            
            expect(response.status).to.eql(200);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');
            
            expect(responseUser).to.include.keys('message');

            expect(responseUser.message).to.be.a('string');
            
            expect(responseUser.message).to.equal("User Deleted");

        });


        it('debería buscar un usuario', async () => {  
            
            const response = await request.delete('/api/delete').set('Authorization',`Bearer ${tokenAdmin}`).send({email:"sample@dot.com"});
            
            expect(response.status).to.eql(404);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');
            
            expect(responseUser).to.include.keys('message');

            expect(responseUser.message).to.be.a('string');
            
            expect(responseUser.message).to.equal("user not found");

        });
    
    });


    describe('Operations non commons user', () => {
            
        it('debería fallar al usar logout de un usuario', async () => {  

            const response = await request.post('/api/logout').set('Authorization',`Bearer 'dasddaas'`).send({token:"8787uy6y6y6y6y"});
            
            expect(response.status).to.eql(403);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');
            
            expect(responseUser).to.include.keys('message');

            expect(responseUser.message).to.be.a('string');
            
            expect(responseUser.message).to.contain("Token Invalid user");

        });

        it('No debería mostrar el profile', async () => {

            const response = await request.get('/api/profile').set('Authorization',`Bearer 'asdasdasdasdasdd4344jk3j4k3'`);
            
            expect(response.status).to.eql(403);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');

            expect(responseUser).to.include.keys('message');

            expect(responseUser.message).to.be.a('string');
            
            expect(responseUser.message).to.contain("Token Invalid user");
        });


        it('No debería generar un usuario', async () => {  

            const user= {email:"sample",deleted:false,username:faker.internet.userName(),password:"sample"};

            const response = await request.post('/api/signup').send(user);
            
            expect(response.status).to.eql(400);

            const responseUser = response.body;

            expect(responseUser).to.be.a('object');

            expect(responseUser).to.include.keys('message');

            expect(responseUser.message).to.be.a('string');

            expect(responseUser.message).to.contain("Invalid user for creation");

           
        });

        
    });


    
})