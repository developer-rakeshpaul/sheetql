/**
 * NOTE: Some of this code implements OAuth authentication with full access to GCP
 * However Google refused to approve the integration because `cloud-platform` OAuth scope is "too broad"
 * They said we should use service accounts instead since there aren't any less broad scopes, so
 * until we can convince Google that we really want OAuth, I'm gonna leave this code here unused
 */

import { GaxiosResponse } from "gaxios";
import { JWT, JWTInput } from "google-auth-library";
import { cloudresourcemanager_v1, google, GoogleApis, } from "googleapis";

interface GoogleOptions {
  // oauth?: Credentials;
  googleCredentials: JWTInput;
}

export class GoogleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleError";
  }
}

export const format = (response: GaxiosResponse<any>, field: string): any => {
  if (response && response.data) {
    return response.data[field];
  }

  return null;
};

// const { CLIENT_ID, CLIENT_SECRET, BASE_URL } = process.env
// const REDIRECT_URL = `${BASE_URL}/connect`

export default class Google {
  private auth: JWT;
  private client: GoogleApis;
  constructor(options: GoogleOptions) {
    this.auth = google.auth.fromJSON(options.googleCredentials) as JWT;
    this.auth.scopes = "https://www.googleapis.com/auth/cloud-platform";

    console.log("Created Google client with service account");

    this.client = google;
    this.client.options({
      auth: this.auth
    });
  }
  projects = async (): Promise<cloudresourcemanager_v1.Schema$Project[]> => {
    console.log('Fetching GCP Projects')

    try {
      const res = await this.client.cloudresourcemanager('v1').projects.list()

      return format(res, 'projects')
    } catch (e) {
      throw new GoogleError(e)
    }
  }

  firestore = async (projectId: string) => {
    console.log('Checking Firestore availability')

    try {
      await this.client.firestore('v1').projects.locations.list({
        name: `projects/${projectId}`
      })

      return {}
    } catch (e) {
      if (e.toString().includes('Error 404 (Not Found)')) {
        return { disabled: true }
      }

      const error = format(e.response, 'error')
      return { error: error ? error.message : null }
    }
  }

  spreadsheets = async (): Promise<any> => {
    console.log("Fetching Google sheets");
    try {
      const res = await this.client.sheets("v4");
      return res;
    } catch (e) {
      throw new GoogleError(e);
    }
  };
}
