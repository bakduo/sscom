import { Schema } from 'mongoose';
import { IToken } from '../dao';

export const SchemaToken = new Schema<IToken>({
    token: {
        type: String,
        required: true,
        unique: true,
        default: '',
    },
    date: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
        default: Math.floor(Date.now() / 1000),
      },
});