import  * as fabric  from "../storage/index.mjs";

const typeStorageEntity = process.env.STORAGE_ENTITY || 'memory';

let config = {
    storageEntity: typeStorageEntity,
    databaseUser:{}
};

config.databaseUser = await fabric.getStorage(config.storageEntity);

export {config}
