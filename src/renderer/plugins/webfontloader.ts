/**
 * plugins/webfontloader.js
 *
 * webfontloader documentation: https://github.com/typekit/webfontloader
 */

export async function loadFonts() {
    const webFontLoader = await import(
        /* webpackChunkName: "webfontloader" */ "webfontloader"
        );

    webFontLoader.load({
        google: {
            families: [
                "Noto Sans KR:100,200,300,400,500,600,700,800,900",
                "JetBrains Mono:100,200,300,400,500,600,700,800:ital@0;1",
                "Roboto:100,300,400,500,700,900&display=swap",
            ],
        },
        custom: {
            families: ["Pretendard"],
            urls: ["https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"]
        },
        active() {
            console.log('Web fonts have been loaded.');
        },
        inactive() {
            console.log('Web fonts failed to load.');
        }
    });
}
