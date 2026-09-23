import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  AlarmClockIcon,
  BellIcon,
  BoxesIcon,
  CalendarRangeIcon,
  ChartLineIcon,
  ClipboardCheckIcon,
  FileBarChartIcon,
  HomeIcon,
  MapPinIcon,
  MessageCircleIcon,
  Package,
  PackageOpenIcon,
  QrCodeIcon,
  ScanBarcodeIcon,
  SettingsIcon,
  TagsIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { UpgradeMessage } from "~/components/marketing/upgrade-message";
import When from "~/components/when/when";
import type { loader } from "~/routes/_layout+/_layout";
import { isPersonalOrg } from "~/utils/organization";
import { useCurrentOrganization } from "./use-current-organization";
import { useUserRoleHelper } from "./user-user-role-helper";

type BaseNavItem = {
  id: string;
  title: string;
  hidden?: boolean;
  Icon: LucideIcon;
  disabled?: boolean | { reason: ReactNode };
  badge?: {
    show: boolean;
    variant?: "unread";
  };
};

export type ChildNavItem = BaseNavItem & {
  type: "child";
  to: string;
  target?: string;
};

export type ParentNavItem = BaseNavItem & {
  type: "parent";
  children: Omit<ChildNavItem, "type" | "Icon">[];
};

type LabelNavItem = Omit<BaseNavItem, "Icon"> & {
  type: "label";
};

type ButtonNavItem = BaseNavItem & {
  type: "button";
  onClick: () => void;
};

export type NavItem =
  | ChildNavItem
  | ParentNavItem
  | LabelNavItem
  | ButtonNavItem;

