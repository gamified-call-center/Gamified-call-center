// import PremiumLogin from "@/components/Login";
// import { Suspense } from "react";

// export default function Login() {
//   return (
//     <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
//       <PremiumLogin/>
//     </Suspense>
//   );
// }

import PremiumLogin from "@/components/Login"; // your login component

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const reset = searchParams?.reset;
  const resetSuccess = reset === "success";

  return <PremiumLogin resetSuccess={resetSuccess} />;
}
