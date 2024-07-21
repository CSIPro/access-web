import { FC } from "react";

import {
  DashboardItem,
  DashboardItemData,
  DashboardItemTitle,
} from "./dashboard-item";

interface Props {
  value?: number;
}

export const SuccessfulAttempts: FC<Props> = ({ value = 0 }) => {
  return (
    <DashboardItem color="primary">
      <DashboardItemData size="large">
        {value.toString().padStart(2, "0")}
      </DashboardItemData>
      <DashboardItemTitle>Entries</DashboardItemTitle>
    </DashboardItem>
  );
};

export const BluetoothAttempts: FC<Props> = ({ value = 0 }) => {
  return (
    <DashboardItem color="tertiary">
      <DashboardItemData>
        {value.toString().padStart(2, "0") || "00"}
      </DashboardItemData>
      <DashboardItemTitle>Wireless</DashboardItemTitle>
    </DashboardItem>
  );
};

export const FailedAttempts: FC<Props> = ({ value = 0 }) => {
  return (
    <DashboardItem color="secondary">
      <DashboardItemData>
        {value.toString().padStart(2, "0") || "00"}
      </DashboardItemData>
      <DashboardItemTitle>Failed</DashboardItemTitle>
    </DashboardItem>
  );
};
