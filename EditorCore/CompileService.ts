﻿import * as client from './EdityHypermediaClient';
import * as event from 'htmlrapier/src/eventdispatcher';
import { ExternalPromise } from 'htmlrapier/src/externalpromise';
import * as di from 'htmlrapier/src/di';

export class CompilerServiceEventArgs {
    service: CompilerService;

    constructor(service: CompilerService) {
        this.service = service;
    }
}

export class CompilerServiceErrorEventArgs extends CompilerServiceEventArgs {
    error: any;

    constructor(service: CompilerService, error: any) {
        super(service);
        this.error = error;
    }
}

export class CompilerServiceStatusEventArgs extends CompilerServiceEventArgs {
    status: CompilerStatus;

    constructor(service: CompilerService, status: CompilerStatus) {
        super(service);
        this.status = status;
    }
}

export interface CompilerStatus {
    messages?: string[];
    percentComplete?: number;
    currentFile?: number;
    totalFiles?: number;
}

export interface CompilerPhase {
    execute: (arg: CompilerServiceEventArgs) => Promise<void>;
}

class PrimaryCompilePhase implements CompilerPhase {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [client.EntryPointInjector];
    }

    private refreshTime = 800;

    constructor(private entryInjector: client.EntryPointInjector) {
        
    }

    public async execute(arg: CompilerServiceEventArgs): Promise<void> {
        arg.service.setStatus({ messages: ["Beginning Publish"], percentComplete: 0 });
        var entry = await this.entryInjector.load();
        if (!entry.canCompile()) {
            throw new Error("Cannot compile website.");
        }
        var compileResult = await entry.compile();
        await this.updateStatus(compileResult, arg);
    }

    private updateStatus(compileResult: client.CompileProgressResult, arg: CompilerServiceEventArgs): Promise<void> {
        var ep = new ExternalPromise<void>();
        var worker = async () => {
            if (compileResult.canRefresh()) {
                compileResult = await compileResult.refresh();

                var percentage = 0;
                if (compileResult.data.totalFiles != 0) {
                    percentage = compileResult.data.currentFile / compileResult.data.totalFiles * 100;
                }

                var status: CompilerStatus = Object.create(compileResult.data);
                status.percentComplete = percentage;
                arg.service.setStatus(status);
                if (compileResult.data.completed) {
                    if (compileResult.data.success) {
                        ep.resolve();
                    }
                    else {
                        ep.reject(compileResult.data.errorMessage);
                    }
                }
                else {
                    window.setTimeout(worker, this.refreshTime);
                }
            }
        };
        window.setTimeout(worker, this.refreshTime);
        return ep.Promise;
    }
}

export class CompilerService {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [PrimaryCompilePhase];
    }

    private startedEvent = new event.ActionEventDispatcher<CompilerServiceEventArgs>();
    private statusUpdatedEvent = new event.ActionEventDispatcher<CompilerServiceStatusEventArgs>();
    private successEvent = new event.ActionEventDispatcher<CompilerServiceEventArgs>();
    private failedEvent = new event.ActionEventDispatcher<CompilerServiceErrorEventArgs>();

    private status: CompilerStatus;
    private running: boolean = false;

    private phases: CompilerPhase[] = [];

    constructor(primaryPhase: PrimaryCompilePhase) {
        this.phases.push(primaryPhase);
    }

    public async compile(): Promise<void> {
        this.running = true;
        this.startedEvent.fire(new CompilerServiceEventArgs(this));
        try {
            for (let i = 0; i < this.phases.length; ++i) {
                await this.phases[i].execute(new CompilerServiceEventArgs(this));
            }
            this.successEvent.fire(new CompilerServiceEventArgs(this));
        }
        catch (err) {
            this.failedEvent.fire(new CompilerServiceErrorEventArgs(this, err));
            throw err;
        }
        finally {
            this.running = false;
        }
    }

    /**
     * Set the entire compiler status, this will replace everything being displayed.
     * @param status
     */
    public setStatus(status: CompilerStatus) {
        this.status = status;
        this.statusUpdatedEvent.fire(new CompilerServiceStatusEventArgs(this, status));
    }

    /**
     * Add a single message to the current compiler status. This is the reccomended approach to outputting
     * messages.
     * @param message
     */
    public addMessage(message: string) {
        if (this.status === undefined) {
            this.status = {};
        }
        if (this.status.messages === undefined || this.status.messages === null) {
            this.status.messages = [];
        }
        this.status.messages.push(message);
        this.statusUpdatedEvent.fire(new CompilerServiceStatusEventArgs(this, this.status));
    }

    public addCompilationPhase(phase: CompilerPhase) {
        this.phases.push(phase);
    }

    public get onStarted() {
        return this.startedEvent.modifier;
    }

    public get onStatusUpdated() {
        return this.statusUpdatedEvent.modifier;
    }

    public get onSuccess() {
        return this.successEvent.modifier;
    }

    public get onFailed() {
        return this.failedEvent.modifier;
    }

    public get isRunning(): boolean {
        return this.running;
    }
}

export function addServices(services: di.ServiceCollection) {
    services.tryAddShared(PrimaryCompilePhase, PrimaryCompilePhase);
    services.tryAddShared(CompilerService, CompilerService);
}