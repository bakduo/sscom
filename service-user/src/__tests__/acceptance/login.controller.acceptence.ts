import {Client, expect} from '@loopback/testlab';
import {UserapiApplication} from '../..';
import {Userlogin} from '../../models';
import {Usersignup} from '../../models/usersignup.model';
import {setupApplication} from './test-helper';

describe('LoginbController', () => {
  let app: UserapiApplication;
  let client: Client;
  let userfakesignup: Usersignup;
  let userfakelogin: Userlogin;
  let userfakesignup2: Usersignup;
  let userfakelogin2: Userlogin;
  let tokenTest = '';

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());

    userfakesignup = new Usersignup({
      email:'8y6eezWBTg@domain.tld',
      password:'792a68d4c07e7f65',
      username:'Cw8TXUs5Mw',
      roles:['admin'],
    });

    userfakelogin = new Userlogin({
      email:'8y6eezWBTg@domain.tld',
      password:'792a68d4c07e7f65',
    });

    userfakesignup2 = new Usersignup({
      email:'Cw8TXUs5Mw@domain.tld',
      password:'792a68d4c07e7f65',
      username:'Cw8TXUs5Mw',
      roles:['user'],
    });

    userfakelogin2 = new Userlogin({
      email:'Cw8TXUs5Mw@domain.tld',
      password:'792a68d4c07e7f65',
    });

  });

  after(async () => {
    await app.stop();
  });

  it('Login signup admin', async () => {
    const res = await client.post('/api/signup').send(userfakesignup).expect(200);

    expect(res.body).to.containEql({email: "8y6eezWBTg@domain.tld",status:true});

  });

  it('Login user admin', async () => {

    const res = await client.post('/api/login').send(userfakelogin).expect(200);

    expect(res.body).to.be.Object();
    expect(res.body).to.have.properties('token','status');
    expect(res.body.token).to.be.String();
    tokenTest = res.body.token;
    //expect(res.body).to.containEql({token: "untoken",status:true});

  });

  it('Get test auth role admin', async () => {

    const res = await client.get('/api/user/8y6eezWBTg@domain.tld').set('Authorization',`Bearer ${tokenTest}`).send().expect(200);
    expect(res.body).to.be.Object();
    expect(res.body).to.containEql({email: "8y6eezWBTg@domain.tld",status:true});

  });

  it('Disable user admin', async () => {

    const res = await client.post('/api/disable').send({email:userfakelogin.email}).expect(200);
    expect(res.body).to.be.Object();
    expect(res.body).to.containEql({email: "8y6eezWBTg@domain.tld",status:true});

  });

  it('Login signup', async () => {
    const res = await client.post('/api/signup').send(userfakesignup2).expect(200);

    expect(res.body).to.containEql({email: "Cw8TXUs5Mw@domain.tld",status:true});

  });

  it('Login user', async () => {

    const res = await client.post('/api/login').send(userfakelogin2).expect(200);

    expect(res.body).to.be.Object();
    expect(res.body).to.have.properties('token','status');
    expect(res.body.token).to.be.String();
    tokenTest = res.body.token;

  });

  it('Denied test auth role ', async () => {

    const res = await client.get('/api/user/Cw8TXUs5Mw@domain.tld').set('Authorization',`Bearer ${tokenTest}`).send().expect(403);
    expect(res.body).to.be.Object();
    expect(res.body.error).to.have.properties('statusCode','name','message');
    expect(res.body.error.message).to.containEql('Access denied');

  });

  it('Disable user', async () => {

    const res = await client.post('/api/disable').send({email:userfakelogin2.email}).expect(200);
    expect(res.body).to.be.Object();
    expect(res.body).to.containEql({email: "Cw8TXUs5Mw@domain.tld",status:true});

  });




});
