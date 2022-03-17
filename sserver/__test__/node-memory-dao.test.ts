import * as chai from 'chai';
import { v4 as uuidv4 } from 'uuid';
import { NodeDTO } from '../src/dto/node';
import { nodeDAO } from '../src/initconfig/configure';


const expect = chai.expect;


describe('Test NodeMemory for Browser UNIT',async () => {


    let listaNodes:NodeDTO[];

    before(async function(){

        console.log("###############BEGIN TEST NodeMemory#################");
        
        Promise.all([
        nodeDAO.saveOne({uuid:uuidv4()}),
        nodeDAO.saveOne({uuid:uuidv4()}),
        nodeDAO.saveOne({uuid:uuidv4()}),
        nodeDAO.saveOne({uuid:uuidv4()}),
        nodeDAO.saveOne({uuid:uuidv4()}),
        ]);

    });

    after(async () => {
        console.log("###############AFTER TEST NodeMemory#################");
        await nodeDAO.deleteAll();
    });

    describe('Operaciones sobre Node DAO Memory', async () => {

        it('Debería agregar un nodo', async () => {

            const orig = uuidv4();
            const item= await nodeDAO.saveOne({uuid:orig});
            expect(item).to.be.an('object');
            expect(item).to.have.property('uuid');
            expect(item.uuid).to.equal(orig);
        });

        it('Debería listart todo', async () => {

            listaNodes = await nodeDAO.getAll();
            expect(listaNodes).to.be.an('array');
            expect(listaNodes).to.length(6);
        });
        
        it('Debería eliminar un nodo', async () => {

            const ok = await nodeDAO.deleteOne({keycustom:'uuid',valuecustom:listaNodes[2].uuid});
            expect(ok).to.be.an('boolean');
            expect(ok).to.equal(true);
        });

        it('Debería buscar un nodo', async () => {

            const node = await nodeDAO.findOne({keycustom:'uuid',valuecustom:listaNodes[3].uuid});
            expect(node).to.be.an('object');
            expect(node).to.have.property('uuid');
            expect(node.uuid).to.equal(listaNodes[3].uuid);
        });

        it('Debería actualizar un nodo', async () => {

            const newNode = uuidv4();
            const node = await nodeDAO.updateOne(listaNodes[3].uuid,{uuid:newNode});
            expect(node).to.be.an('object');
            expect(node).to.have.property('uuid');
            expect(node.uuid).to.equal(newNode);
        });
        

    });


});
