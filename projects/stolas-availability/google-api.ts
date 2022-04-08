import { auth } from "./store";
import { readXL } from "./utils";

export class GoogleApis {

    private async getJSON<T>(url: string) {
        try {
            const token = (await auth.google).currentUser.get().getAuthResponse().access_token;
            if (!token) throw new Error('Token not set');

            // &access_token=${token}
            const res = await fetch(`https://www.googleapis.com/${url}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return await res.json() as T;
        } catch(err) {
            console.log(err);
            throw new Error();
        }
    }

    private async getFile(url: string, fileName: string) {
        try {
            const token = (await auth.google).currentUser.get().getAuthResponse().access_token;
            if (!token) throw new Error('Token not set');

            const res = await fetch(`https://www.googleapis.com/${url}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            

            return new File([await res.blob()], fileName, {lastModified: Date.now()});
        } catch(err) {
            console.log(err);
            throw new Error();
        }
    }

    searchXL = async (searchStr: string) => {
        const mimeTypes = `(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')`;
        const search = `name contains '${searchStr}' and ${mimeTypes}`;
        
        return this.getJSON<GFilesSearch>(`drive/v3/files?q=${search}`);
    }

    downloadXL = async (id: string) => {
        return await this.getFile(`drive/v3/files/${id}?alt=media`, 'xl-doc');
    }
}

export interface GFilesSearch {
    kind:             string;
    incompleteSearch: boolean;
    files:            GFile[];
}

export interface GFile {
    kind:     string;
    id:       string;
    name:     string;
    mimeType: string;
}
