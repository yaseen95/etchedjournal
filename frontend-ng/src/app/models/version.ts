/**
 * Represents a semantic version
 */
export class Version {
    public readonly major: number;
    public readonly minor: number;
    public readonly patch: number;

    private constructor(version: { major: number; minor: number; patch: number }) {
        this.major = version.major;
        this.minor = version.minor;
        this.patch = version.patch;
    }

    public static from(str: string): Version {
        const parts = str.split('.');
        if (parts.length !== 3) {
            throw new Error(`Invalid format: ${str}`);
        }
        const major = parseInt(parts[0], 10);
        const minor = parseInt(parts[1], 10);
        const patch = parseInt(parts[2], 10);
        return new Version({ major, minor, patch });
    }

    public toString() {
        return `${this.major}.${this.minor}.${this.patch}`;
    }
}
