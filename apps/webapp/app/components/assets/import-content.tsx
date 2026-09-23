/**
 * @file Import content components for CSV asset import.
 * Provides the main ImportContent layout and FileForm for file upload
 * with client-side validation, preview, and confirmation flow.
 *
 * @see {@link file://./../../routes/_layout+/assets.import.tsx} Route handler
 */
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAutoFocus } from "~/hooks/use-auto-focus";
import { useDisabled } from "~/hooks/use-disabled";
import useFetcherWithReset from "~/hooks/use-fetcher-with-reset";
import type { DuplicateBarcode } from "~/modules/barcode/service.server";
import type { QRCodePerImportedAsset } from "~/modules/qr/service.server";
import type { action } from "~/routes/_layout+/assets.import";
import { useBarcodePermissions } from "~/utils/permissions/use-barcode-permissions";
import Input from "../forms/input";
import Icon from "../icons/icon";
import { Button } from "../shared/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../shared/modal";
import { WarningBox } from "../shared/warning-box";
import { Table, Td, Th, Tr } from "../table";
import When from "../when/when";

/**
 * Main content component for the CSV asset import page.
 * Displays instructions, rules, and embeds the FileForm for upload.
 */
export const ImportContent = () => {
  const { t } = useTranslation();
  const { canUseBarcodes } = useBarcodePermissions();

  return (
    <div className="w-full text-left">
      <h3>{t("inventory:importAssets")}</h3>

      {/* Intent fork */}
      <div className="my-4 flex gap-3 rounded-md border border-gray-200 bg-gray-50 p-4">
        <Icon
          icon="switch"
          size="xs"
          className="mt-0.5 shrink-0 text-gray-500"
        />
        <p className="text-[14px] text-gray-600">
          <b>{t("inventory:updateAssetsInstead")}</b>{" "}
          {t("inventory:updateAssetsInsteadHelp")}{" "}
          <Button variant="link" to="/assets/import-update">
            {t("inventory:goToBulkUpdate")}
          </Button>
        </p>
      </div>

      <h4>{t("inventory:createAssetsFromCsv")}</h4>
      <p>
        {t("inventory:createAssetsFromCsvHelp")}{" "}
        <Button
          variant="link"
          to={
            canUseBarcodes
              ? "/static/shelf.nu-example-asset-import-from-content-with-barcodes.csv"
              : "/static/shelf.nu-example-asset-import-from-content.csv"
          }
          target="_blank"
          download
        >
          {t("inventory:csvTemplate")}
        </Button>{" "}
        {t("inventory:csvTemplateOutcome")}
      </p>

      <WarningBox className="my-4">
        <>
          <strong>{t("inventory:important")}</strong>:{" "}
          {t("inventory:importBackupWarning")}
        </>
      </WarningBox>

      <div className="my-5 flex flex-col gap-4">
        {/* Base rules */}
        <div className="flex gap-3">
          <Icon
            icon="write"
            size="xs"
            className="mt-0.5 shrink-0 text-gray-500"
          />
          <div>
            <h5 className="font-semibold">{t("inventory:baseRules")}</h5>
            <ul className="list-inside list-disc text-[14px] text-gray-600">
              <li>{t("inventory:csvDelimiterRule")}</li>
              <li>{t("inventory:csvRelatedColumnsRule")}</li>
              <li>{t("inventory:csvTagsRule")}</li>
              <li>{t("inventory:csvNewAssetRule")}</li>
              <li>{t("inventory:csvQuantityTrackedRule")}</li>
            </ul>
          </div>
        </div>

        {/* Custom fields */}
        <div className="flex gap-3">
          <Icon
            icon="settings"
            size="xs"
            className="mt-0.5 shrink-0 text-gray-500"
          />
          <div>
            <h5 className="font-semibold">{t("inventory:customFields")}</h5>
            <p className="text-[14px] text-gray-600">
              {t("inventory:csvCustomFieldsHelp")}
            </p>
            <ul className="list-inside list-disc pl-2 text-[14px] text-gray-600">
              <li>
                <b>text</b> (default), <b>boolean</b>, <b>option</b>,{" "}
                <b>multiline text</b>
              </li>
              <li>
                <b>date</b> — must be YYYY-MM-DD
              </li>
              <li>
                <b>amount</b> — currency values, no symbols (e.g., 1234.56)
              </li>
              <li>
                <b>number</b> — numeric values including negatives
              </li>
            </ul>
            <p className="mt-1 text-[14px] text-gray-600">
              {t("inventory:csvCustomFieldsExample")}
            </p>
          </div>
        </div>

        {/* QR codes */}
        <div className="flex gap-3">
          <Icon
            icon="scanQR"
            size="xs"
            className="mt-0.5 shrink-0 text-gray-500"
          />
          <div>
            <h5 className="font-semibold">{t("inventory:qrCodes")}</h5>
            <p className="text-[14px] text-gray-600">
              {t("inventory:csvQrCodesHelp")}
            </p>
            <ul className="list-inside list-disc pl-2 text-[14px] text-gray-600">
              <li>{t("inventory:csvQrExistingCodeRule")}</li>
              <li>{t("inventory:csvQrNoDuplicatesRule")}</li>
              <li>{t("inventory:csvQrNoLinkedCodesRule")}</li>
              <li>{t("inventory:csvQrOwnershipRule")}</li>
            </ul>
            <p className="mt-1 text-[14px] text-gray-600">
              {t("inventory:csvQrFallbackHelp")}
            </p>
          </div>
        </div>

        {/* Barcodes */}
        <When truthy={canUseBarcodes}>
          <div className="flex gap-3">
            <Icon
              icon="barcode"
              size="xs"
              className="mt-0.5 shrink-0 text-gray-500"
            />
            <div>
              <h5 className="font-semibold">{t("inventory:barcodes")}</h5>
              <p className="text-[14px] text-gray-600">
                {t("inventory:csvBarcodesHelp")}
              </p>
              <ul className="list-inside list-disc pl-2 text-[14px] text-gray-600">
                <li>
                  <b>barcode_Code128</b> — 4-40 characters, supports letters,
                  numbers, and symbols
                </li>
                <li>
                  <b>barcode_Code39</b> — 4-43 characters
                </li>
                <li>
                  <b>barcode_DataMatrix</b> — 4-100 characters
                </li>
                <li>
                  <b>barcode_ExternalQR</b> — 1-2048 characters (URLs, text, or
                  any external QR content)
                </li>
                <li>
                  <b>barcode_EAN13</b> — 13-digit product identification codes
                </li>
              </ul>
              <p className="mt-1 text-[14px] text-gray-600">
                {t("inventory:csvBarcodesRules")}
              </p>
            </div>
          </div>
        </When>

        {/* Quantity-tracked assets + asset model columns */}
        <div className="flex gap-3">
          <Icon
            icon="asset"
            size="xs"
            className="mt-0.5 shrink-0 text-gray-500"
          />
          <div>
            <h5 className="font-semibold">
              {t("inventory:quantityTrackedAssets")}
            </h5>
            <p className="text-[14px] text-gray-600">
              {t("inventory:csvQuantityTrackedHelp")}
            </p>
            <ul className="list-inside list-disc pl-2 text-[14px] text-gray-600">
              <li>
                <b>type</b> — <code>INDIVIDUAL</code> (the default if the column
                is missing or the cell is blank) or{" "}
                <code>QUANTITY_TRACKED</code>. On <b>update</b> imports, the
                cell is silently ignored — type cannot be changed once an asset
                exists.
              </li>
              <li>
                <b>quantity</b> — required, must be a positive integer when{" "}
                <code>type = QUANTITY_TRACKED</code>. Ignored on{" "}
                <code>INDIVIDUAL</code> rows.
              </li>
              <li>
                <b>minQuantity</b> — optional non-negative integer; sets the
                low-stock alert threshold. Ignored on <code>INDIVIDUAL</code>{" "}
                rows.
              </li>
              <li>
                <b>unitOfMeasure</b> — optional free-text label (e.g.{" "}
                <code>boxes</code>, <code>liters</code>, <code>kg</code>).
                Markdoc injection characters (<code>{"{"}</code>, <code>%</code>
                , <code>{"}"}</code>) are stripped.
              </li>
              <li>
                <b>consumptionType</b> — required when{" "}
                <code>type = QUANTITY_TRACKED</code>. <code>ONE_WAY</code>{" "}
                (consumed on checkout, no return) or <code>TWO_WAY</code>{" "}
                (returned with a consumption report). Ignored on{" "}
                <code>INDIVIDUAL</code> rows.
              </li>
              <li>
                <b>assetModel</b> — optional asset model name; created
                automatically (case-insensitive lookup) if it doesn't exist yet.{" "}
                <b>INDIVIDUAL rows only</b> — on a <code>QUANTITY_TRACKED</code>{" "}
                row during update, the cell is skipped with a warning and the
                rest of the row still applies.
              </li>
            </ul>
            <p className="mt-1 text-[14px] text-gray-600">
              {t("inventory:csvQuantityTrackedTip")}
            </p>
          </div>
        </div>

        {/* Extra considerations */}
        <div className="flex gap-3">
          <Icon
            icon="question"
            size="xs"
            className="mt-0.5 shrink-0 text-gray-500"
          />
          <div>
            <h5 className="font-semibold">{t("inventory:goodToKnow")}</h5>
            <ul className="list-inside list-disc text-[14px] text-gray-600">
              <li>{t("inventory:csvHeaderRowRule")}</li>
              <li>{t("inventory:csvInvalidDataRule")}</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="text-[14px] text-gray-500">
        Need help preparing your file? Try our{" "}
        <Button
          variant="link"
          to="https://www.shelf.nu/csv-helper"
          target="_blank"
        >
          CSV Helper Tool
        </Button>
        .
      </p>

      <FileForm intent={"content"} />
    </div>
  );
};

