'use client';

import { withAuth } from "@/utils/withAuth";
import { useRouter } from "next/navigation";
import Loading from "./loading";
function LandingPage() {
  const router = useRouter();
   
  router.push('/voting')
    return <Loading />;
}

export default withAuth(LandingPage);