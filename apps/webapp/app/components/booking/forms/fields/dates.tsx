import type { Dispatch, SetStateAction } from "react";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";
import FormRow from "~/components/forms/form-row";
import { DateTimePicker } from "~/components/shared/date-time-picker";
import { InfoBox } from "~/components/shared/info-box";
import { Separator } from "~/components/shared/separator";
import { Spinner } from "~/components/shared/spinner";
import { TimeDisplay } from "~/components/shared/time-display";
import { WorkingHoursPreviewDialog } from "~/components/working-hours/working-hours-preview-dialog";
import { useBookingSettings } from "~/hooks/use-booking-settings";
import type {
  useWorkingHours,
  UseWorkingHoursResult,
} from "~/hooks/use-working-hours";
import { DATE_TIME_FORMAT } from "~/utils/constants";
import { tw } from "~/utils/tw";

export function DatesFields({
  startDate,
  startDateName,
  disabled,
  startDateError,
  setStartDate,
  endDate,
  endDateName,
  endDateError,
  setEndDate,
  isNewBooking,
  workingHoursData,
}: {
  startDate: string | undefined;
  startDateName: string;
  disabled: boolean;
  startDateError?: string;
  setStartDate: Dispatch<SetStateAction<string>>;
  endDate: string | undefined;
  endDateName: string;
  endDateError?: string;
  setEndDate: Dispatch<SetStateAction<string>>;
  isNewBooking?: boolean;
  workingHoursData: NonNullable<ReturnType<typeof useWorkingHours>>;
}) {
  const { t } = useTranslation();
  const { isLoading = true, error } = workingHoursData;
  const workingHoursDisabled = disabled || isLoading;
  const { maxBookingLength, bufferStartTime } = useBookingSettings();

  return (
    <>
      <FormRow
        rowLabel={t("booking:startDate")}
        className="mobile-styling-only border-b-0 pb-[10px] pt-0"
        required
      >
        <DateTimePicker
          key="start-date-input"
          mode="datetime"
          label={t("booking:startDate")}
          hideLabel
          name={startDateName}
          disabled={workingHoursDisabled}
          error={startDateError}
          className="w-full"
          // Controlled (mirrors the End Date input below) so the field stays in
          // sync with `startDate` state. When the parent re-renders with a new
          // value on a client-side navigation between bookings (e.g. the
          // duplicate → redirect flow), an uncontrolled `defaultValue` would
          // keep showing the previously-rendered booking's start date until a
          // full page refresh. A controlled `value` reflects the update.
          value={startDate}
          placeholder={t("booking:startDate")}
          required
          onChange={(wire) => {
            // `wire` is the emitted wire string in DATE_TIME_FORMAT
            // (YYYY-MM-DDTHH:mm) — the same format the native
            // datetime-local input previously produced.
            // Update start date state to persist user's selection
            setStartDate(wire);

            /**
             * When user changes the startDate and the new startDate is greater than the endDate
             * in that case, we have to update endDate to be the endDay date of startDate.
             */
            const inputValue = wire;
            if (isNewBooking && endDate && inputValue) {
              try {
                // Both values are NAIVE wall-clock strings in the user's
                // preference zone — that is what the field displays and what the
                // server parses. So this comparison and the 6 PM adjustment stay
                // entirely in wall-clock space: parse both in a single fixed
                // zone, do the arithmetic, format straight back. Never convert to
                // an absolute instant, or the device zone leaks in. UTC is used
                // purely as a neutral reference so no DST transition can shift a
                // wall clock that is not meant to move.
                const newStartDate = DateTime.fromISO(inputValue, {
                  zone: "utc",
                });
                const currentEndDate = DateTime.fromISO(endDate, {
                  zone: "utc",
                });

                // Check if dates are valid before comparing
                if (
                  newStartDate.isValid &&
                  currentEndDate.isValid &&
                  newStartDate > currentEndDate
                ) {
                  // Create new end date at 6 PM on the same day as start date
                  const endDateTime = newStartDate.set({
                    hour: 18,
                    minute: 0,
                    second: 0,
                    millisecond: 0,
                  });

                  setEndDate(endDateTime.toFormat(DATE_TIME_FORMAT));
                }
              } catch (error) {
                // If date parsing fails, just update the start date without affecting end date
                // eslint-disable-next-line no-console
                console.warn(
                  "Date parsing failed in start date onChange:",
                  error
                );
              }
            }
          }}
        />
      </FormRow>
      <FormRow
        rowLabel={t("booking:endDate")}
        className="mobile-styling-only mb-2.5 border-b-0 p-0"
        required
      >
        <DateTimePicker
          key={"end-date-input"}
          mode="datetime"
          label={t("booking:endDate")}
          hideLabel
          name={endDateName}
          disabled={workingHoursDisabled}
          error={endDateError}
          className="w-full"
          placeholder={t("booking:endDate")}
          required
          value={endDate}
          onChange={(wire) => {
            // `wire` is DATE_TIME_FORMAT (YYYY-MM-DDTHH:mm), matching the
            // previous native datetime-local value.
            setEndDate(wire);
          }}
        />

        <p className="text-[14px] text-gray-600">
          {t("booking:bookingDateHint")}
        </p>
        {(maxBookingLength || bufferStartTime > 0) && (
          <Separator className="my-2" />
        )}
        {maxBookingLength && (
          <p className="text-[14px] text-gray-600">
            {t("booking:maximumBookingLength", { hours: maxBookingLength })}
          </p>
        )}
        {bufferStartTime > 0 && (
          <p className="text-[14px] text-gray-600">
            {t("booking:minimumAdvanceNotice", { hours: bufferStartTime })}
          </p>
        )}
      </FormRow>
      <WorkingHoursInfo
        workingHoursData={workingHoursData}
        loading={isLoading}
      />
      {error && (
        <p className="mt-1 text-sm text-orange-600">
          {t("booking:workingHoursUnavailable", { error })}
        </p>
      )}
    </>
  );
}

