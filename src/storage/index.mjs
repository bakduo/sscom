import MemoryRAM from "./memory.mjs";

const getStorage = async (type) => {

    let storage = {};

    switch (type) {
        case 'memory':
            storage = new MemoryRAM();
            break;
    }

    return storage;
}

export {getStorage}