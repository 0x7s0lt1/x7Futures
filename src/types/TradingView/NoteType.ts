export enum NoteType{
    TEST = "TEST",
    DEBUG = "DEBUG",
}

/**
 * Check if the given value is a valid NoteType.
 *
 * @param {any} value - The value to check
 * @return {value is NoteType} Whether the value is a valid NoteType
 */
export const isNoteType = (value: any): value is NoteType => {
    return Object.values(NoteType).includes(value);
}