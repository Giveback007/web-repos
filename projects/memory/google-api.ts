import { AnyObj, hasKey, isType } from "@giveback007/util-lib";
import { auth } from "./store";

export class GoogleApis {
    private getToken = async () => {
        const token = (await auth.google).currentUser.get().getAuthResponse().access_token;
        if (!token) throw new Error('Token not set');

        return token;
    }

    private get = async (url: string) => {
        try {
            const token = await this.getToken();
            return fetch(`https://www.googleapis.com/${url}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch(err) {
            console.log(err);
            throw new Error();
        }
    }

    private post = async (url: string, body?: BodyInit | null) => {
        try {
            const token = await this.getToken();
            return fetch(`https://www.googleapis.com/${url}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body
            });
        } catch(err) {
            console.log(err);
            throw new Error();
        }
    }

    private delete = async (url: string) => {
        try {
            const token = await this.getToken();
            return fetch(`https://www.googleapis.com/${url}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch(err) {
            console.log(err);
            throw new Error();
        }
    }

    private checkRes = async (res: Response) => {
        if (res.ok) return res;
        console.error('FETCH ERROR:')

        log(res);
        log(await res.json());

        throw new Error();
    }

    private patch = async (url: string, body?: AnyObj | null) => {
        try {
            const token = await this.getToken();
            const opts: RequestInit = {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            };

            if (body !== undefined)
                opts.body = JSON.stringify(body)

            const res = await fetch(`https://www.googleapis.com/${url}`, opts);
            
            return this.checkRes(res);
        } catch(err) {
            log(err);
            throw new Error();
        }
    }

    private async getJSON<T>(url: string) {
        const res = await this.get(url);
        return await res.json() as T;
    }

    private async getFile(url: string, fileName: string) {
        const res = await this.get(url);
        return new File([await res.blob()], fileName, { lastModified: Date.now() });
    }

    getFileMetaData = (id: string, fields: string[] = []) =>
        // https://developers.google.com/drive/api/guides/fields-parameter
        this.getJSON(`drive/v3/files/${id}` + fields.length ? `fields=${fields.join(',')}` : '');

    deleteFile = async (id: string) => {
        await this.delete(`drive/v3/files/${id}`);
        return true;
    }

    uploadFile = async (formData: FormData) => {
        const res = await this.post('upload/drive/v3/files?uploadType=multipart&fields=id', formData);
        return await res.json() as { id: string };
    }

    updateFile = async (id: string, obj: AnyObj) => {
        const res = await this.patch(`upload/drive/v3/files/${id}?uploadType=media`, obj);
        return await res.json() as { id: string };
    }

    searchJSON = async (opts: {
        appDataFolder?: boolean
    } & ({
        contains?: string;
    } | {
        name?: string;
    })) => {
        const mimeTypes = `(mimeType = 'application/json')`;
        // const search = `name ${hasKey(opts, 'name') ? `= '${opts.name}'` : `contains ${opts.contains}`} and ${mimeTypes}`;

        let search = '';
        if (hasKey(opts, 'name'))       search += `name = '${opts.name}' and `;
        if (hasKey(opts, 'contains'))   search += `name contains '${opts.contains}' and `;
        search += `${mimeTypes}`;

        return this.getJSON<GFilesSearch>(`drive/v3/files?${opts.appDataFolder ? 'spaces=appDataFolder&' : ''}q=${search}`);
    }

    readJSONFile = async <T = any>(id: string) => {
        const res = await this.get(`drive/v3/files/${id}?alt=media`);
        const fr = new FileReader();

        return new Promise<T>(async (respond, rej) => {
            fr.onload = (e) => {
                const result = e.target?.result;
                if (!isType(result, 'string') || !result)
                    return rej(`Failed To Read JSON File ${id}`);
    
                respond(JSON.parse(result));
            };
    
            fr.readAsText(await res.blob());
        });
    }

    searchXL = async (searchStr: string) => {
        const mimeTypes = `(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')`;
        const search = `name contains '${searchStr}' and ${mimeTypes}`;
        
        return this.getJSON<GFilesSearch>(`drive/v3/files?q=${search}`);
    }

    downloadXL = async (id: string, fileName = 'xl-doc') => {
        return await this.getFile(`drive/v3/files/${id}?alt=media`, fileName);
    }

    writeCell = async (cell: string, text: string) => {
        
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
