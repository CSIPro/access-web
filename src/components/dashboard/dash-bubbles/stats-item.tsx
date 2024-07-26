import { FC } from "react";
import { FaBluetooth } from "react-icons/fa";
import { IoCloseCircle, IoShieldCheckmark } from "react-icons/io5";

import {
  DashboardItem,
  DashboardItemBackground,
  DashboardItemData,
  DashboardItemTitle,
} from "./dashboard-item";

interface Props {
  value?: number;
}

export const SuccessfulAttempts: FC<Props> = ({ value = 0 }) => {
  return (
    <DashboardItem color="primary">
      <DashboardItemBackground iconSize="large">
        <IoShieldCheckmark />
      </DashboardItemBackground>
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
      <DashboardItemBackground>
        <FaBluetooth />
      </DashboardItemBackground>
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
      <DashboardItemBackground>
        <IoCloseCircle />
      </DashboardItemBackground>
      <DashboardItemData>
        {value.toString().padStart(2, "0") || "00"}
      </DashboardItemData>
      <DashboardItemTitle>Failed</DashboardItemTitle>
    </DashboardItem>
  );
};
