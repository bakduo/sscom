import { Schema } from 'mongoose';
import { INode } from '../dao';


export const SchemaNode = new Schema<INode>({
    name: {
        type: String,
        required: false,
        default: '',
    },
    uuid: {
        type: String,
        required: true,
        default: '',
    },
    email: {
        type: String,
        required: false,
        default: '',
      },  
    deleted:{
        type: Boolean,
        required: false,
        default:false,
    },  
    timestamp: {
        type: Number,
        required: true,
        default: Math.floor(Date.now() / 1000),
      },
});