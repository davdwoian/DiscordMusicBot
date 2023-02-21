export interface Process {
    /** preserve the thread, queue later process until finished */
    preserve: boolean,
    /** arguments for the process function */
    args: any[],
    /** async function executed when the thread is not preserved */
    execute: (...args: any[]) => Promise<any>
}

export interface Thread {
    /** preserve status of the thread */
    preserve: boolean,
    /** store process to be executed */
    queue: Process[],
    /** execute the process, queue it if the thread is preserved */
    run(process: Process): Promise<any>
}