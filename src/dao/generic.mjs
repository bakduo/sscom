export default class GenericDAO {

    save = async (body) => {
        throw new Error('Implement concrete class');
    }

    findOne = async (id) => {
        throw new Error('Implement concrete class');
    }

    updateOne = async (id,body) => {
        throw new Error('Implement concrete class');
    }

    deleteOne = async (id) => {
        throw new Error('Implement concrete class');
    }

    getAll = async (id) => {
        throw new Error('Implement concrete class');
    }

}