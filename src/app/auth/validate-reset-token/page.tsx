import { Suspense } from "react";
import ValidateResetTokenClient from "../../../components/ResetPasswordToken";

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <ValidateResetTokenClient />
    </Suspense>
  );
}
