type StationType = {
    url: string,
    headers?: any,
}

export const isStationType = (obj: any): obj is StationType => {
    return (obj.url !== undefined);
}

export default StationType