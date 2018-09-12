import {default as dataJson} from '../../git-version.json';

const defaultVersion = { tag: 'v0.0.0', hash: 'dev' };

export const versionInfo = (() => {
    try {
        // tslint:disable-next-line:no-var-requires

        if (dataJson.hash) {
            return dataJson;
        } else {
            return defaultVersion;
        }
    } catch {
        // In dev the file might not exist:
        return defaultVersion;
    }
})();
