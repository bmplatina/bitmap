// Define interface depends on following JSON table
// [
//     {
//         "gameId":0,
//         "gameTitle":"The Humanity",
//         "gamePlatformWindows":1,
//         "gamePlatformMac":1,
//         "gamePlatformMobile":0,
//         "gameEngine":"Unity",
//         "gameGenre":"어드벤처",
//         "gameDeveloper":"입학했더니 무한 팀플과 과제가 쌓여버린 건에 대하여",
//         "gamePublisher":"Bitmap Production",
//         "isEarlyAccess":1,
//         "isReleased":1,
//         "gameReleasedDate":"2021-12-10T00:00:00.000Z",
//         "gameWebsite":"https://wiki.prodbybitmap.com/wiki/The%20Humanity",
//         "gameVideoURL":"WSLxwXMwIog",
//         "gameDownloadMacURL":"https://dl.prodbybitmap.com/download/game/thehumanity/TheHumanityMac_nopasswd",
//         "gameDownloadWinURL":"https://dl.prodbybitmap.com/download/game/thehumanity/TheHumanityWin_nopasswd",
//         "gameImageURL":"https://wiki.prodbybitmap.com/w/images/9/99/TheHumanityPoster1.png",
//         "gameBinaryName":"TheHumanity",
//         "gameHeadline":"오늘 밤, 나는 떠날 것이다",
//         "gameDescription":"서울예술대학교 인터랙티브 인스톨레이션 출품작."
//     },
// ]

interface Game {
    gameId: number;
    gameTitle: string;
    gameLatestRevision: number;
    gamePlatformWindows: number;
    gamePlatformMac: number;
    gamePlatformMobile: number;
    gameEngine: string;
    gameGenre: string;
    gameDeveloper: string;
    gamePublisher: string;
    isEarlyAccess: number;
    isReleased: number;
    gameReleasedDate: string;
    gameWebsite: string;
    gameVideoURL: string;
    gameDownloadMacURL: string | null;
    gameDownloadWinURL: string | null;
    gameImageURL: string;
    gameBinaryName: string;
    gameHeadline: string;
    gameDescription: string;
}

export { Game };