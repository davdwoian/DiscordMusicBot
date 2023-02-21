import { Process, Thread } from '../types/index';

export class CommandProcess implements Process {
	preserve: boolean
	args: any[]
	execute: (...args: any[]) => Promise<any>

	constructor(preserve: boolean, args: any[], execute: (...args: any[]) => Promise<any>) {
		this.preserve = preserve;
		this.args = args;
		this.execute = execute;
	}
}

export class CommandThread implements Thread {
	preserve: boolean
	queue: CommandProcess[]

	constructor() {
		this.preserve = false;
		this.queue = [];
	}

	async run(process: Process): Promise<any> {
		try {

			if (this.preserve) {
				this.queue.push(process);
				throw new Error('request queued');
			}

			if (process.preserve) {
				this.preserve = true;
				await process.execute(...process.args);
				this.preserve = false;
			} else {
				process.execute(...process.args);
			}

			if (this.queue.length > 0) this.run(this.queue.shift()!);

		} catch (error) {

		}
	}
}