export function WorkingHoursInfo({
  workingHoursData,
  loading,
  className,
}: {
  workingHoursData: UseWorkingHoursResult;
  loading: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <InfoBox className={tw("py-2", className)}>
        <div className="flex items-center gap-2">
          <div>{t("booking:loadingWorkingHours")}</div>
          <Spinner className="mt-1 size-4" />
        </div>
      </InfoBox>
    );
  }

  const { workingHours, error } = workingHoursData;
  if (!workingHours) return null;

  // Get working days from weekly schedule
  const workingDays: string[] = [];
  const dayNames = [
    t("booking:weekdays.sunday"),
    t("booking:weekdays.monday"),
    t("booking:weekdays.tuesday"),
    t("booking:weekdays.wednesday"),
    t("booking:weekdays.thursday"),
    t("booking:weekdays.friday"),
    t("booking:weekdays.saturday"),
  ];

  const workingDaySchedules: Array<{
    day: string;
    openTime: string;
    closeTime: string;
  }> = [];

  Object.entries(workingHours.weeklySchedule).forEach(
    ([dayNumber, schedule]) => {
      if (schedule.isOpen && schedule.openTime && schedule.closeTime) {
        const dayName = dayNames[parseInt(dayNumber)];
        workingDays.push(dayName);
        workingDaySchedules.push({
          day: dayName,
          openTime: schedule.openTime,
          closeTime: schedule.closeTime,
        });
      }
    }
  );

  // Check if all working days have the same hours
  const hasUniformHours =
    workingDaySchedules.length > 0 &&
    workingDaySchedules.every(
      (schedule) =>
        schedule.openTime === workingDaySchedules[0].openTime &&
        schedule.closeTime === workingDaySchedules[0].closeTime
    );

  const shouldShowWorkingHoursInfo = workingHours?.enabled && !error;
  return shouldShowWorkingHoursInfo ? (
    <InfoBox className={tw("py-2", className)}>
      {loading ? (
        <div className="flex items-center gap-2">
          <div>{t("booking:loadingWorkingHours")}</div>
          <Spinner className="mt-1 size-4" />
        </div>
      ) : (
        <div className="mt-1 text-sm text-gray-600">
          <p>
            <strong>{t("booking:workingDays")}</strong>{" "}
            {workingDays.length > 0
              ? workingDays.join(", ")
              : t("booking:none")}
          </p>
          {hasUniformHours ? (
            <p>
              <strong>{t("booking:workingHours")}</strong>{" "}
              <TimeDisplay time={workingDaySchedules[0].openTime} /> -{" "}
              <TimeDisplay time={workingDaySchedules[0].closeTime} />
            </p>
          ) : (
            <p>
              <strong>{t("booking:workingHours")}</strong>{" "}
              {t("booking:varyByDay")}
            </p>
          )}
          {workingHours.overrides.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {t("booking:specialDatesNote")}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {t("booking:locationLocalHours")}
          </p>
          <div className="shrink-0">
            <WorkingHoursPreviewDialog workingHoursData={workingHoursData} />
          </div>
        </div>
      )}
    </InfoBox>
  ) : null;
}
