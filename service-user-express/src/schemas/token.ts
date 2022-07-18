import { Schema } from 'mongoose';
import { IToken } from '../dao';

export const SchemaToken = new Schema<IToken>({
    email: {
        type: String,
        required: false,
        unique: true,
    },
    username: {
        type: String,
        required: false,
        unique: true,
    },
    tmptoken: {
        type: String,
        required: true,
        unique: true,
        dropDups: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        dropDups: true
    },
    date: {
        type: Number,
        required: true,
        default: Math.floor(Date.now() / 1000),
    },
    timestamp: {
        type: Number,
        required: true,
        default: Math.floor(Date.now() / 1000),
      },
});
