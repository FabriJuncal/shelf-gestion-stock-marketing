import type { CSSProperties } from "react";
import type { AssetModel } from "@prisma/client";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/shared/button";
import When from "~/components/when/when";
import { useUserRoleHelper } from "~/hooks/user-user-role-helper";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { userHasPermission } from "~/utils/permissions/permission.validator.client";
import { tw } from "~/utils/tw";
import { DeleteAssetModel } from "./delete-asset-model";

type AssetModelQuickActionsProps = {
  className?: string;
  style?: CSSProperties;
  assetModel: Pick<AssetModel, "id" | "name">;
};

export default function AssetModelQuickActions({
  className,
  style,
  assetModel,
}: AssetModelQuickActionsProps) {
  const { t } = useTranslation();
  const { roles } = useUserRoleHelper();

  return (
    <div className={tw("flex items-center gap-2", className)} style={style}>
      <When
        truthy={userHasPermission({
          roles,
          entity: PermissionEntity.assetModel,
          action: PermissionAction.update,
        })}
      >
        <Button
          size="sm"
          variant="secondary"
          className={"p-2"}
          to={`${assetModel.id}/edit`}
          aria-label={t("inventory:editAssetModel")}
          tooltip={t("inventory:editAssetModel")}
        >
          <PencilIcon className="size-4" />
        </Button>
      </When>

      <When
        truthy={userHasPermission({
          roles,
          entity: PermissionEntity.assetModel,
          action: PermissionAction.delete,
        })}
      >
        <DeleteAssetModel
          assetModel={assetModel}
          trigger={
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className={"p-2"}
              aria-label={t("inventory:deleteAssetModel")}
              tooltip={t("inventory:deleteAssetModel")}
            >
              <Trash2Icon className="size-4" />
            </Button>
          }
        />
      </When>
    </div>
  );
}
