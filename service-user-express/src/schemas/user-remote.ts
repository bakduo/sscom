import { Schema } from 'mongoose';
import { IUserRemote } from '../dao';


export const SchemaUserRemote = new Schema<IUserRemote>({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    roles:{
        type: [String],
        required: true,
        default: [],
    },
    email: {
        type: String,
        required: true,
        unique: true,
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