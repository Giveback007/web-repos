class TYPES {
    readonly loginSuccess = 'LOGIN_SUCCESS';
    readonly logOut = 'LOGOUT';
}

export const Action = new TYPES;

type LoginSuccess = { type: TYPES['loginSuccess']; }
type LogOut = { type: TYPES['logOut']; }

export type AllActions =
    | LoginSuccess
    | LogOut