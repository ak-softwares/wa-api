"use client";

import GenericMenu from "@/components/common/DropDownMenu";
import { useDeleteAccountDialog } from "@/hooks/profile/useDeleteAccount";
import { useResetPasswordDialog } from "@/hooks/profile/useResetPassword";

export default function ProfileMenu() {
  const { openResetDialog, ResetDialog } = useResetPasswordDialog();
  const { openDeleteDialog, DeleteAccountDialog } = useDeleteAccountDialog();

  const topItems = [
    { icon: "/assets/icons/info.svg", label: "Reset password", action: openResetDialog, },
  ];

  const bottomItems = [
    { icon: "/assets/icons/delete.svg", label: "Delete account", action: openDeleteDialog, danger: true },
  ];

  return (
    <>
      <GenericMenu topItems={topItems} bottomItems={bottomItems} />
      {ResetDialog}
      {DeleteAccountDialog}
    </>
  );
}
