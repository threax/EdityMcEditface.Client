import * as EdityClient from 'edity.editorcore.EdityClient';
import * as event from 'hr.eventdispatcher';
import { ExternalPromise } from 'hr.externalpromise';
import { Fetcher } from 'hr.fetcher';
import * as editorServices from 'edity.editorcore.EditorServices';
import * as di from 'hr.di';
import { IBaseUrlInjector } from 'edity.editorcore.BaseUrlInjector';

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
}

export interface CompilerPhase {
    execute: (arg: CompilerServiceEventArgs) => Promise<any>;
}

class PrimaryCompilePhase implements CompilerPhase {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [EdityClient.CompileClient];
    }

    constructor(private compileClient: EdityClient.CompileClient) {
        
    }

    execute(arg: CompilerServiceEventArgs) {
        arg.service.setStatus({ message: "Publishing Website" })
        return this.compileClient.compile(null)
            .then(r => {
                arg.service.setStatus({ message: "Website compiled in " + r.elapsedSeconds + " seconds." });
                return r;
            });
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

    private phases: CompilerPhase[] = [];

    constructor(primaryPhase: PrimaryCompilePhase) {
        this.phases.push(primaryPhase);
    }

    public compile(): Promise<any> {
        this.startedEvent.fire(new CompilerServiceEventArgs(this));

        var compilePromise = new ExternalPromise<any>();

        var currentPhase: CompilerPhase;
        var currentPromise: Promise<any>;
        var i = 0;
        var runPhase = () => {
            if (i < this.phases.length) {
                currentPhase = this.phases[i++];
                currentPhase.execute(new CompilerServiceEventArgs(this))
                    .then(r => {
                        runPhase();
                    })
                    .catch(err => {
                        compilePromise.reject(err);
                    });
            }
            else {
                compilePromise.resolve();
            }
        };
        runPhase();

        return compilePromise.Promise.then(r => {
            this.successEvent.fire(new CompilerServiceEventArgs(this));
            return r;
        })
        .catch(err => {
            this.failedEvent.fire(new CompilerServiceErrorEventArgs(this, err));
            return err;
        });
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
}

export function addServices(services: di.ServiceCollection) {
    editorServices.addServices(services);
    services.tryAddShared(EdityClient.CompileClient, s => {
        var fetcher = s.getRequiredService(Fetcher);
        var shim = s.getRequiredService(IBaseUrlInjector);
        return new EdityClient.CompileClient(shim.BaseUrl, fetcher);
    });
    services.tryAddShared(PrimaryCompilePhase, PrimaryCompilePhase);
    services.tryAddShared(CompilerService, CompilerService);
}