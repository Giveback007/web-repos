class TYPES {
    readonly loginSuccess = 'LOGIN_SUCCESS';
    readonly logOut = 'LOGOUT';
    // readonly loadDoc = 'LOAD_XL_DOCUMENT';
}

export const Action = new TYPES;

type LoginSuccess = { type: TYPES['loginSuccess']; }
type LogOut = { type: TYPES['logOut']; }

// type LoadDoc = { type: TYPES['loadDoc']; data: GDriveFile };

export type AllActions =
    | LoginSuccess
    | LogOut
    // | LoadDoc;
    // | LoginRefresh;