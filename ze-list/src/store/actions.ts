import type { Action as Act } from "@giveback007/browser-utils";

type LogIn = Act<'login'>;

type LogOut = Act<'logout'>;

type LogInRefresh = Act<'login-refresh'>;

export type AllActions = LogIn | LogOut | LogInRefresh;