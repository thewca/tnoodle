export default interface RunningVersion {
    projectName: string;
    projectVersion: string;
    signedBuild: boolean;
    signatureKeyBytes: string;
}
