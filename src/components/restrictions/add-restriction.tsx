import { IoAddCircle } from "react-icons/io5";
import { Link } from "react-router-dom";

export const AddRestriction = () => {
  return (
    <Link
      to="/app/restrictions/create"
      className="flex w-full items-center justify-center rounded bg-primary/20 p-2"
    >
      <IoAddCircle className="size-10 text-primary" />
    </Link>
  );
};
