//import { expect } from 'chai';
import * as chai from 'chai';
import { NodeMemoryDAO } from '../src/dao/node-memory';
import { INode } from '../src/dao/node';

const nodeDAO = new NodeMemoryDAO();

const expect = chai.expect;

const should = chai.should();


describe('Test NodeMemory for Browser UNIT',async () => {


    before(async function(){

        console.log("###############BEGIN TEST NodeMemory#################");
        
        Promise.all([
        nodeDAO.saveOne({name:'node1'}),
        nodeDAO.saveOne({name:'node2'}),
        nodeDAO.saveOne({name:'node3'}),
        nodeDAO.saveOne({name:'node4'}),
        nodeDAO.saveOne({name:'node5'}),
        ]);

    });

    after(async () => {
        console.log("###############AFTER TEST NodeMemory#################");
        await nodeDAO.deleteAll();
    });

    describe('Operaciones sobre Node DAO Memory', async () => {

        it('Debería agregar un nodo', async () => {

            const item:INode = await nodeDAO.saveOne({name:'node6'});
            expect(item).to.be.an('object');
            expect(item).to.have.property('name');
            expect(item.name).to.equal('node6');
        });

        it('Debería listart todo', async () => {

            const items = await nodeDAO.getAll();
            expect(items).to.be.an('array');
            expect(items).to.length(6);
        });
        
        it('Debería eliminar un nodo', async () => {

            const ok = await nodeDAO.deleteOne({keycustom:'name',valuecustom:'node3'});
            expect(ok).to.be.an('boolean');
            expect(ok).to.equal(true);
        });

        it('Debería buscar un nodo', async () => {

            const node = await nodeDAO.findOne({keycustom:'name',valuecustom:'node4'});
            expect(node).to.be.an('object');
            expect(node).to.have.property('name');
            expect(node.name).to.equal('node4');
        });

        it('Debería actualizar un nodo', async () => {

            const node = await nodeDAO.updateOne("node5",{name:'node999'});
            expect(node).to.be.an('object');
            expect(node).to.have.property('name');
            expect(node.name).to.equal('node999');
        });
        

    });


});
