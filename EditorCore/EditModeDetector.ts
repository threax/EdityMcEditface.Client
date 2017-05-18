export function IsEditMode(): boolean {
    return (<any>window).editPageSettings !== undefined;
}