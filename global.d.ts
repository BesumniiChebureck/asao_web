export {};

declare global {
    var DEBUG_MODE: boolean;
    var ASAO_MAIN_API_HOST: string;
    var ASAO_ACCESS_TOKEN_NAME: string;
    var DEBUG_MODE_WITHOUT_AUTH: boolean;
    var DEBUG_MODE_WITHOUT_API: boolean;

    interface Window {
        [key: string]: any;
    }
}