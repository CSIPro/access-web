import { FC, ReactNode, createContext, useContext, useState } from "react";

interface Props {
  beatsRecord: boolean;
  setBeatsRecord: (beatsRecord: boolean) => void;
}

const TrackerItemContext = createContext<Props>({
  beatsRecord: false,
  setBeatsRecord: () => {},
});

export const TrackerItemProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [beatsRecord, setBeatsRecord] = useState(false);

  const updateBeatsRecord = (value: boolean) => setBeatsRecord(value);

  return (
    <TrackerItemContext.Provider
      value={{ beatsRecord, setBeatsRecord: updateBeatsRecord }}
    >
      {children}
    </TrackerItemContext.Provider>
  );
};

export const useTrackerItemContext = () => {
  return useContext(TrackerItemContext);
};
