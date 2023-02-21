import mongoose from 'mongoose';
mongoose.set('strictQuery', true);

export function connect(databaseURL: string) {
    mongoose.connect(databaseURL);
}

export default connect;
export { default as iGuild } from './Guild';

// export async function add(model, ...args) {
//     switch (model) {
//         case 'User': return await User.add(...args);
//         default: return false;
//     }
// }

// export async function rmv(model, ...args) {
//     switch (model) {
//         case 'User': return await User.rmv(...args);
//         default: return false;
//     }
// }
// export async function get(model, ...args) {
//     switch (model) {
//         case 'User': return await User.get(...args);
//         default: return false;
//     }
// }

// export async function put(model, ...args) {
//     switch (model) {
//         case 'User': return await User.put(...args);
//         default: return false;
//     }
// }
