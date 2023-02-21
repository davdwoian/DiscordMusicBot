import { Model, Schema, model } from 'mongoose';

const LOG = false;

function dblog(message: string): void {
    if (!LOG) return;

    console.log(message);
}

export interface Guild {
    guildId: string,
    scheduleId: string
}

interface GuildModel extends Model<Guild> {
    add(guildId: string): Promise<boolean>,
    rmv(guildId: string): Promise<boolean>,
    put(guildId: string, updates: Guild): Promise<boolean>,
    get(guildId: string, property: string): any,
}

const GuildSchema = new Schema<Guild, GuildModel>({
    guildId: {
        type: String,
        required: true
    },
    scheduleId: String
})

GuildSchema.statics.add = async function(guildId: string): Promise<boolean> {
    try {

        const findStatus = (await this.find({  guildId: guildId })).length != 0;
        if (findStatus) {
            throw new Error(`ADD ERROR`);
        }

        const createStatus = await this.create({ guildId: guildId});
        if (!createStatus) {
            throw new Error(`ADD ERROR`);
        }

        dblog(`SUCCESS: |GUILD|ADD|${guildId}|'`);
        return true;
        
    } catch (error) {


        dblog(`FAILED: |GUILD|ADD|${guildId}|'`);
        return false;
        
    }
}

GuildSchema.statics.rmv = async function(guildId: string): Promise<boolean> {
    try {

        this.remove({ guildId: guildId }, function(err) {
            if (err) {
                throw new Error(`REMOVE ERROR`);
            }
        })

        dblog(`SUCCESS: |GUILD|REMOVE|${guildId}|'`);
        return true;
        
    } catch (error) {

        dblog(`FAILED: |GUILD|REMOVE|${guildId}|'`)
        return false;
        
    }
}

GuildSchema.statics.put = async function(guildId: string, updates: Guild): Promise<boolean> {
    try {

        this.updateOne({ guildId: guildId }, updates).then((error) => {
            if (error) {
                throw new Error(`PUT ERROR`);
            }
        });

        dblog(`SUCCESS: |GUILD|PUT|${guildId},${updates}|'`);
        return true;
        
    } catch(error) {

        dblog(`FAILED: |GUILD|PUT|${guildId},${updates}|'`);
        return false;
        
    } 
}

GuildSchema.statics.get = async function(guildId: string, property: string=''): Promise<any|void> {
    try {

        const guild = await this.findOne({ guildId: guildId });
        if (!guild || !guild[property as keyof Guild]) {
            throw new Error(`GET ERROR`);
        }

        dblog(`SUCCESS: |GUILD|GET|${guildId},${property}|'`);
        return true;
        
    } catch (error) {


        dblog(`FAILED: |GUILD|GET|${guildId},${property}|'`);
        return false;
        
    }
}


export default model<Guild, GuildModel>('Guild', GuildSchema);