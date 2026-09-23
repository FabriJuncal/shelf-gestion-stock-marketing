import { useMemo, useState } from "react";
import type { Currency, Prisma } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { data, type LoaderFunctionArgs, type MetaFunction } from "react-router";
import { useLoaderData, useNavigation } from "react-router";
import { Form } from "~/components/custom-form";
import { ShelfSymbolLogo } from "~/components/marketing/logos";
import { Button } from "~/components/shared/button";
import { Card } from "~/components/shared/card";
import { GrayBadge } from "~/components/shared/gray-badge";
import { Tag } from "~/components/shared/tag";
import { config } from "~/config/shelf.config";
import { useSearchParams } from "~/hooks/search-params";
import { getAuditAddonPrices } from "~/modules/audit/addon.server";
import { getBarcodeAddonPrices } from "~/modules/barcode/addon.server";
import { getUserByID } from "~/modules/user/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { formatCurrency } from "~/utils/currency";
import { makeShelfError } from "~/utils/error";
import { isFormProcessing } from "~/utils/form";
import { payload, error } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";
import type { CustomerWithSubscriptions } from "~/utils/stripe.server";
import {
  getStripeCustomer,
  getStripePricesForTrialPlanSelection,
} from "~/utils/stripe.server";
import { tw } from "~/utils/tw";

export const meta: MetaFunction = () => [
  { title: appendToMetaTitle("Welcome to shelf.nu") },
];

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    await requirePermission({
      userId,
      request,
      entity: PermissionEntity.subscription,
      action: PermissionAction.read,
    });

    const user = await getUserByID(userId, {
      select: { id: true, customerId: true } satisfies Prisma.UserSelect,
    });

    /** Get the Stripe customer */
    const customer = user.customerId
      ? ((await getStripeCustomer(
          user.customerId
        )) as CustomerWithSubscriptions)
      : null;

    /* Get the prices and products from Stripe */
    const [prices, auditPrices, barcodePrices] = await Promise.all([
      getStripePricesForTrialPlanSelection(),
      getAuditAddonPrices(),
      getBarcodeAddonPrices(),
    ]);

    return data(
      payload({
        title: "Subscription",
        subTitle: "Pick an account plan that fits your workflow.",
        /** Filter out the montly and yearly prices to only have prices for team plan */
        prices,
        customer,
        auditPrices,
        barcodePrices,
      })
    );
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

