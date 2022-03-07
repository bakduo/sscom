import { Schema } from 'mongoose';
import { IUserRemote } from '../dao/user-remote';


export const SchemaUserRemote = new Schema<IUserRemote>({
    username: {
        type: String,
        required: true,
        default: '',
    },
    password: {
        type: String,
        required: true,
        default: '',
    },
    roles:{
        type: [String],
        required: true,
        default: [],
    },
    email: {
        type: String,
        required: false,
        default: '',
      },  
    deleted:{
        type: Boolean,
        required: true,
        default:false,
    },  
    timestamp: {
        type: Number,
        required: true,
        default: Math.floor(Date.now() / 1000),
      },
});