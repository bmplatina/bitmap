import { Game } from "./GameList";

const enum EInstallState {
    NotInstalled,
    Downloading,
    Extracting,
    Installed,
    InstallError
}

interface GameInstallInfo extends Game {
    gameInstallationPath: string;
    gameInstalledVersion: string;
    gameInstallState: EInstallState;
}

export { GameInstallInfo, EInstallState };