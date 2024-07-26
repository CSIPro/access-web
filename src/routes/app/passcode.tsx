import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { MdAutoAwesome, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Header } from "@/components/header/header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useUserContext } from "@/context/user-context";
import { generatePasscode, PASSCODE_REGEX } from "@/lib/utils";

const PasscodeSchema = z.object({
  passcode: z
    .string({
      required_error: "Your passcode is required",
    })
    .min(4, {
      message: "Your passcode must be at least 4 characters long",
    })
    .max(10, {
      message: "Your passcode must be at most 10 characters long",
    })
    .regex(PASSCODE_REGEX, {
      message: "Your passcode must contain numbers and letters from A to D",
    }),
});
type PasscodeForm = z.infer<typeof PasscodeSchema>;

export const PasscodePage = () => {
  const navigate = useNavigate();
  const { submitPasscode } = useUserContext();
  const [showPasscode, setShowPasscode] = useState(false);

  const form = useForm<PasscodeForm>({
    defaultValues: { passcode: "" },
    resolver: zodResolver(PasscodeSchema),
  });
  const { mutate, isLoading } = useMutation<void, Error, string>(
    submitPasscode,
    {
      onSuccess: () => {
        form.reset();
        toast.success("Contraseña actualizada");
        navigate("/app");
      },
    },
  );

  const submit = async (data: PasscodeForm) => {
    if (isLoading) return;

    mutate(data.passcode);
  };

  const toggleShowPasscode = () => {
    setShowPasscode((prev) => !prev);
  };

  const autoGeneratePasscode = () => {
    form.setValue("passcode", generatePasscode());
    setShowPasscode(true);
  };

  const passcodeType = showPasscode ? "text" : "password";

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Contraseña" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <Form {...form}>
          <FormField
            control={form.control}
            name="passcode"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-white">Contraseña</FormLabel>
                <div className="flex w-full items-center gap-2">
                  <FormControl>
                    <Input
                      placeholder="A1B2C3"
                      type={passcodeType}
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    size="icon"
                    className="text-lg"
                    onClick={toggleShowPasscode}
                  >
                    {showPasscode ? <MdVisibility /> : <MdVisibilityOff />}
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    className="text-lg"
                    onClick={autoGeneratePasscode}
                  >
                    <MdAutoAwesome />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            onClick={isLoading ? undefined : form.handleSubmit(submit)}
          >
            {isLoading ? <LoadingSpinner /> : "Enviar"}
          </Button>
        </Form>
      </main>
    </div>
  );
};
