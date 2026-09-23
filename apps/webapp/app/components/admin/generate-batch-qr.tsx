import type { ChangeEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "react-router";
import { isFormProcessing } from "~/utils/form";
import Input from "../forms/input";
import { Button } from "../shared/button";

export const GenerateBatchQr = () => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(1000);
  const [batchName, setBatchName] = useState<string>("");
  const navigation = useNavigation();
  const disabled = isFormProcessing(navigation.state);
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    if (value < 1) {
      setAmount(1);
    } else if (value > 1000) {
      setAmount(1000);
    } else {
      setAmount(value);
    }
  }
  return (
    <div className="flex w-[400px] flex-col gap-2 bg-gray-200 p-4">
      <h3>{t("audit:generateBatch")}</h3>
      <Input
        type="name"
        value={batchName}
        onChange={(e) => setBatchName(e.target.value)}
        placeholder="Dank batch"
        disabled={disabled}
        label={t("audit:batchName")}
      />
      <Input
        type="number"
        min={10}
        max={1000}
        value={amount}
        onChange={handleChange}
        placeholder={t("audit:amount")}
        disabled={disabled}
        label={t("audit:amount")}
      />
      <div>
        <Button
          to={`/admin-dashboard/qrs/codes.zip?${new URLSearchParams({
            amount: String(amount),
            batchName,
          })}-${new Date().getTime()}`}
          reloadDocument
          download
          variant="secondary"
          name="intent"
          value="createOrphans"
          disabled={disabled}
        >
          {t("audit:generateDownloadBatch")}
        </Button>
        <p className="mt-2 text-sm text-gray-500">
          Generates and downloads a batch of unclaimed qr codes. Min 1, Max 1000
        </p>
      </div>
    </div>
  );
};