/**
 * File upload form with confirmation dialog for CSV asset import.
 * Handles file selection, "I AGREE" confirmation, and displays
 * import errors or success state.
 *
 * @param intent - The form intent value sent to the action
 * @param url - Optional custom action URL for the form
 */
export const FileForm = ({ intent, url }: { intent: string; url?: string }) => {
  const { t } = useTranslation();
  // Widened to `string` so toUpperCase() doesn't need a cast.
  // The "I AGREE" check happens at submit time.
  const [agreed, setAgreed] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fetcher = useFetcherWithReset<typeof action>();

  const { data } = fetcher;
  const isSubmitting = useDisabled(fetcher);
  const disabled = isSubmitting || agreed !== "I AGREE";
  const isSuccessful = data && !data.error;
  //

  // Focus the "I AGREE" confirmation input when the dialog opens (replaces
  // `autoFocus`). Re-focuses each time the dialog re-opens; skipped while
  // the success state is showing.
  const agreeInputRef = useAutoFocus<HTMLInputElement>({
    when: isDialogOpen && !isSuccessful,
  });

  /** We use a controlled field for the file, because of the confirmation dialog we have.
   * That way we can disabled the confirmation dialog button until a file is selected
   */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event?.target?.files?.[0];
    if (selectedFile) {
      setSelectedFile(selectedFile);
    }
  };

  return (
    <fetcher.Form
      className="mt-4 w-full"
      method="post"
      ref={formRef}
      encType="multipart/form-data"
      action={url ? url : undefined}
    >
      <Input
        type="file"
        name="file"
        label={t("inventory:selectCsvFile")}
        required
        onChange={handleFileSelect}
        accept=".csv"
      />
      <input type="hidden" name="intent" value={intent} />

      <AlertDialog
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            // Reset form state when dialog is closed
            setAgreed("");
            fetcher.reset();
          }
        }}
      >
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            title={t("inventory:confirmAssetImport")}
            disabled={!selectedFile}
            className="my-4"
          >
            {t("inventory:confirmAssetImport")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-[600px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("inventory:confirmAssetImport")}
            </AlertDialogTitle>
            {!isSuccessful ? (
              <>
                <AlertDialogDescription>
                  {t("inventory:importConfirmationHelp", {
                    confirmation: "I AGREE",
                  })}
                </AlertDialogDescription>
                <Input
                  type="text"
                  label={t("inventory:confirmation")}
                  ref={agreeInputRef}
                  name="agree"
                  value={agreed}
                  onChange={(e) => setAgreed(e.target.value.toUpperCase())}
                  placeholder="I AGREE"
                  pattern="^I AGREE$" // We use a regex to make sure the user types the exact string
                  required
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      // Because we use a Dialog the submit buttons is outside of the form so we submit using the fetcher directly
                      if (!disabled) {
                        void fetcher.submit(formRef.current);
                      }
                    }
                  }}
                />
              </>
            ) : null}
          </AlertDialogHeader>

          <When truthy={!!data?.error}>
            <div className="overflow-y-scroll">
              <h5 className="text-red-500">{data?.error?.title}</h5>
              <p className="text-red-500">{data?.error?.message}</p>
              {data?.error?.additionalData?.duplicateCodes ? (
                <BrokenQrCodesTable
                  title={t("inventory:duplicateCodes")}
                  data={
                    data.error.additionalData
                      .duplicateCodes as QRCodePerImportedAsset[]
                  }
                />
              ) : null}
              {data?.error?.additionalData?.nonExistentCodes ? (
                <BrokenQrCodesTable
                  title={t("inventory:nonExistentCodes")}
                  data={
                    data.error.additionalData
                      .nonExistentCodes as QRCodePerImportedAsset[]
                  }
                />
              ) : null}
              {data?.error?.additionalData?.linkedCodes ? (
                <BrokenQrCodesTable
                  title={t("inventory:alreadyLinkedCodes")}
                  data={
                    data.error.additionalData
                      .linkedCodes as QRCodePerImportedAsset[]
                  }
                />
              ) : null}
              {data?.error?.additionalData?.connectedToOtherOrgs ? (
                <BrokenQrCodesTable
                  title={t("inventory:codesOtherOrganization")}
                  data={
                    data.error.additionalData
                      .connectedToOtherOrgs as QRCodePerImportedAsset[]
                  }
                />
              ) : null}

              {data?.error?.additionalData?.duplicateBarcodes ? (
                <DuplicateBarcodesTable
                  data={
                    data.error.additionalData
                      .duplicateBarcodes as DuplicateBarcode[]
                  }
                />
              ) : null}

              {data?.error?.additionalData?.kitCustodyConflicts ? (
                <table className="mt-4 w-full rounded-md border text-left text-sm">
                  <thead className="bg-error-100 text-xs">
                    <tr>
                      <th scope="col" className="px-2 py-1">
                        {t("inventory:asset")}
                      </th>
                      <th scope="col" className="px-2 py-1">
                        {t("inventory:custodian")}
                      </th>
                      <th scope="col" className="px-2 py-1">
                        {t("inventory:kit")}
                      </th>
                      <th scope="col" className="px-2 py-1">
                        {t("inventory:error")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      data.error.additionalData.kitCustodyConflicts as Array<{
                        asset: string;
                        custodian: string;
                        kit: string;
                        issue: string;
                      }>
                    ).map((conflict) => (
                      <tr
                        // Compose a stable key from the conflict fields —
                        // the backend can surface the same asset twice
                        // for different issues, so include `issue` too.
                        key={`${conflict.asset}-${conflict.kit}-${conflict.custodian}-${conflict.issue}`}
                        className="border-b"
                      >
                        <td className="px-2 py-1">{conflict.asset}</td>
                        <td className="px-2 py-1">{conflict.custodian}</td>
                        <td className="px-2 py-1">{conflict.kit}</td>
                        <td className="px-2 py-1">{conflict.issue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}

              {Array.isArray(data?.error?.additionalData?.defectedHeaders) ? (
                <table className="mt-4 w-full rounded-md border text-left text-sm">
                  <thead className="bg-error-100 text-xs">
                    <tr>
                      <th scope="col" className="px-2 py-1">
                        {t("inventory:incorrectHeader")}
                      </th>
                      <th scope="col" className="px-2 py-1">
                        {t("inventory:error")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.error?.additionalData?.defectedHeaders?.map(
                      (data: {
                        incorrectHeader: string;
                        errorMessage: string;
                      }) => (
                        <tr key={data.incorrectHeader}>
                          <td className="px-2 py-1">{data.incorrectHeader}</td>
                          <td className="px-2 py-1">{data.errorMessage}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : null}

              <p className="mt-2">{t("inventory:fixCsvHelp")}</p>
            </div>
          </When>

          <When truthy={isSuccessful}>
            <div>
              <b className="text-green-500">{t("inventory:importSuccess")}</b>
              <p>{t("inventory:assetsImported")}</p>
            </div>
          </When>

          <AlertDialogFooter>
            {isSuccessful ? (
              <div className="flex gap-2">
                <AlertDialogCancel asChild>
                  <Button type="button" variant="secondary" width="full">
                    {t("common:close")}
                  </Button>
                </AlertDialogCancel>
                <Button to="/assets" width="full" className="whitespace-nowrap">
                  {t("inventory:viewNewAssets")}
                </Button>
              </div>
            ) : (
              <>
                <AlertDialogCancel asChild>
                  <Button type="button" variant="secondary">
                    {t("common:cancel")}
                  </Button>
                </AlertDialogCancel>
                <Button
                  type="submit"
                  onClick={() => {
                    // Because we use a Dialog the submit buttons is outside of the form so we submit using the fetcher directly
                    void fetcher.submit(formRef.current);
                  }}
                  disabled={disabled}
                >
                  {isSubmitting
                    ? t("inventory:importing")
                    : t("inventory:import")}
                </Button>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </fetcher.Form>
  );
};

function BrokenQrCodesTable({
  title,
  data,
}: {
  title: string;
  data: QRCodePerImportedAsset[];
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-3">
      <h5>{title}</h5>
      <Table className="mt-1 [&_td]:p-1 [&_th]:p-1">
        <thead>
          <Tr>
            <Th>{t("inventory:assetTitle")}</Th>
            <Th>{t("inventory:qrId")}</Th>
          </Tr>
        </thead>
        <tbody>
          {data.map((code: { title: string; qrId: string }) => (
            <Tr key={code.title}>
              <Td>{code.title}</Td>
              <Td>{code.qrId}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function DuplicateBarcodesTable({ data }: { data: DuplicateBarcode[] }) {
  const { t } = useTranslation();
  return (
    <div className="mt-3">
      <h5>{t("inventory:duplicateBarcodes")}</h5>
      <Table className="mt-1 [&_td]:p-1 [&_th]:p-1">
        <thead>
          <Tr>
            <Th>{t("inventory:barcode")}</Th>
            <Th>{t("inventory:usedByAssets")}</Th>
          </Tr>
        </thead>
        <tbody>
          {data.map((barcode) => (
            <Tr key={barcode.value}>
              <Td className="align-top">{barcode.value}</Td>
              <Td className="whitespace-normal">
                <ul className="list-disc pl-4">
                  {barcode.assets.map((asset) => (
                    // CSV `row` number is unique per imported asset
                    // within a single error payload, so it's a stable
                    // key (include title+type to be extra safe if the
                    // same row ever surfaces under multiple barcodes).
                    <li key={`${asset.row}-${asset.type}-${asset.title}`}>
                      {asset.title} ({asset.type}): Line {asset.row}
                    </li>
                  ))}
                </ul>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
