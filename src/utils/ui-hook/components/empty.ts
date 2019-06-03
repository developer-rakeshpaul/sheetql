import { htm as html } from '@zeit/integration-utils'
import * as FS from '../fieldsets'

const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://sheetql.zeit.sh' : 'http://localhost:5005'
const GCLOUD_LOGO = `${BASE_URL}/static/gcloud.svg`
const FIREBASE_LOGO = `${BASE_URL}/static/firebase.svg`

export default function Empty() {
  return html`
    <Page>
      <Notice type="message">
        <B>NOTE:</B> In order to link Google Cloud resources to your deploymentst, <ProjectSwitcher />
      </Notice>
      <BR />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Img src=${GCLOUD_LOGO} width="240" />
      </Box>

      <Box>
        <Img src=${FIREBASE_LOGO} width="170" />
      </Box>
      <$${FS.Firestore} disabled />

    </Page>
  `
}
