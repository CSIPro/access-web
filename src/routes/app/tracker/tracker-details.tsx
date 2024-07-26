import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { useContext, useState } from "react";
import { BiEditAlt, BiReset } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { IoPerson, IoTime } from "react-icons/io5";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "reactfire";

import { Header } from "@/components/header/header";
import {
  TrackerResponse,
  TrackerTimer,
} from "@/components/trackers/tracker-item";
import { TrackerLapses } from "@/components/trackers/tracker-lapses";
import {
  AddParticipants,
  TrackerParticipants,
} from "@/components/trackers/tracker-participants";
import { BrandingHeader } from "@/components/ui/branding-header";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/spinner";
import { RoleContext } from "@/context/role-context";
import { UserContext } from "@/context/user-context";
import { findRole, formatRecord } from "@/lib/utils";

export const TrackerDetails = () => {
  const params = useParams();

  const [showParticipants, setShowParticipants] = useState(false);
  const [showLapses, setShowLapses] = useState(false);

  const roleCtx = useContext(RoleContext);
  const userCtx = useContext(UserContext);

  const auth = useAuth();
  const { status, data } = useQuery({
    queryKey: ["tracker", params.trackerId],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_ACCESS_API_URL}/api/trackers/${
          params.trackerId
        }?include=resetBy,updatedBy,creator`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        },
      );

      const data = await res.json();
      const tracker = TrackerResponse.parse(data);

      return tracker.tracker;
    },
  });

  if (status === "loading") {
    return (
      <>
        <Header title="Tracker Details" backTo="/app/tracker" />
        <div className="flex min-h-screen w-full items-center justify-center">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header title="Tracker Details" backTo="/app/tracker" />
        <div className="flex min-h-screen w-full items-center justify-center gap-2 rounded-sm border-2 border-primary bg-primary-16 p-2 text-white">
          Tracker not found
        </div>
      </>
    );
  }

  const userRole = findRole(userCtx.user?.role, roleCtx.roles);
  const hasPrivileges =
    auth.currentUser?.uid === data.createdById || (userRole?.level ?? 0) >= 40;

  const creationDate = new Timestamp(
    data.createdAt._seconds,
    data.createdAt._nanoseconds,
  ).toDate();

  const formattedCreationDate = format(creationDate, "yyyy/MM/dd HH:mm");

  const updateDate = new Timestamp(
    data.updatedAt._seconds,
    data.updatedAt._nanoseconds,
  ).toDate();

  const formattedUpdateDate = format(updateDate, "yyyy/MM/dd HH:mm");

  const resetDate = data.resetAt
    ? new Timestamp(data.resetAt._seconds, data.resetAt._nanoseconds).toDate()
    : null;

  const formattedResetDate = resetDate
    ? format(resetDate, "yyyy/MM/dd HH:mm")
    : "N/A";

  return (
    <>
      <Header title="Tracker Details" backTo="/app/tracker" />
      <div className="flex min-h-screen w-full flex-col items-center gap-2 bg-muted p-2 font-sans">
        <h1 className="text-center text-2xl">{data.name}</h1>
        <div className="flex w-full items-center justify-center">
          <TrackerTimer
            id={data.id}
            timeReference={data.timeReference}
            record={data.record}
            size="large"
          />
        </div>
        <span className="h-1 w-full rounded-full bg-primary"></span>
        <div className="flex w-full flex-col gap-2">
          <BrandingHeader highlight="Specs">Tracker</BrandingHeader>
          <div className="grid grid-cols-2 gap-2 text-lg">
            <div className="col-span-full flex flex-col items-center justify-center gap-1 rounded-md border-2 border-primary bg-primary-08 px-2 py-1 text-2xl">
              <div className="flex items-center justify-center gap-1">
                <FaStar />
                <span>Record</span>
              </div>
              <span>{data.record ? formatRecord(data.record) : "N/A"}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border-2 border-primary bg-primary-08 px-2 py-1">
              <div className="flex items-center justify-center gap-1">
                <IoPerson />
                <span>Created by</span>
              </div>
              <span>{data.creator?.name ?? "Unknown"}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border-2 border-primary bg-primary-08 px-2 py-1">
              <div className="flex items-center justify-center gap-1">
                <IoTime />
                <span>Created at</span>
              </div>
              <span>{formattedCreationDate}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border-2 border-primary bg-primary-08 px-2 py-1">
              <div className="flex items-center justify-center gap-1">
                <BiReset />
                <span>Reset by</span>
              </div>
              <span>{data.resetBy?.name ?? "Unknown"}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border-2 border-primary bg-primary-08 px-2 py-1">
              <div className="flex items-center justify-center gap-1">
                <IoTime />
                <span>Reset at</span>
              </div>
              <span>{formattedResetDate}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border-2 border-primary bg-primary-08 px-2 py-1">
              <div className="flex items-center justify-center gap-1">
                <BiEditAlt />
                <span>Updated by</span>
              </div>
              <span>{data.updatedBy?.name ?? "Unknown"}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-md border-2 border-primary bg-primary-08 px-2 py-1">
              <div className="flex items-center justify-center gap-1">
                <IoTime />
                <span>Updated at</span>
              </div>
              <span>{formattedUpdateDate}</span>
            </div>
          </div>
          {hasPrivileges ? (
            <>
              <BrandingHeader highlight="Trackers">Time</BrandingHeader>
              {showParticipants ? (
                <>
                  <p className="">
                    Admins and moderators also have access to this tracker.
                  </p>
                  <TrackerParticipants trackerId={data.id} />
                  <div className="flex gap-2">
                    <AddParticipants
                      trackerId={data.id}
                      participants={data.participants}
                    />
                  </div>
                </>
              ) : (
                <Button
                  onClick={() => setShowParticipants(true)}
                  className="bg-primary hover:bg-primary hover:brightness-110 focus:bg-primary focus:brightness-110 active:bg-primary active:brightness-110"
                >
                  Load participants
                </Button>
              )}
              <BrandingHeader highlight="Lapses">Time</BrandingHeader>
              {showLapses ? (
                <TrackerLapses trackerId={data.id} />
              ) : (
                <Button
                  onClick={() => setShowLapses(true)}
                  className="bg-primary hover:bg-primary hover:brightness-110 focus:bg-primary focus:brightness-110 active:bg-primary active:brightness-110"
                >
                  Load time lapses
                </Button>
              )}
            </>
          ) : (
            <p className="text-center">
              Some features have been disabled due to their computational cost
            </p>
          )}
        </div>
        <div className="h-[50vh]"></div>
      </div>
    </>
  );
};
