import { Schema } from 'mongoose';
import { IUserRemote } from '../dao';


export const SchemaUserRemote = new Schema<IUserRemote>({
    username: {
        type: String,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
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
        trim: true,
        unique: true,
        index: true,
        dropDups: true
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

//SchemaUserRemote.index({ email: 1}, { unique: true});