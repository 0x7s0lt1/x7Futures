export enum AssetsMode {
    MULTIPLE = "MULTIPLE",
    SINGLE = "SINGLE"
}

export const isAssetsMode = (value: any): value is AssetsMode => {
    return Object.values(AssetsMode).includes(value);
}