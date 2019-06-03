import {
  HandlerOptions,
  htm as html,
  withUiHook
} from "@zeit/integration-utils";
import Google from "./utils/google-api";
import { isValidServiceAccount } from "./utils/google-service-account";
import Empty from "./utils/ui-hook/components/empty";
import LoginScreen from "./utils/ui-hook/components/login";
import * as FS from "./utils/ui-hook/fieldsets";
import ZEIT from "./utils/zeit-api";

// Static assets
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://sheetql.zeit.sh"
    : "http://localhost:5005";
const GCLOUD_LOGO = `${BASE_URL}/static/gcloud.svg`;
const FIREBASE_LOGO = `${BASE_URL}/static/firebase.svg`;

export default withUiHook(
  async (handlerOptions: HandlerOptions): Promise<string> => {
    console.log('handlerOptions :', handlerOptions);
    const zeit = new ZEIT(handlerOptions);

    // Before we begin, let's check if the user is disconnecting and clear the data if so
    if (zeit.action === "disconnect") {
      await Promise.all([
        zeit.removeCredentialsFromProject(),
        zeit.clearSecrets()
      ]);
    }

    const config = await zeit.config();
    const projectSettings = zeit.projectId ? config[zeit.projectId] || {} : {};
    let { googleCredentials } = projectSettings;

    // Legacy account, we need to clear it

    // If we're not connected to a Google account
    if (!googleCredentials) {
      if (
        zeit.action &&
        zeit.action.includes("authenticate-account") &&
        zeit.projectId
      ) {
        const [, keyId] = zeit.action.split("authenticate-account-");

        Object.keys(config).forEach((key: string) => {
          const project: ConfigItem = config[key];

          if (
            project.googleCredentials &&
            project.googleCredentials.private_key_id === keyId
          ) {
            googleCredentials = project.googleCredentials;
          }
        });

        // Save credentials in current project
        projectSettings.googleCredentials = googleCredentials;

        await zeit.saveConfig({
          ...config,
          [zeit.projectId]: projectSettings
        });
      } else if (zeit.action === "authenticate" && zeit.projectId) {
        const serviceAcount = zeit.get("service-account");

        try {
          googleCredentials = JSON.parse(serviceAcount);

          if (isValidServiceAccount(googleCredentials)) {
            projectSettings.googleCredentials = googleCredentials;

            await zeit.saveConfig({
              ...config,
              [zeit.projectId]: projectSettings
            });
            // Continue
          } else {
            return html`
              <${LoginScreen}
                inputValue=${googleCredentials}
                error="The JSON you provided doesn’t look like a valid service account key"
                projectId=${zeit.projectId}
                config=${config}
              />
            `;
          }
        } catch (e) {
          return html`
            <${LoginScreen}
              error=${e}
              projectId=${zeit.projectId}
              inputValue=${googleCredentials}
              config=${config}
            />
          `;
        }
      } else {
        return html`
          <${LoginScreen} projectId=${zeit.projectId} config=${config} />
        `;
      }
    }

    // We shouldn't be here in a real-world usage, but in case someone is being shady
    if (!zeit.projectId) {
      return html`
        <${Empty} />
      `;
    }

    // @ts-ignore
    const google = new Google({ googleCredentials });

    let gcpProjects;

    try {
      gcpProjects = await google.projects();

      if (!gcpProjects) {
        throw new Error("no_projects");
      }
    } catch (e) {
      // If we're here, it means user's Cloud Resource Manager API is disabled and we can't proceed until they enable the API
      // We don't want to remember failed credentials in case they're wrong

      await zeit.saveConfig({ googleCredentials: null });

      return html`
        <${LoginScreen}
          projectId=${zeit.projectId}
          error=${e.message === "no_projects"
            ? "This service account doesn't appear to have access to any projects"
            : html`Couldn’t retrieve any projects. Make sure <Link href="https://console.cloud.google.com/apis/library/cloudresourcemanager.googleapis.com" target="_blank">Resource Manager API</Link> is enabled in your project`}
        />
      `;
    }

    const selectedProject = zeit.get("gcp-project") || gcpProjects[0].projectId;
    let { linkedProject } = projectSettings;

    // Save GCP project if switched
    if (linkedProject !== selectedProject) {
      linkedProject = selectedProject;
      projectSettings.linkedProject = linkedProject;

      await zeit.saveConfig({ ...config, [zeit.projectId]: projectSettings });
    }

    const currentProject = linkedProject;

    if (!currentProject) {
      return html`
        <${Empty} />
      `;
    }

    if (zeit.action === "add-env-var") {
      await zeit.ensureCredentials(
        currentProject,
        projectSettings.googleCredentials
      );
      await zeit.addCredentialsToProject();
    }
    if (zeit.action === "remove-env-var") {
      await zeit.removeCredentialsFromProject();
    }

    // This is used to determine whether to show ADD or REMOVE env var buttons
    const hasCredentials = await zeit.checkCredentials();

    // Scheduler job actions
    if (zeit.action) {
      const action = decodeURIComponent(zeit.action);
      console.log('action :', action);
    }

    // ===== Sheets =====
    const firestore = await google.firestore(currentProject); // Need non-breaking space here

    /* eslint-disable no-irregular-whitespace */ return html`
      <Page>
        <Box marginBottom="10px" textAlign="right">
          <ProjectSwitcher />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Img src=${GCLOUD_LOGO} width="240" />
          <Box display="flex" alignItems="center">
            GCP Project:
            <Box width="5px" />
            <Select
              name="gcp-project"
              small
              width="150px"
              disabled=${!zeit.projectId}
              value=${currentProject}
            >
              ${gcpProjects.map(
                (project: any) => html`
                  <Option caption=${project.name} value=${project.projectId} />
                `
              )}
            </Select>
          </Box>
        </Box>
        <Box>
          <Img src=${FIREBASE_LOGO} width="170" />
        </Box>
        <$${FS.Firestore} disabled=${!zeit.projectId}
        apiDisabled=${firestore.disabled} hasCredentials=${hasCredentials} />
        ${zeit.projectId
          ? html`
              <Box
                display="flex"
                flexDirection="column"
                borderTop="1px solid #eaeaea"
                marginTop="20px"
                paddingTop="20px"
              >
                <H2>Disconnect</H2>
                <P>
                  You can disconnect your service account from the integration
                  by clicking the button below.
                  <BR />
                  <BR />
                  Keep in mind,
                  <B
                    >this will only delete your credentials and data from
                    ZEIT</B
                  >.
                  <BR />
                  <BR />
                  Any remaining resources you have created via the integration
                  <B>will remain active</b> and count towards your Google Cloud
                  billing, unless deleted in the console.
                </P>
                <BR />
                <Button shadow secondary action="disconnect">Disconnect</Button>
              </Box>
            `
          : ``}
      </Page>
    `;
  }
);
