export class Http {

    static async post(url: string, params?: any, headers?: { [key: string]: any }) {
        return this._request('POST', url, params, headers);
    }

    static async get(url: string, params?: any, headers?: { [key: string]: any }) {
        return this._request('GET', url, params, headers);
    }

    private static async _request(method: string, url: string, params?: any, headers?: { [key: string]: any }) {
        return new Promise<any>((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            if (!!headers) {
                let keys = Object.keys(headers);
                for (const k of keys) {
                    xhr.setRequestHeader(k, headers[k]);
                }
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (error) {
                            resolve(xhr.responseText);
                        }
                    }
                    else {
                        reject(xhr.status);
                    }
                }
            }
            xhr.send(params ? JSON.stringify(params) : null);
        });
    }

}