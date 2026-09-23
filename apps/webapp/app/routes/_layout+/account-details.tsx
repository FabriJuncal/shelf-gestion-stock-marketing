import { useTranslation } from "react-i18next";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { data, Link, Outlet, useRouteLoaderData } from "react-router";
import { ErrorContent } from "~/components/errors";
import Header from "~/components/layout/header";
import HorizontalTabs from "~/components/layout/horizontal-tabs";
import { createI18n } from "~/i18n/i18n";
import { resolveRequestLanguage } from "~/i18n/language.server";
import type { loader as layoutLoader } from "~/routes/_layout+/_layout";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { makeShelfError } from "~/utils/error";
import { payload, error } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";

export const handle = {
  breadcrumb: () => <Link to="/account-details">Account Details</Link>,
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;
  try {
    await requirePermission({
      userId,
      request,
      entity: PermissionEntity.userData,
      action: PermissionAction.read,
    });

    const i18n = createI18n(await resolveRequestLanguage({ request }));
    const title = i18n.t("settings:accountTitle");
    const subHeading = i18n.t("settings:description");
    const header = {
      title,
      subHeading,
    };

    return payload({ header });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];

export const shouldRevalidate = () => false;

export default function AccountDetailsPage() {
  const { t } = useTranslation();
  const items = [
    { to: "general", content: t("settings:general") },
    { to: "workspace", content: t("settings:workspaces") },
    { to: "calendars", content: t("settings:calendars") },
  ];

  const enablePremium = useRouteLoaderData<typeof layoutLoader>(
    "routes/_layout+/_layout"
  )?.enablePremium;

  if (enablePremium) {
    items.push({ to: "subscription", content: t("settings:subscription") });
  }

  return (
    <>
      <Header hidePageDescription />
      <HorizontalTabs items={items} />
      <div>
        <Outlet />
      </div>
    </>
  );
}

export const ErrorBoundary = () => <ErrorContent />;
