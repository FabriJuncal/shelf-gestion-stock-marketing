/**
 * Route: Asset Models Index
 *
 * Displays the paginated list of asset models with search and bulk actions.
 *
 * @see {@link file://./settings.asset-models.tsx} Parent layout
 */
import type { AssetModel, Category } from "@prisma/client";
import { useTranslation } from "react-i18next";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { data } from "react-router";
import AssetModelQuickActions from "~/components/asset-model/asset-model-quick-actions";
import AssetModelBulkActionsDropdown from "~/components/asset-model/bulk-actions-dropdown";
import ImageWithPreview from "~/components/image-with-preview/image-with-preview";
import type { HeaderData } from "~/components/layout/header/types";
import LineBreakText from "~/components/layout/line-break-text";
import { List } from "~/components/list";
import { Badge } from "~/components/shared/badge";
import { Button } from "~/components/shared/button";
import { Th, Td } from "~/components/table";
import { useUserRoleHelper } from "~/hooks/user-user-role-helper";
import { createI18n } from "~/i18n/i18n";
import { resolveRequestLanguage } from "~/i18n/language.server";
import { getAssetModels } from "~/modules/asset-model/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import {
  setCookie,
  updateCookieWithPerPage,
  userPrefs,
} from "~/utils/cookies.server";
import { makeShelfError } from "~/utils/error";
import { payload, error, getCurrentSearchParams } from "~/utils/http.server";
import { getParamsValues } from "~/utils/list";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    const { organizationId } = await requirePermission({
      userId: authSession.userId,
      request,
      entity: PermissionEntity.assetModel,
      action: PermissionAction.read,
    });

    const searchParams = getCurrentSearchParams(request);
    const { page, perPageParam, search } = getParamsValues(searchParams);
    const cookie = await updateCookieWithPerPage(request, perPageParam);
    const { perPage } = cookie;

    const { assetModels, totalAssetModels } = await getAssetModels({
      organizationId,
      page,
      perPage,
      search,
    });
    const totalPages = Math.ceil(totalAssetModels / perPage);

    const i18n = createI18n(await resolveRequestLanguage({ request }));
    const header: HeaderData = {
      title: i18n.t("inventory:assetModels"),
      subHeading: i18n.t("inventory:assetModelsHelp"),
    };
    const modelName = {
      singular: "asset model",
      plural: "asset models",
    };

    return data(
      payload({
        header,
        items: assetModels,
        search,
        page,
        totalItems: totalAssetModels,
        totalPages,
        perPage,
        modelName,
      }),
      {
        headers: [setCookie(await userPrefs.serialize(cookie))],
      }
    );
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];

export default function AssetModelsIndexPage() {
  const { t } = useTranslation();
  const { isBaseOrSelfService } = useUserRoleHelper();

  return (
    <>
      <div className="mb-2.5 flex items-center justify-between bg-white md:rounded md:border md:border-gray-200 md:px-6 md:py-5">
        <div>
          <h2 className="text-lg text-gray-900">
            {t("inventory:assetModels")}
          </h2>
          <p className="text-sm text-gray-600">
            {t("inventory:assetModelsHelp")}
          </p>
        </div>
        <Button
          to="new"
          role="link"
          aria-label={t("inventory:newAssetModel")}
          data-test-id="createNewAssetModel"
        >
          {t("inventory:newAssetModel")}
        </Button>
      </div>
      <List
        bulkActions={
          isBaseOrSelfService ? undefined : <AssetModelBulkActionsDropdown />
        }
        ItemComponent={AssetModelItem}
        headerChildren={
          <>
            <Th>{t("inventory:description")}</Th>
            <Th>{t("inventory:defaultCategory")}</Th>
            <Th>{t("inventory:assets")}</Th>
            <Th>{t("inventory:actions")}</Th>
          </>
        }
      />
    </>
  );
}

/** Renders a single row in the asset models list table. */
const AssetModelItem = ({
  item,
}: {
  item: Pick<
    AssetModel,
    "id" | "description" | "name" | "image" | "thumbnailImage"
  > & {
    _count: {
      assets: number;
    };
    defaultCategory?: Pick<Category, "id" | "name" | "color"> | null;
  };
}) => (
  <>
    <Td title={`Asset model: ${item.name}`} className="w-1/4">
      {/*
        Image + name in one cell, matching the kit and asset list rows: the
        picture is the fastest way to confirm you're looking at the right
        model, and it's the same picture its assets now show.
      */}
      <div className="flex items-center gap-3">
        {item.image ? (
          // `imageUrl` is required alongside `withPreview` — see the note at the
          // matching call site in components/asset-model/form.tsx.
          <ImageWithPreview
            imageUrl={item.image}
            thumbnailUrl={item.thumbnailImage ?? item.image}
            alt={`${item.name} image`}
            className="size-10 shrink-0 rounded border object-cover"
            withPreview
          />
        ) : null}
        <span className="word-break">{item.name}</span>
      </div>
    </Td>
    <Td className="max-w-62 md:w-2/4">
      {item.description ? (
        <LineBreakText
          className="md:w-3/4"
          text={item.description}
          numberOfLines={3}
          charactersPerLine={60}
        />
      ) : null}
    </Td>
    <Td>
      {item.defaultCategory ? (
        <Badge color={item.defaultCategory.color} withDot={false}>
          {item.defaultCategory.name}
        </Badge>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </Td>
    <Td>{item._count.assets}</Td>
    <Td>
      <AssetModelQuickActions assetModel={item} />
    </Td>
  </>
);
