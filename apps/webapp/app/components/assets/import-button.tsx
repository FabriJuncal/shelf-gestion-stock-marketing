import { useTranslation } from "react-i18next";
import { UpgradeMessage } from "../marketing/upgrade-message";
import { Button } from "../shared/button";

export const ImportButton = ({
  canImportAssets,
}: {
  canImportAssets: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Button
      to={`import`}
      variant="secondary"
      role="link"
      disabled={
        !canImportAssets
          ? {
              reason: (
                <>
                  {t("inventory:importUnavailable")} <UpgradeMessage />
                </>
              ),
            }
          : false
      }
      title={t("inventory:importAssets")}
    >
      {t("inventory:import")}
    </Button>
  );
};