// react-doctor:no-giant-component — deferred for follow-up refactor
export default function SelectPlan() {
  const { prices, auditPrices, barcodePrices } = useLoaderData<typeof loader>();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const locale = i18n.language === "es" ? "es-AR" : "en-US";
  type BillingInterval = "month" | "year";

  const planPrices = useMemo(() => {
    const intervals: Partial<Record<BillingInterval, (typeof prices)[number]>> =
      {};
    prices.forEach((price) => {
      const interval = price.recurring?.interval;
      if (interval === "month" || interval === "year") {
        intervals[interval] = price;
      }
    });
    return intervals;
  }, [prices]);

  const [selectedPlan, setSelectedPlan] = useState<BillingInterval | null>(
    () => (planPrices.month ? "month" : planPrices.year ? "year" : null)
  );

  // Initialize audit toggle from URL param (passed from welcome page)
  const [wantsAudits, setWantsAudits] = useState(
    () => searchParams.get("withAudits") === "true"
  );

  // Initialize barcode toggle from URL param (passed from welcome page)
  const [wantsBarcodes, setWantsBarcodes] = useState(
    () => searchParams.get("withBarcodes") === "true"
  );

  const navigation = useNavigation();
  const activePrice = selectedPlan ? planPrices[selectedPlan] : null;
  const disabled = isFormProcessing(navigation.state) || !activePrice;

  const hasAuditPrices = !!(auditPrices.month || auditPrices.year);
  const hasBarcodePrices = !!(barcodePrices.month || barcodePrices.year);

  // Get the matching audit price for the selected billing interval
  const activeAuditPrice =
    selectedPlan && auditPrices[selectedPlan]
      ? auditPrices[selectedPlan]
      : auditPrices.year || auditPrices.month;

  // Get the matching barcode price for the selected billing interval
  const activeBarcodePrice =
    selectedPlan && barcodePrices[selectedPlan]
      ? barcodePrices[selectedPlan]
      : barcodePrices.year || barcodePrices.month;

  const fmtPrice = (amountInCents: number, currency: string) =>
    formatCurrency({
      value: amountInCents / 100,
      currency: currency as Currency,
      locale,
    });

  // Generate dynamic plan copy from Stripe prices
  const getPlanCopy = (
    price: (typeof prices)[number]
  ): { label: string; price: string; footnote: string } => {
    const interval = price.recurring?.interval;
    const amount = price.unit_amount ?? 0;
    const formattedPrice = amount > 0 ? fmtPrice(amount, price.currency) : "$0";

    let footnote = "";
    if (interval === "year") {
      footnote = t("welcome:billedAnnuallyPerWorkspace");
    } else if (interval === "month") {
      footnote = t("welcome:billedMonthlyPerWorkspace");
    }

    return {
      label: interval === "year" ? t("welcome:annual") : t("welcome:monthly"),
      price: `${formattedPrice}${
        interval === "year"
          ? t("welcome:perYearShort")
          : t("welcome:perMonthShort")
      }`,
      footnote,
    };
  };

  // Build cost summary
  const teamPriceAmount = activePrice?.unit_amount || 0;
  const teamPriceCurrency = activePrice?.currency || "usd";
  const auditPriceAmount =
    wantsAudits && activeAuditPrice ? activeAuditPrice.unit_amount || 0 : 0;
  const barcodePriceAmount =
    wantsBarcodes && activeBarcodePrice
      ? activeBarcodePrice.unit_amount || 0
      : 0;
  const totalAmount = teamPriceAmount + auditPriceAmount + barcodePriceAmount;
  const isYearly = selectedPlan === "year";

  const billingLabel = isYearly
    ? t("welcome:perYearShort")
    : t("welcome:perMonthShort");

  const selectedAddons = [
    wantsAudits && t("welcome:audits"),
    wantsBarcodes && t("welcome:barcodes"),
  ].filter(Boolean);
  const trialText =
    selectedAddons.length > 0
      ? t("welcome:trialWithAddons", {
          days: config.freeTrialDays,
          addons: selectedAddons.join(" + "),
        })
      : t("welcome:trialTeamOnly", { days: config.freeTrialDays });

  return (
    <div className="flex flex-col items-center p-4 sm:p-6">
      <ShelfSymbolLogo className="my-4 size-8 md:mt-0" />
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-semibold text-gray-900">
          {t("welcome:selectPaymentPlan")}
        </h3>
        <p className="mt-3 text-base text-gray-600">
          {t("welcome:noPaymentRequired", { days: config.freeTrialDays })}
        </p>
      </div>

      <Form
        method="post"
        className="w-full max-w-3xl space-y-8"
        action="/account-details/subscription"
      >
        <fieldset
          className="flex items-center justify-between gap-2"
          aria-label={t("welcome:billingInterval")}
        >
          <legend className="sr-only">
            {t("welcome:chooseBillingInterval")}
          </legend>
          {(Object.keys(planPrices) as BillingInterval[]).map((interval) => {
            const price = planPrices[interval];
            if (!price) return null;
            const display = getPlanCopy(price);
            const id = `billing-${interval}`;
            const isSelected = selectedPlan === interval;
            return (
              <label
                key={interval}
                htmlFor={id}
                className="flex-1 cursor-pointer"
              >
                <input
                  id={id}
                  type="radio"
                  name="billingInterval"
                  value={interval}
                  checked={isSelected}
                  onChange={() => setSelectedPlan(interval)}
                  className="sr-only"
                />
                <div
                  className={tw(
                    "relative flex flex-col gap-2 rounded border px-6 py-5 transition",
                    isSelected
                      ? "border-primary-400 bg-primary-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  {interval === "year" ? (
                    <Tag
                      className={tw(
                        "w-max",
                        " absolute right-2 top-2 bg-orange-100 text-orange-700"
                      )}
                    >
                      {t("welcome:savePercent", { percent: 54 })}
                    </Tag>
                  ) : null}
                  <span className="text-sm font-semibold text-primary-700">
                    {display.label}
                  </span>
                  <span className="text-2xl font-semibold text-gray-900">
                    {display.price}
                  </span>
                  <span className="text-sm text-gray-600">
                    {display.footnote}
                  </span>
                </div>
              </label>
            );
          })}
        </fieldset>

        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t("welcome:optionalAddons")}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {t("welcome:optionalAddonsHelp")}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Interactive Audit add-on card */}
            {hasAuditPrices ? (
              <article className="h-full">
                <Card
                  className={tw(
                    "flex h-full cursor-pointer flex-col gap-3 p-0",
                    "transition-shadow",
                    wantsAudits ? "" : "hover:border-gray-300"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setWantsAudits((prev) => !prev)}
                    className={tw(
                      "flex size-full flex-col gap-3 rounded border border-transparent p-4 text-left",
                      wantsAudits
                        ? "border-primary-400 bg-primary-50"
                        : "border-transparent"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={tw(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2",
                          wantsAudits
                            ? "border-primary-500 bg-primary-500"
                            : "border-gray-300 bg-white"
                        )}
                        aria-hidden="true"
                      >
                        {wantsAudits ? (
                          <svg
                            className="size-3 text-white"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-gray-900">
                            {t("welcome:audits")}
                          </h4>
                          <Tag className="whitespace-nowrap bg-primary-50 text-primary-700">
                            {t("welcome:dayTrial", {
                              days: config.freeTrialDays,
                            })}
                          </Tag>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t("welcome:auditsDescription")}
                    </p>
                    {activeAuditPrice ? (
                      <div className="mt-1">
                        <span className="text-lg font-semibold text-gray-900">
                          {fmtPrice(
                            activeAuditPrice.unit_amount || 0,
                            activeAuditPrice.currency
                          )}
                          {billingLabel}
                        </span>
                        <p className="text-xs text-gray-500">
                          {isYearly
                            ? t("welcome:billedAnnuallyPerWorkspace")
                            : t("welcome:billedMonthlyPerWorkspace")}
                        </p>
                      </div>
                    ) : null}
                  </button>
                </Card>
              </article>
            ) : null}

            {/* Interactive Barcode add-on card */}
            {hasBarcodePrices ? (
              <article className="h-full">
                <Card
                  className={tw(
                    "flex h-full cursor-pointer flex-col gap-3 p-0",
                    "transition-shadow",
                    wantsBarcodes ? "" : "hover:border-gray-300"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setWantsBarcodes((prev) => !prev)}
                    className={tw(
                      "flex size-full flex-col gap-3 rounded border border-transparent p-4 text-left",
                      wantsBarcodes
                        ? "border-primary-400 bg-primary-50"
                        : "border-transparent"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={tw(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2",
                          wantsBarcodes
                            ? "border-primary-500 bg-primary-500"
                            : "border-gray-300 bg-white"
                        )}
                        aria-hidden="true"
                      >
                        {wantsBarcodes ? (
                          <svg
                            className="size-3 text-white"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-gray-900">
                            {t("welcome:barcodes")}
                          </h4>
                          <Tag className="whitespace-nowrap bg-primary-50 text-primary-700">
                            {t("welcome:dayTrial", {
                              days: config.freeTrialDays,
                            })}
                          </Tag>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {t("welcome:barcodesDescription")}
                    </p>
                    {activeBarcodePrice ? (
                      <div className="mt-1">
                        <span className="text-lg font-semibold text-gray-900">
                          {fmtPrice(
                            activeBarcodePrice.unit_amount || 0,
                            activeBarcodePrice.currency
                          )}
                          {billingLabel}
                        </span>
                        <p className="text-xs text-gray-500">
                          {isYearly
                            ? t("welcome:billedAnnuallyPerWorkspace")
                            : t("welcome:billedMonthlyPerWorkspace")}
                        </p>
                      </div>
                    ) : null}
                  </button>
                </Card>
              </article>
            ) : null}
          </div>
        </section>

        {/* SSO — separate category, full width */}
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t("welcome:enterpriseIntegrations")}
            </h3>
          </div>
          <Card className="flex flex-col gap-3">
            <div>
              <h4 className="text-base font-semibold text-gray-900">
                {t("welcome:ssoIntegration")}
              </h4>
              <div className="mt-1">
                <GrayBadge className="whitespace-nowrap">
                  {t("welcome:paidAddon")}
                </GrayBadge>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {t("welcome:ssoDescription")}
            </p>
            <p className="text-xs text-gray-500">
              {t("welcome:ssoAvailability")}
            </p>
          </Card>
        </section>

        {/* Cost summary */}
        {activePrice && (
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              {t("welcome:costSummary")}{" "}
              <span className="font-normal text-gray-600">
                ({t("welcome:afterTrial")})
              </span>
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {t("welcome:team")} (
                  {isYearly
                    ? t("welcome:yearlyLower")
                    : t("welcome:monthlyLower")}
                  )
                </span>
                <span className="font-medium text-gray-900">
                  {fmtPrice(teamPriceAmount, teamPriceCurrency)}
                  {billingLabel}
                </span>
              </div>
              {wantsAudits && activeAuditPrice ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("welcome:audits")} (
                    {isYearly
                      ? t("welcome:yearlyLower")
                      : t("welcome:monthlyLower")}
                    )
                  </span>
                  <span className="font-medium text-gray-900">
                    {fmtPrice(auditPriceAmount, activeAuditPrice.currency)}
                    {billingLabel}
                  </span>
                </div>
              ) : null}
              {wantsBarcodes && activeBarcodePrice ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t("welcome:barcodes")} (
                    {isYearly
                      ? t("welcome:yearlyLower")
                      : t("welcome:monthlyLower")}
                    )
                  </span>
                  <span className="font-medium text-gray-900">
                    {fmtPrice(barcodePriceAmount, activeBarcodePrice.currency)}
                    {billingLabel}
                  </span>
                </div>
              ) : null}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    {t("welcome:total")}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {fmtPrice(totalAmount, teamPriceCurrency)}
                    {billingLabel}
                  </span>
                </div>
                {isYearly && (
                  <p className="mt-1 text-right text-xs text-gray-500">
                    {fmtPrice(Math.round(totalAmount / 12), teamPriceCurrency)}
                    {t("welcome:effectiveMonthlyRate")}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <p className="text-center text-sm text-gray-600">{trialText}</p>

        <input type="hidden" name="priceId" value={activePrice?.id ?? ""} />
        <input
          type="hidden"
          name="shelfTier"
          value={activePrice?.product.metadata.shelf_tier}
        />
        {wantsAudits && activeAuditPrice ? (
          <input
            type="hidden"
            name="auditPriceId"
            value={activeAuditPrice.id}
          />
        ) : null}
        {wantsBarcodes && activeBarcodePrice ? (
          <input
            type="hidden"
            name="barcodePriceId"
            value={activeBarcodePrice.id}
          />
        ) : null}

        <Button
          width="full"
          type="submit"
          name="intent"
          value="trial"
          disabled={disabled}
          data-analytics="cta-start-trial"
        >
          {t("welcome:startFreeTrial", { days: config.freeTrialDays })}
        </Button>
      </Form>

      <Button variant="link" to="/welcome" className="mt-4">
        {t("welcome:back")}
      </Button>
    </div>
  );
}
