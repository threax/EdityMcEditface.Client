import * as client from 'edity.editorcore.EdityHypermediaClient';
import * as event from 'hr.eventdispatcher';
import { ExternalPromise } from 'hr.externalpromise';
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as di from 'hr.di';

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
    message: string;
    percentComplete?: number;
}

export interface CompilerPhase {
    execute: (arg: CompilerServiceEventArgs) => Promise<void>;
}

class PrimaryCompilePhase implements CompilerPhase {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [client.EntryPointInjector];
    }

    constructor(private entryInjector: client.EntryPointInjector) {
        
    }

    public async execute(arg: CompilerServiceEventArgs): Promise<void> {
        arg.service.setStatus({ message: "Beginning Publish", percentComplete: 0 })
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

                arg.service.setStatus({ message: "Compiled " + compileResult.data.currentFile + " files of " + compileResult.data.totalFiles, percentComplete: percentage });
                if (compileResult.data.completed) {
                    ep.resolve();
                }
                else {
                    window.setTimeout(worker, 2000);
                }
            }
        };
        window.setTimeout(worker, 2000);
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
    private inPrimaryPhase: boolean = true;

    private status: CompilerStatus;

    private phases: CompilerPhase[] = [];

    constructor(primaryPhase: PrimaryCompilePhase) {
        this.phases.push(primaryPhase);
    }

    public async compile(): Promise<void> {
        this.startedEvent.fire(new CompilerServiceEventArgs(this));
        try {
            for (let i = 0; i < this.phases.length; ++i) {
                this.inPrimaryPhase = i === 0;
                await this.phases[i].execute(new CompilerServiceEventArgs(this));
            }
            this.successEvent.fire(new CompilerServiceEventArgs(this));
        }
        catch (err) {
            this.failedEvent.fire(new CompilerServiceErrorEventArgs(this, err));
            throw err;
        }
    }

    public setStatus(status: CompilerStatus) {
        this.status = status;
        this.statusUpdatedEvent.fire(new CompilerServiceStatusEventArgs(this, status));
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

    public get isPrimaryPhase() {
        return this.inPrimaryPhase;
    }
}

export function addServices(services: di.ServiceCollection) {
    services.tryAddShared(PrimaryCompilePhase, PrimaryCompilePhase);
    services.tryAddShared(CompilerService, CompilerService);
}