export function useSidebarNavItems() {
  const { t } = useTranslation();
  const { isAdmin, canUseBookings, subscription, unreadUpdatesCount } =
    useLoaderData<typeof loader>();
  const { isBaseOrSelfService } = useUserRoleHelper();
  const currentOrganization = useCurrentOrganization();
  const isPersonalOrganization = isPersonalOrg(currentOrganization);

  const bookingDisabled = useMemo(() => {
    if (canUseBookings) {
      return false;
    }

    return {
      reason: (
        <div>
          <h5>{t("navigation:disabled")}</h5>
          <p>{t("navigation:bookingPremiumOnly")}</p>

          <When truthy={!!subscription} fallback={<UpgradeMessage />}>
            <p>{t("navigation:switchToTeamWorkspace")}</p>
          </When>
        </div>
      ),
    };
  }, [canUseBookings, subscription, t]);

  /**
   * Personal workspaces can't invite registered users. Rather than hide the
   * "Users" / "Pending invites" items, we show them disabled with an upgrade
   * reason, mirroring how bookings are surfaced on Personal workspaces.
   */
  const teamInviteDisabled = useMemo(() => {
    if (!isPersonalOrganization) {
      return false;
    }

    return { reason: t("navigation:inviteTeamOnly") };
  }, [isPersonalOrganization, t]);

  const topMenuItems: NavItem[] = [
    {
      id: "admin-dashboard",
      type: "child",
      title: t("navigation:adminDashboard"),
      to: "/admin-dashboard/users",
      Icon: ChartLineIcon,
      hidden: !isAdmin,
    },
    {
      id: "asset-management",
      type: "label",
      title: t("navigation:assetManagement"),
    },
    {
      id: "home",
      type: "child",
      title: t("navigation:home"),
      to: "/home",
      Icon: HomeIcon,
      hidden: isBaseOrSelfService,
    },
    {
      id: "assets",
      type: "child",
      title: t("navigation:assets"),
      to: "/assets",
      Icon: PackageOpenIcon,
    },
    {
      id: "kits",
      type: "child",
      title: t("navigation:kits"),
      to: "/kits",
      Icon: Package,
    },
    {
      id: "categories",
      type: "child",
      title: t("navigation:categories"),
      to: "/categories",
      Icon: BoxesIcon,
      hidden: isBaseOrSelfService,
    },
    {
      id: "tags",
      type: "child",
      title: t("navigation:tags"),
      to: "/tags",
      Icon: TagsIcon,
      hidden: isBaseOrSelfService,
    },
    {
      id: "locations",
      type: "child",
      title: t("navigation:locations"),
      to: "/locations",
      Icon: MapPinIcon,
      hidden: isBaseOrSelfService,
    },
    {
      id: "audits",
      type: "child",
      title: t("navigation:audits"),
      to: "/audits",
      Icon: ClipboardCheckIcon,
    },
    {
      id: "bookings",
      type: "parent",
      title: t("navigation:bookings"),
      Icon: CalendarRangeIcon,
      disabled: bookingDisabled,
      children: [
        {
          id: "view-bookings",
          title: t("navigation:viewBookings"),
          to: "/bookings",
          disabled: bookingDisabled,
        },
        {
          id: "calendar",
          title: t("navigation:calendar"),
          to: "/calendar",
          disabled: bookingDisabled,
        },
      ],
    },
    {
      id: "reminders",
      type: "child",
      title: t("navigation:reminders"),
      Icon: AlarmClockIcon,
      hidden: isBaseOrSelfService,
      to: "/reminders",
    },
    {
      id: "reports",
      type: "child",
      title: t("navigation:reports"),
      Icon: FileBarChartIcon,
      hidden: isBaseOrSelfService,
      to: "/reports",
    },
    {
      id: "organization",
      type: "label",
      title: t("navigation:organization"),
      hidden: isBaseOrSelfService,
    },
    {
      id: "team",
      type: "parent",
      title: t("navigation:team"),
      Icon: UsersRoundIcon,
      hidden: isBaseOrSelfService,
      children: [
        {
          id: "users",
          title: t("navigation:users"),
          to: "/settings/team/users",
          disabled: teamInviteDisabled,
        },
        {
          id: "pending-invites",
          title: t("navigation:pendingInvites"),
          to: "/settings/team/invites",
          disabled: teamInviteDisabled,
        },
        {
          id: "non-registered-members",
          title: t("navigation:nonRegisteredMembers"),
          to: "/settings/team/nrm",
        },
      ],
    },
    {
      id: "workspace-settings",
      type: "parent",
      title: t("navigation:workspaceSettings"),
      Icon: SettingsIcon,
      hidden: isBaseOrSelfService,
      children: [
        {
          id: "general",
          title: t("navigation:general"),
          to: "/settings/general",
        },
        {
          id: "settings-bookings",
          title: t("navigation:bookings"),
          to: "/settings/bookings",
          hidden: isPersonalOrganization,
        },
        {
          id: "custom-fields",
          title: t("navigation:customFields"),
          to: "/settings/custom-fields",
        },
        {
          id: "asset-models",
          title: t("navigation:assetModels"),
          to: "/settings/asset-models",
        },
      ],
    },
  ];

  const bottomMenuItems: NavItem[] = [
    {
      id: "asset-labels",
      type: "child",
      title: t("navigation:assetLabels"),
      to: `https://store.shelf.nu/?ref=shelf_webapp_sidebar`,
      Icon: QrCodeIcon,
      target: "_blank",
    },
    {
      id: "qr-scanner",
      type: "child",
      title: t("navigation:qrScanner"),
      to: "/scanner",
      Icon: ScanBarcodeIcon,
    },
    {
      id: "updates",
      type: "button",
      title: t("navigation:updates"),
      Icon: BellIcon,
      badge: {
        show: (unreadUpdatesCount || 0) > 0,
        variant: "unread" as const,
      },
      onClick: () => {
        // This will be handled by the sidebar component with popover
      },
    },
    {
      id: "feedback",
      type: "button",
      title: t("navigation:feedback"),
      Icon: MessageCircleIcon,
      onClick: () => {
        // Handled by FeedbackNavItem in sidebar-nav.tsx
      },
    },
  ];

  return {
    topMenuItems: removeHiddenNavItems(topMenuItems),
    bottomMenuItems: removeHiddenNavItems(bottomMenuItems),
  };
}

function removeHiddenNavItems(navItems: NavItem[]) {
  return navItems
    .filter((item) => !item.hidden)
    .map((item) => {
      if (item.type === "parent") {
        return {
          ...item,
          children: item.children.filter((child) => !child.hidden),
        };
      }

      return item;
    });
}
