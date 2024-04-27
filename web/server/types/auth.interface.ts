export interface ILoginRequestParams {
    clientMac: string;
    clientIp: string;
    apIp: string;
    apMac: string;
    acIp: string;
    acMac: string;
    ssid: string;
    acceptCallback: string;
    redirectUrl: string;
}

export interface ILoginQueryParams {
    ['client-ip']: string;
    ['client-mac']: string;
    ['ap-ip']: string;
    ['ap-mac']: string;
    ['ac-ip']: string;
    ['ac-mac']: string;
    ['ssid']: string;
    ['accept-callback']: string;
    ['redirect-url']: string;
}