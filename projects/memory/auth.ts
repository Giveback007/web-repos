type LoginTypes = 
    | 'google'
    | 'twitter'

// TODO: handle already sign in
export class Auth {

    private resGoogle!: (val: gapi.auth2.GoogleAuthBase) => any;
    readonly google = new Promise<gapi.auth2.GoogleAuthBase>((res) => this.resGoogle = res);


    constructor(args: {
        GOOGLE_CLIENT_ID: string
    }) {
        // test if every arg is passed correctly
        Object.entries(args).forEach(([key, val]) =>
            !val && console.error('Missing auth argument!:', { [key]: val }));


        this.init(args);
        // TODO if online/offline
    }

    /** Sign in to a specific auth */
    signIn = async (type: LoginTypes) => {
        switch (type) {
            case 'google':
                const gAuth = await this.google;
                return gAuth.signIn();
            default:
                throw new Error(`signIn [type: ${type}] not implemented`)
        }
    }

    /** Sign out of specific | all auth */
    singOut = async (type: LoginTypes | 'all' = 'all') => {
        switch (type) {
            case 'google':
                const gAuth = await this.google;
                return gAuth.disconnect();
                // return gAuth.signOut();
            default:
                throw new Error(`signOut [type: ${type}] not implemented`)
        }
    }

    /** Refresh all logins */
    refresh = async () => {
        const gAuth = await this.google;
        // const googleUser = gAuth.currentUser.get();
        // const isSignedIn = googleUser.isSignedIn();

        // if (!isSignedIn) await googleUser.reloadAuthResponse();

        if (gAuth.isSignedIn.get()) {
            return {
                type: 'success',
                googleUser: gAuth.currentUser.get()
            } as const;
        } else {
            return {
                type: 'failed'
            } as const;
        }
        
    }

    private init(p: ConstructorParameters<typeof Auth>[0]) {
        // Google
        const gScript = document.createElement('script');
        gScript.type = "text/javascript";
        gScript.src = "https://apis.google.com/js/platform.js";
        document.head.appendChild(gScript);
        gScript.onload = () => {
            // https://developers.google.com/identity/sign-in/web/reference
            gapi.load('auth2', () => {
                // for more config options:
                // https://developers.google.com/identity/sign-in/web/reference#gapiauth2clientconfig
                const GoogleAuth = gapi.auth2.init({
                    // CREDENTIALS PAGE: https://console.developers.google.com/apis/credentials?project=my-docs-341319
                    client_id: p.GOOGLE_CLIENT_ID, 
                    scope: "profile"
                        + " https://www.googleapis.com/auth/drive"
                        // https://developers.google.com/drive/api/guides/appdata
                        + " https://www.googleapis.com/auth/drive.appdata"
                });

                GoogleAuth.then(async (gAuth) => {
                        
                        this.resGoogle(gAuth);
                    }, (err) => {
                        console.log('UNHANDLED For Google AUTH');
                        console.error(err);
                });

                // const x = global.gapi.client.load('drive', 'v3');
                // log(x)
            });
            
        }
    }
}

// export const auth = new Auth({
//     GOOGLE_CLIENT_ID
// });